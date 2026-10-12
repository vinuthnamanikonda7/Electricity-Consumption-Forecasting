const { pool } = require('../config/db');

/**
 * Log administrative actions into admin_logs database table
 */
const logAdminAction = async ({ adminId = null, adminEmail = 'admin@electricity.com', actionType, description, targetId = null, ipAddress = '127.0.0.1' }) => {
  try {
    await pool.query(
      'INSERT INTO admin_logs (admin_id, admin_email, action_type, description, target_id, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [adminId, adminEmail, actionType, description, targetId, ipAddress]
    );
  } catch (err) {
    console.error('Error recording admin audit log:', err.message);
  }
};

/**
 * Fetch all admin audit logs
 */
const getAdminLogs = async (limit = 100) => {
  try {
    const [logs] = await pool.query(
      'SELECT id, admin_id, admin_email, action_type, description, target_id, ip_address, created_at FROM admin_logs ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return logs;
  } catch (err) {
    console.error('Error fetching admin logs:', err.message);
    return [];
  }
};

module.exports = {
  logAdminAction,
  getAdminLogs
};
