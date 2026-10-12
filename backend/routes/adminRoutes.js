const express = require('express');
const router = express.Router();
const {
  getAdminMetrics,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  getSystemReports,
  triggerBackup,
  getAdminActionLogs,
  getContactMessages,
  updateMessageStatus,
  deleteContactMessage
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// All Admin routes require both authentication and Admin role
router.use(verifyToken);
router.use(requireAdmin);

router.get('/metrics', getAdminMetrics);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserByAdmin);
router.delete('/users/:id', deleteUserByAdmin);
router.get('/reports', getSystemReports);
router.post('/backup', triggerBackup);
router.get('/logs', getAdminActionLogs);

// Contact message endpoints
router.get('/messages', getContactMessages);
router.put('/messages/:id', updateMessageStatus);
router.delete('/messages/:id', deleteContactMessage);

module.exports = router;
