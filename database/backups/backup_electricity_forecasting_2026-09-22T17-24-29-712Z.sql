-- Electricity Forecasting Database Backup
-- Generated At: 2026-09-22T17:24:29.717Z

SET FOREIGN_KEY_CHECKS = 0;

-- Table: appliances
DROP TABLE IF EXISTS `appliances`;
CREATE TABLE `appliances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `appliance_type` varchar(100) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `power_rating_watts` decimal(8,2) NOT NULL,
  `daily_usage_hours` decimal(4,2) NOT NULL,
  `star_rating` int DEFAULT '3',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_appliances_user` (`user_id`),
  CONSTRAINT `fk_appliances_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `appliances` (`id`, `user_id`, `appliance_type`, `quantity`, `power_rating_watts`, `daily_usage_hours`, `star_rating`, `created_at`, `updated_at`) VALUES
(1, 4, 'Inverter Air Conditioner (1.5 Ton)', 1, '1400.00', '5.60', 5, '2026-09-22 20:44:28', '2026-09-22 20:44:28'),
(2, 4, 'Double Door Refrigerator (350L)', 1, '220.00', '23.60', 4, '2026-09-22 20:44:50', '2026-09-22 20:44:50');

-- Table: electricity_readings
DROP TABLE IF EXISTS `electricity_readings`;
CREATE TABLE `electricity_readings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `reading_date` date NOT NULL,
  `consumption` decimal(10,2) NOT NULL,
  `units` varchar(20) DEFAULT 'kWh',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`reading_date`),
  CONSTRAINT `fk_readings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `electricity_readings` (`id`, `user_id`, `reading_date`, `consumption`, `units`, `notes`, `created_at`, `updated_at`) VALUES
(1, 4, '2026-08-23', '16.33', 'kWh', 'Weekend appliance & AC usage', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(2, 4, '2026-08-24', '13.40', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(3, 4, '2026-08-25', '15.48', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(4, 4, '2026-08-26', '16.68', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(5, 4, '2026-08-27', '15.92', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(6, 4, '2026-08-28', '15.06', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(7, 4, '2026-08-29', '16.57', 'kWh', 'Weekend appliance & AC usage', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(8, 4, '2026-08-30', '16.71', 'kWh', 'Weekend appliance & AC usage', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(9, 4, '2026-08-31', '15.05', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(10, 4, '2026-09-01', '16.09', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(11, 4, '2026-09-02', '16.26', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(12, 4, '2026-09-03', '15.09', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(13, 4, '2026-09-04', '13.18', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(14, 4, '2026-09-05', '16.19', 'kWh', 'Weekend appliance & AC usage', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(15, 4, '2026-09-06', '17.59', 'kWh', 'Weekend appliance & AC usage', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(16, 4, '2026-09-07', '15.84', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(17, 4, '2026-09-08', '16.29', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(18, 4, '2026-09-09', '15.87', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(19, 4, '2026-09-10', '14.28', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(20, 4, '2026-09-11', '13.15', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(21, 4, '2026-09-12', '16.87', 'kWh', 'Weekend appliance & AC usage', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(22, 4, '2026-09-13', '18.87', 'kWh', 'Weekend appliance & AC usage', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(23, 4, '2026-09-14', '16.64', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(24, 4, '2026-09-15', '16.13', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(25, 4, '2026-09-16', '14.44', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(26, 4, '2026-09-17', '12.85', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(27, 4, '2026-09-18', '13.66', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(28, 4, '2026-09-19', '18.26', 'kWh', 'Weekend appliance & AC usage', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(29, 4, '2026-09-20', '19.85', 'kWh', 'Weekend appliance & AC usage', '2026-09-22 22:30:07', '2026-09-22 22:30:07'),
(30, 4, '2026-09-21', '16.30', 'kWh', 'Standard weekday consumption', '2026-09-22 22:30:07', '2026-09-22 22:30:07');

-- Table: forecasts
DROP TABLE IF EXISTS `forecasts`;
CREATE TABLE `forecasts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `forecast_date` date NOT NULL,
  `predicted_consumption` decimal(10,2) NOT NULL,
  `model_name` varchar(100) DEFAULT 'Moving Average',
  `horizon_days` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_forecast` (`user_id`,`forecast_date`),
  CONSTRAINT `fk_forecasts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `forecasts` (`id`, `user_id`, `forecast_date`, `predicted_consumption`, `model_name`, `horizon_days`, `created_at`) VALUES
(1, 4, '2026-09-22', '17.78', 'Moving Average', 7, '2026-09-22 22:30:13'),
(2, 4, '2026-09-23', '17.78', 'Moving Average', 7, '2026-09-22 22:30:13'),
(3, 4, '2026-09-24', '17.78', 'Moving Average', 7, '2026-09-22 22:30:13'),
(4, 4, '2026-09-25', '17.78', 'Moving Average', 7, '2026-09-22 22:30:13'),
(5, 4, '2026-09-26', '19.05', 'Moving Average', 7, '2026-09-22 22:30:13'),
(6, 4, '2026-09-27', '19.05', 'Moving Average', 7, '2026-09-22 22:30:13'),
(7, 4, '2026-09-28', '17.78', 'Moving Average', 7, '2026-09-22 22:30:13');

