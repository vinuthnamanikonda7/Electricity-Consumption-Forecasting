const express = require('express');
const router = express.Router();
const {
  sendOtp,
  register,
  verifyOtp,
  loginWithPassword,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public OTP & Auth routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', verifyOtp); // Supports OTP login
router.post('/login-password', loginWithPassword);

// Protected routes
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
