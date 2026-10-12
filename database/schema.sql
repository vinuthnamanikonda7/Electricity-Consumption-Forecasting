-- ====================================================================
-- Electricity Consumption Forecasting & Energy Management System
-- Full Database Schema Definition for MySQL Server
-- ====================================================================

CREATE DATABASE IF NOT EXISTS electricity_forecasting
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE electricity_forecasting;

-- 1. Users Table (with Role & Verification)
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

-- 2. OTP Verification Codes Table
CREATE TABLE IF NOT EXISTS otp_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_lookup (email, otp_code, is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. House Architectural Details Table
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

-- 4. Electrical Appliances Inventory Table
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

-- 5. Multi-Variable Predictions Table
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

-- 6. Energy-Saving Recommendations Table
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

-- 7. Electricity Meter Readings Table (Historical Logs)
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

-- 8. Moving Average Forecasts Table
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