-- Table: house_details
DROP TABLE IF EXISTS `house_details`;
CREATE TABLE `house_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `num_rooms` int NOT NULL DEFAULT '3',
  `room_height_ft` decimal(4,1) NOT NULL DEFAULT '10.0',
  `ventilation` enum('Good','Moderate','Poor') NOT NULL DEFAULT 'Moderate',
  `house_size_sqft` int DEFAULT '1200',
  `occupants_count` int DEFAULT '4',
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_house_user` (`user_id`),
  CONSTRAINT `fk_house_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `house_details` (`id`, `user_id`, `num_rooms`, `room_height_ft`, `ventilation`, `house_size_sqft`, `occupants_count`, `address`, `created_at`, `updated_at`) VALUES
(1, 3, 3, '10.0', 'Moderate', 1200, 4, NULL, '2026-09-22 20:38:57', '2026-09-22 20:38:57'),
(2, 4, 4, '10.0', 'Moderate', 1200, 4, NULL, '2026-09-22 20:41:44', '2026-09-22 20:42:37'),
(3, 2, 3, '10.0', 'Moderate', 1200, 4, NULL, '2026-09-22 22:47:06', '2026-09-22 22:47:06');

-- Table: otp_codes
DROP TABLE IF EXISTS `otp_codes`;
CREATE TABLE `otp_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_otp_lookup` (`email`,`otp_code`,`is_used`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `otp_codes` (`id`, `email`, `otp_code`, `expires_at`, `is_used`, `created_at`) VALUES
(1, 'vinnumani@gmail.com', '136040', '2026-09-22 15:18:57', 0, '2026-09-22 20:38:57'),
(2, 'vinnumani@gmail.com', '906921', '2026-09-22 15:19:08', 0, '2026-09-22 20:39:08'),
(3, 'vinnumani7@gmail.com', '135961', '2026-09-22 20:56:44', 1, '2026-09-22 20:41:44');

-- Table: predictions
DROP TABLE IF EXISTS `predictions`;
CREATE TABLE `predictions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `predicted_monthly_kwh` decimal(10,2) NOT NULL,
  `estimated_cost` decimal(10,2) NOT NULL,
  `load_factor` decimal(5,2) DEFAULT '1.00',
  `ventilation_factor` decimal(5,2) DEFAULT '1.00',
  `height_factor` decimal(5,2) DEFAULT '1.00',
  `category_breakdown` json DEFAULT NULL,
  `model_name` varchar(100) DEFAULT 'Physics-Appliance Hybrid Engine',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_predictions_user` (`user_id`,`created_at`),
  CONSTRAINT `fk_predictions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `predictions` (`id`, `user_id`, `predicted_monthly_kwh`, `estimated_cost`, `load_factor`, `ventilation_factor`, `height_factor`, `category_breakdown`, `model_name`, `notes`, `created_at`) VALUES
(1, 4, '373.39', '227.38', '1.00', '1.00', '1.00', '{"Refrigeration":146.41,"HVAC (Cooling/Heating)":206.98}', 'Physics-Appliance Hybrid Engine', 'Manual calculation run', '2026-09-22 20:44:57');

-- Table: recommendations
DROP TABLE IF EXISTS `recommendations`;
CREATE TABLE `recommendations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `prediction_id` int DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `estimated_kwh_savings` decimal(8,2) NOT NULL,
  `estimated_cost_savings` decimal(8,2) NOT NULL,
  `priority` enum('High','Medium','Low') DEFAULT 'Medium',
  `is_applied` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recom_user` (`user_id`),
  CONSTRAINT `fk_recom_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `recommendations` (`id`, `user_id`, `prediction_id`, `title`, `description`, `estimated_kwh_savings`, `estimated_cost_savings`, `priority`, `is_applied`, `created_at`) VALUES
(1, 4, 1, 'Optimize AC Thermostat to 24°C (75°F)', 'Each degree above 20°C reduces compressor workload by 6%. Running your 1 Air Conditioner(s) at 24°C will save roughly 20% of cooling energy without sacrificing room comfort.', '47.04', '28.22', 'High', 1, '2026-09-22 20:44:57'),
(2, 4, 1, 'Eliminate Phantom / Standby Plug Loads', 'Televisions, microwave displays, laptops, and chargers draw small continuous currents when turned off at the device. Utilizing smart power strips or wall switches eliminates up to 8% of wasted idle power.', '14.40', '8.64', 'Low', 0, '2026-09-22 20:44:57');

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(40) DEFAULT NULL,
  `role` enum('household','admin') NOT NULL DEFAULT 'household',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`, `phone`, `role`, `is_verified`) VALUES
(1, 'vinnu', 'vinnu@gmail.com', '$2a$10$EpC3nP4jNjXRhnur6UX3su/EHRDtE28IRXey/G5gd6L9Bfrj5kw3u', '2026-09-22 20:21:39', '2026-09-22 20:21:39', NULL, 'household', 0),
(2, 'System Admin', 'admin@electricity.com', '$2a$10$ljHF6lJGM.DZrYmBGdr5jeeoEqg39mvBzxR3kvAzWavij/LccmDgm', '2026-09-22 20:36:22', '2026-09-22 22:43:59', '+1 (555) 019-2834', 'admin', 1),
(3, 'vinnu', 'vinnumani@gmail.com', '$2a$10$EtDW56z1Oo6aF/2rclJVdum4G9hFm3KNWB8JPv8u.qwzTO8lB2eX6', '2026-09-22 20:38:57', '2026-09-22 20:38:57', NULL, 'household', 0),
(4, 'vinnu', 'vinnumani7@gmail.com', '$2a$10$LzfRCdqaewQsSmfT.pzKge0iGxxDLaoR2U/Y32jgyOwI8H1f6V4Vy', '2026-09-22 20:41:44', '2026-09-22 20:41:46', NULL, 'household', 1);

SET FOREIGN_KEY_CHECKS = 1;
