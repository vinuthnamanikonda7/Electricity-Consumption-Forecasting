const { pool } = require('../config/db');
const BackupService = require('../services/backupService');
const { logAdminAction, getAdminLogs } = require('../services/adminLogService');

/**
 * @route   GET /api/admin/metrics
 * @desc    System-wide overview metrics for administrator
 */
const getAdminMetrics = async (req, res, next) => {
  try {
    const [[usersCount]] = await pool.query('SELECT COUNT(*) as total_users FROM users');
    const [[householdsCount]] = await pool.query(
      'SELECT COUNT(*) as total_households FROM users WHERE role = ?',
      ['household']
    );
    const [[appliancesCount]] = await pool.query('SELECT COUNT(*) as total_appliances FROM appliances');
    const [[predictionsCount]] = await pool.query('SELECT COUNT(*) as total_predictions FROM predictions');
    const [[readingsCount]] = await pool.query('SELECT COUNT(*) as total_readings FROM electricity_readings');
    const [[totalPredictedKwh]] = await pool.query('SELECT COALESCE(SUM(predicted_monthly_kwh), 0) as total_load, COALESCE(AVG(predicted_monthly_kwh), 0) as avg_load FROM predictions');

    // Recent 10 system activity predictions
    const [recentPredictions] = await pool.query(
      `SELECT p.id, p.user_id, u.name as user_name, u.email as user_email, p.predicted_monthly_kwh, p.estimated_cost, p.created_at 
       FROM predictions p 
       JOIN users u ON p.user_id = u.id 
       ORDER BY p.created_at DESC 
       LIMIT 10`
    );

    // Distribution of ventilation ratings
    const [ventilationStats] = await pool.query(
      `SELECT ventilation, COUNT(*) as count FROM house_details GROUP BY ventilation`
    );

    res.status(200).json({
      success: true,
      metrics: {
        total_users: usersCount.total_users,
        total_households: householdsCount.total_households,
        total_appliances: appliancesCount.total_appliances,
        total_predictions: predictionsCount.total_predictions,
        total_readings: readingsCount.total_readings,
        system_total_predicted_load_kwh: parseFloat(parseFloat(totalPredictedKwh.total_load).toFixed(2)),
        average_household_monthly_kwh: parseFloat(parseFloat(totalPredictedKwh.avg_load).toFixed(2)),
        recent_activity: recentPredictions,
        ventilation_distribution: ventilationStats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all household users with profile status and appliance counts (strictly filters households)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role = 'household' } = req.query;

    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.role, 
        u.is_verified, 
        u.created_at,
        h.num_rooms, 
        h.room_height_ft, 
        h.ventilation, 
        h.house_size_sqft,
        h.address,
        (SELECT COUNT(*) FROM appliances a WHERE a.user_id = u.id) as appliance_count,
        (SELECT COUNT(*) FROM predictions p WHERE p.user_id = u.id) as prediction_count
      FROM users u
      LEFT JOIN house_details h ON u.id = h.user_id
      WHERE u.role = ?
    `;

    const params = [role];
    if (search && search.trim()) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR h.address LIKE ?)`;
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    query += ` ORDER BY u.created_at DESC`;

    const [users] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details, role, or verification status (Admin only)
 */
const updateUserByAdmin = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const { name, email, phone, role, is_verified } = req.body;

    const [existing] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [targetUserId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name.trim()); }
    if (email) { updates.push('email = ?'); params.push(email.toLowerCase().trim()); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone ? phone.trim() : null); }
    if (role) { updates.push('role = ?'); params.push(role); }
    if (is_verified !== undefined) { updates.push('is_verified = ?'); params.push(is_verified ? 1 : 0); }

    if (updates.length > 0) {
      params.push(targetUserId);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query('SELECT id, name, email, phone, role, is_verified, created_at FROM users WHERE id = ?', [targetUserId]);

    // Record admin action log
    await logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'UPDATE_HOUSEHOLD_USER',
      description: `Updated profile for user ID ${targetUserId} (${updated[0]?.email}). Modifications: ${updates.join(', ')}`,
      targetId: targetUserId,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    res.status(200).json({
      success: true,
      message: 'User account updated successfully.',
      user: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete inactive user account
 */
const deleteUserByAdmin = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    // Prevent deleting oneself
    if (parseInt(targetUserId, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Administrators cannot delete their own active account.' });
    }

    const [existing] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [targetUserId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userToDelete = existing[0];
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [targetUserId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Record admin action log
    await logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'DELETE_HOUSEHOLD_USER',
      description: `Deleted household user ${userToDelete.name} (${userToDelete.email}) and all associated records from the database.`,
      targetId: targetUserId,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    res.status(200).json({
      success: true,
      message: 'User account and associated records deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/reports
 * @desc    Get detailed system prediction reports for compliance & monitoring
 */
const getSystemReports = async (req, res, next) => {
  try {
    const [reports] = await pool.query(`
      SELECT 
        p.id,
        p.id as prediction_id,
        p.user_id,
        u.name as user_name,
        u.email as user_email,
        u.phone,
        h.num_rooms,
        h.room_height_ft,
        h.ventilation,
        p.predicted_monthly_kwh,
        p.estimated_cost,
        p.model_name,
        p.category_breakdown,
        p.created_at,
        'Prediction Record' as type
      FROM predictions p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN house_details h ON u.id = h.user_id
      ORDER BY p.created_at DESC
    `);

    const formatted = reports.map(r => {
      let breakdown = null;
      if (r.category_breakdown) {
        if (typeof r.category_breakdown === 'object') {
          breakdown = r.category_breakdown;
        } else {
          try {
            breakdown = JSON.parse(r.category_breakdown);
          } catch (e) {
            breakdown = null;
          }
        }
      }
      return {
        ...r,
        category_breakdown: breakdown
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      reports: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/backup
 * @desc    Trigger instant SQL database backup
 */
const triggerBackup = async (req, res, next) => {
  try {
    const backupResult = await BackupService.performBackup();

    // Record admin action log
    await logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'DATABASE_BACKUP',
      description: `Generated complete MySQL database SQL backup file: ${backupResult.filename}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    res.status(200).json({
      success: true,
      message: 'Database backup generated successfully!',
      backup: backupResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/logs
 * @desc    Get all administrative action and audit logs
 */
const getAdminActionLogs = async (req, res, next) => {
  try {
    const logs = await getAdminLogs(200);
    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/contact
 * @desc    Submit a contact message (Public / Household)
 */
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message, status) 
       VALUES (?, ?, ?, ?, 'unread')`,
      [name.trim(), email.toLowerCase().trim(), subject ? subject.trim() : 'General Inquiry', message.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been received! Our support team will review it shortly.',
      message_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/messages
 * @desc    Get all submitted contact messages for Administrator
 */
const getContactMessages = async (req, res, next) => {
  try {
    const [messages] = await pool.query(
      `SELECT id, name, email, subject, message, status, created_at 
       FROM contact_messages 
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/messages/:id
 * @desc    Update status of contact message (e.g. mark as read or replied)
 */
const updateMessageStatus = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const { status } = req.body;

    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    await pool.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, messageId]);

    // Record admin action log
    await logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'UPDATE_INQUIRY_STATUS',
      description: `Updated status of contact message #${messageId} to '${status}'.`,
      targetId: messageId,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/messages/:id
 * @desc    Delete contact message
 */
const deleteContactMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    await pool.query('DELETE FROM contact_messages WHERE id = ?', [messageId]);

    // Record admin action log
    await logAdminAction({
      adminId: req.user.id,
      adminEmail: req.user.email,
      actionType: 'DELETE_INQUIRY',
      description: `Deleted contact message #${messageId} from system inbox.`,
      targetId: messageId,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    res.status(200).json({
      success: true,
      message: 'Contact inquiry deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminMetrics,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  getSystemReports,
  triggerBackup,
  getAdminActionLogs,
  submitContactMessage,
  getContactMessages,
  updateMessageStatus,
  deleteContactMessage
};
