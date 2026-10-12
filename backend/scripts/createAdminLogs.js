const { pool } = require('../config/db');

async function setupAdminLogs() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_id INT NULL,
        admin_email VARCHAR(150) NOT NULL,
        action_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        target_id INT NULL,
        ip_address VARCHAR(50) DEFAULT '127.0.0.1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin_logs_date (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ admin_logs table created successfully in MySQL database!');
  } catch (err) {
    console.error('Error creating admin_logs table:', err);
  } finally {
    process.exit();
  }
}

setupAdminLogs();
