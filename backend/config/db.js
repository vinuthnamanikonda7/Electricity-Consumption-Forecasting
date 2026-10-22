const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mysqlSslMode = (process.env.MYSQL_SSL_MODE || '').toUpperCase();
const sslConfig = process.env.DB_SSL === 'true' || mysqlSslMode === 'REQUIRED'
  ? { rejectUnauthorized: false }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'electricity_forecasting',
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true
});

/**
 * Initializes the MySQL database and ensures all required tables exist.
 */
async function initDB() {
  try {
    const dbName = process.env.DB_NAME || 'electricity_forecasting';

    // Safely try creating database locally if user has global CREATE privileges
    try {
      const tempConnection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        ssl: sslConfig
      });
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await tempConnection.end();
    } catch (e) {
      // Allowed: On managed cloud MySQL (Aiven, TiDB), the database is pre-created by the provider
    }

    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL database "${dbName}".`);

    // 1. Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(40) DEFAULT NULL,
        role ENUM('household', 'admin') NOT NULL DEFAULT 'household',
        is_verified TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (email),
        INDEX idx_user_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Add missing columns if users table existed previously with older schema
    try { await connection.query("ALTER TABLE users ADD COLUMN phone VARCHAR(40) DEFAULT NULL"); } catch(e) {}
    try { await connection.query("ALTER TABLE users ADD COLUMN role ENUM('household', 'admin') NOT NULL DEFAULT 'household'"); } catch(e) {}
    try { await connection.query("ALTER TABLE users ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0"); } catch(e) {}

    // 2. OTP Codes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(150) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        is_used TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_otp_lookup (email, otp_code, is_used)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. House Architectural Details Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS house_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        num_rooms INT NOT NULL DEFAULT 3,
        room_height_ft DECIMAL(4,1) NOT NULL DEFAULT 10.0,
        ventilation ENUM('Good', 'Moderate', 'Poor') NOT NULL DEFAULT 'Moderate',
        house_size_sqft INT DEFAULT 1200,
        occupants_count INT DEFAULT 4,
        address VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_house_user FOREIGN KEY (user_id) 
            REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_house_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Appliances Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appliances (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        appliance_type VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        power_rating_watts DECIMAL(8,2) NOT NULL,
        daily_usage_hours DECIMAL(4,2) NOT NULL,
        star_rating INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_appliances_user FOREIGN KEY (user_id) 
            REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_appliances_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Predictions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        predicted_monthly_kwh DECIMAL(10,2) NOT NULL,
        estimated_cost DECIMAL(10,2) NOT NULL,
        load_factor DECIMAL(5,2) DEFAULT 1.0,
        ventilation_factor DECIMAL(5,2) DEFAULT 1.0,
        height_factor DECIMAL(5,2) DEFAULT 1.0,
        category_breakdown JSON DEFAULT NULL,
        model_name VARCHAR(100) DEFAULT 'Physics-Appliance Hybrid Engine',
        notes VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_predictions_user FOREIGN KEY (user_id) 
            REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_predictions_user (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Energy-Saving Recommendations Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recommendations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        prediction_id INT DEFAULT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        estimated_kwh_savings DECIMAL(8,2) NOT NULL,
        estimated_cost_savings DECIMAL(8,2) NOT NULL,
        priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
        is_applied TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_recom_user FOREIGN KEY (user_id) 
            REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_recom_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Electricity Readings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS electricity_readings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        reading_date DATE NOT NULL,
        consumption DECIMAL(10,2) NOT NULL,
        units VARCHAR(20) DEFAULT 'kWh',
        notes VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_readings_user FOREIGN KEY (user_id) 
            REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_user_date (user_id, reading_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Forecasts Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS forecasts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        forecast_date DATE NOT NULL,
        predicted_consumption DECIMAL(10,2) NOT NULL,
        model_name VARCHAR(100) DEFAULT 'Moving Average',
        horizon_days INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_forecasts_user FOREIGN KEY (user_id) 
            REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_user_forecast (user_id, forecast_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Contact Messages Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject VARCHAR(200) DEFAULT 'General Inquiry',
        message TEXT NOT NULL,
        status ENUM('unread', 'read', 'replied') NOT NULL DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. Administrator Action & Security Audit Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_id INT DEFAULT NULL,
        admin_email VARCHAR(150) NOT NULL DEFAULT 'admin@electricity.com',
        action_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        target_id VARCHAR(100) DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT '127.0.0.1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin_logs_type (action_type),
        INDEX idx_admin_logs_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed or update default Admin accounts (both admin@electricity.com and admin@electroforecast.local with Password: Admin#2024)
    // Hash for "Admin#2024": $2a$10$ljHF6lJGM.DZrYmBGdr5jeeoEqg39mvBzxR3kvAzWavij/LccmDgm
    const adminHash = '$2a$10$ljHF6lJGM.DZrYmBGdr5jeeoEqg39mvBzxR3kvAzWavij/LccmDgm';
    
    const [adminCheck] = await connection.query('SELECT id FROM users WHERE email IN (?, ?) LIMIT 1', ['admin@electricity.com', 'admin@electroforecast.local']);
    if (adminCheck.length === 0) {
      await connection.query(`
        INSERT INTO users (name, email, password, phone, role, is_verified) 
        VALUES ('System Admin', 'admin@electricity.com', ?, '+1 (555) 019-2834', 'admin', 1)
      `, [adminHash]);
      console.log('[Database] Seeded default administrator account: admin@electricity.com (Password: Admin#2024)');
    } else {
      // Ensure existing admin has the updated password and verified status
      await connection.query(`
        UPDATE users 
        SET password = ?, role = 'admin', is_verified = 1 
        WHERE id = ?
      `, [adminHash, adminCheck[0].id]);
    }

    console.log('[Database] All 8 database tables verified successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error('[Database Error] Failed to initialize MySQL database:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  initDB
};
