const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');

// Dashboard routes are protected
router.use(verifyToken);

router.get('/summary', getDashboardSummary);

module.exports = router;
