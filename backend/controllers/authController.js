const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { sendOtpEmail } = require('../services/emailService');
const { logAdminAction } = require('../services/adminLogService');

/**
 * Helper to generate 6-digit numeric OTP
 */
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate JWT token containing user ID, email, name, and role
 */
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'household'
    },
    secret,
    { expiresIn: '7d' }
  );
};

/**
 * @route   POST /api/auth/send-otp
 * @desc    Generate and dispatch 6-digit OTP to user email via Resend
 */
const sendOtp = async (req, res, next) => {
  try {
    const { email, purpose = 'login' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // When logging in with OTP, check if the email is registered
    const [existing] = await pool.query('SELECT id, name, is_verified FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
    if (purpose === 'login' && existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'This email is not registered yet. Please create a new account first.'
      });
    }

    const otp = generateOtpCode();

    // Store OTP in database with 15 minutes expiry using MySQL NOW()
    await pool.query(
      'INSERT INTO otp_codes (email, otp_code, expires_at, is_used) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0)',
      [cleanEmail, otp]
    );

    const userName = existing.length > 0 ? existing[0].name : '';

    // Dispatch email via Brevo API
    const emailResult = await sendOtpEmail(cleanEmail, otp, purpose, userName);

    res.status(200).json({
      success: true,
      email_sent: emailResult.success,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox.`,
      dev_otp: !emailResult.success ? otp : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new household user and generate verification OTP via Brevo
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, num_rooms, house_size_sqft, ventilation } = req.body;

    // Validate all required registration fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full Name is required.'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email Address is required.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters long.'
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.'
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: 'House address is required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existing] = await pool.query('SELECT id, is_verified FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please login instead.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Strictly assign household role for public registration
    const role = 'household';

    // Insert user into database
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, role, is_verified) VALUES (?, ?, ?, ?, ?, 0)',
      [name.trim(), cleanEmail, hashedPassword, phone.trim(), role]
    );

    const userId = result.insertId;

    // Create default house details row for the user with optional custom parameters
    await pool.query(
      'INSERT INTO house_details (user_id, num_rooms, room_height_ft, ventilation, house_size_sqft, occupants_count, address) VALUES (?, ?, 10.0, ?, ?, 4, ?)',
      [
        userId,
        parseInt(num_rooms, 10) || 3,
        ventilation || 'Moderate',
        parseInt(house_size_sqft, 10) || 1200,
        address.trim()
      ]
    );

    // Generate and store OTP with 15 minutes expiry using MySQL NOW()
    const otp = generateOtpCode();
    await pool.query(
      'INSERT INTO otp_codes (email, otp_code, expires_at, is_used) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0)',
      [cleanEmail, otp]
    );

    // Dispatch email via Brevo API
    const emailResult = await sendOtpEmail(cleanEmail, otp, 'registration', name.trim());

    res.status(201).json({
      success: true,
      email_sent: emailResult.success,
      message: 'Account created! Please check your email for the 6-digit verification code.',
      email: cleanEmail,
      dev_otp: !emailResult.success ? otp : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for Registration or Passwordless Login
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp_code } = req.body;

    if (!email || !otp_code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and 6-digit OTP code.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp_code.trim();

    // Check OTP in database and check if valid against NOW()
    const [records] = await pool.query(
      'SELECT id, otp_code, (expires_at >= NOW()) as is_not_expired, is_used FROM otp_codes WHERE email = ? AND is_used = 0 ORDER BY id DESC LIMIT 1',
      [cleanEmail]
    );

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active verification code found for this email. Please request a new OTP.'
      });
    }

    const record = records[0];

    // Check expiration
    if (!record.is_not_expired) {
      return res.status(400).json({
        success: false,
        message: 'The verification code has expired. Please request a new one.'
      });
    }

    // Compare code
    if (record.otp_code !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please enter the correct 6-digit code.'
      });
    }

    // Mark OTP as used
    await pool.query('UPDATE otp_codes SET is_used = 1 WHERE id = ?', [record.id]);

    // Fetch user or activate if pending verification
    let [users] = await pool.query(
      'SELECT id, name, email, phone, role, is_verified, created_at FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'This email is not registered yet. Please create an account first.'
      });
    }

    const user = users[0];
    if (!user.is_verified) {
      await pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [user.id]);
      user.is_verified = 1;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Verification successful! Welcome to the Electricity Forecasting System.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login-password
 * @desc    Standard Login with Email/Login-ID and Password (supports Household and Admin)
 */
const loginWithPassword = async (req, res, next) => {
  try {
    const { email, loginId, password, portal } = req.body;
    const identifier = (loginId || email || '').toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Login ID / Email and password.'
      });
    }

    // Support lookup by exact email OR admin alias (e.g. 'admin' or 'admin@electricity.com' or 'admin@electroforecast.local')
    const [users] = await pool.query(
      `SELECT id, name, email, password, phone, role, is_verified, created_at 
       FROM users 
       WHERE email = ? 
          OR (role = 'admin' AND ? IN ('admin', 'administrator', 'system admin', 'root'))
       LIMIT 1`,
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: portal === 'admin' 
          ? 'Administrator account not found. Please verify your Login ID.' 
          : 'This email is not registered yet. Please register first.'
      });
    }

    const user = users[0];

    // If logging into the dedicated Admin Portal, verify user is an Administrator
    if (portal === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: This portal is restricted to Administrator accounts only.'
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was registered using Email OTP. Please log in using the OTP tab.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: portal === 'admin'
          ? 'Invalid Administrator Password. Please verify and try again.'
          : 'Invalid password. Please check your credentials and try again.'
      });
    }

    const token = generateToken(user);

    // Record admin login in audit logs
    if (user.role === 'admin') {
      await logAdminAction({
        adminId: user.id,
        adminEmail: user.email,
        actionType: 'ADMIN_LOGIN',
        description: `Administrator ${user.name} (${user.email}) logged into the Admin Portal successfully.`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile, house details, and summary stats
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, is_verified, created_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    const [house] = await pool.query('SELECT * FROM house_details WHERE user_id = ? LIMIT 1', [userId]);
    const [[appliancesCount]] = await pool.query('SELECT COUNT(*) as count FROM appliances WHERE user_id = ?', [userId]);
    const [[predictionsCount]] = await pool.query('SELECT COUNT(*) as count FROM predictions WHERE user_id = ?', [userId]);
    const [[recommendationsCount]] = await pool.query('SELECT COUNT(*) as count FROM recommendations WHERE user_id = ?', [userId]);
    const [[readingsCount]] = await pool.query('SELECT COUNT(*) as count FROM electricity_readings WHERE user_id = ?', [userId]);

    res.status(200).json({
      success: true,
      user: {
        ...user,
        house_details: house.length > 0 ? house[0] : null,
        total_appliances: appliancesCount.count,
        total_predictions: predictionsCount.count,
        total_recommendations: recommendationsCount.count,
        total_readings: readingsCount.count
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile details
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, currentPassword, newPassword } = req.body;

    const updates = [];
    const params = [];

    if (name && name.trim()) {
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone ? phone.trim() : null);
    }

    const isPasswordChangeRequested = currentPassword !== undefined || newPassword !== undefined;
    if (isPasswordChangeRequested) {
      if (typeof currentPassword !== 'string' || !currentPassword ||
          typeof newPassword !== 'string' || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both your current password and a new password.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.'
        });
      }

      const [users] = await pool.query('SELECT password FROM users WHERE id = ? LIMIT 1', [userId]);
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      if (!users[0].password || !(await bcrypt.compare(currentPassword, users[0].password))) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updates.push('password = ?');
      params.push(hashedPassword);
    }

    if (updates.length > 0) {
      params.push(userId);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updatedUsers] = await pool.query(
      'SELECT id, name, email, phone, role, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUsers[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOtp,
  register,
  verifyOtp,
  loginWithPassword,
  getMe,
  updateProfile
};
