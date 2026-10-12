-- Electricity Forecasting Database Backup
-- Generated At: 2026-09-30T08:06:43.518Z

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `appliances` (`id`, `user_id`, `appliance_type`, `quantity`, `power_rating_watts`, `daily_usage_hours`, `star_rating`, `created_at`, `updated_at`) VALUES
(8, 13, 'BLDC Ceiling Fan', 10, '32.00', '10.60', 4, '2026-09-30 13:32:39', '2026-09-30 13:32:39'),
(9, 13, 'Microwave Oven', 1, '1200.00', '0.60', 3, '2026-09-30 13:32:47', '2026-09-30 13:32:47'),
(10, 13, 'Double Door Refrigerator (350L)', 1, '220.00', '23.60', 4, '2026-09-30 13:32:55', '2026-09-30 13:32:55'),
(11, 13, 'Water Heater / Geyser (25L)', 1, '2000.00', '1.10', 3, '2026-09-30 13:33:13', '2026-09-30 13:33:13');

-- Table: contact_messages
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `subject` varchar(200) DEFAULT 'General Inquiry',
  `message` text NOT NULL,
  `status` enum('unread','read','replied') NOT NULL DEFAULT 'unread',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `contact_messages` (`id`, `name`, `email`, `subject`, `message`, `status`, `created_at`) VALUES
(1, 'Rahul Sharma', 'rahul@example.com', 'Query on Moving Average Forecasts', 'Hello, how does the 7-day rolling window calculate peak load?', 'unread', '2026-09-23 09:58:05'),
(2, 'vinnu', 'vinnumani@gmail.com', 'meter reading', 'its wrong reading', 'read', '2026-09-23 10:00:41');

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
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `house_details` (`id`, `user_id`, `num_rooms`, `room_height_ft`, `ventilation`, `house_size_sqft`, `occupants_count`, `address`, `created_at`, `updated_at`) VALUES
(3, 2, 3, '10.0', 'Moderate', 1200, 4, NULL, '2026-09-22 22:47:06', '2026-09-22 22:47:06'),
(9, 10, 3, '10.0', 'Moderate', 1200, 4, NULL, '2026-09-30 09:32:11', '2026-09-30 09:32:11'),
(10, 11, 3, '10.0', 'Moderate', 1200, 4, NULL, '2026-09-30 10:02:38', '2026-09-30 10:02:38'),
(12, 13, 3, '10.0', 'Poor', 1200, 4, NULL, '2026-09-30 13:25:25', '2026-09-30 13:32:11');

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `otp_codes` (`id`, `email`, `otp_code`, `expires_at`, `is_used`, `created_at`) VALUES
(1, 'vinnumani@gmail.com', '136040', '2026-09-22 15:18:57', 0, '2026-09-22 20:38:57'),
(2, 'vinnumani@gmail.com', '906921', '2026-09-22 15:19:08', 0, '2026-09-22 20:39:08'),
(3, 'vinnumani7@gmail.com', '135961', '2026-09-22 20:56:44', 1, '2026-09-22 20:41:44'),
(4, 'niha@gmail.com', '940124', '2026-09-22 23:13:23', 1, '2026-09-22 22:58:23'),
(5, 'vinnumani7@gmail.com', '447009', '2026-09-23 09:51:49', 1, '2026-09-23 09:36:49'),
(6, 'vinnumani@gmail.com', '588158', '2026-09-23 10:00:23', 1, '2026-09-23 09:45:23'),
(7, 'sunny@gmail.com', '653157', '2026-09-29 20:37:09', 1, '2026-09-29 20:22:09'),
(8, 'manikondavinuthna07@gmail.com', '103744', '2026-09-29 20:57:09', 0, '2026-09-29 20:42:09'),
(9, 'vinuthnamanikonda7@gmail.com', '912130', '2026-09-29 21:03:23', 1, '2026-09-29 20:48:23'),
(10, 'niharikagiramoni7@gmail.com', '865285', '2026-09-30 09:46:37', 0, '2026-09-30 09:31:37'),
(11, 'giramoniniharika77@gmail.com', '826616', '2026-09-30 09:47:11', 0, '2026-09-30 09:32:11'),
(12, 'giramoniniharika77@gmail.com', '238908', '2026-09-30 09:58:59', 0, '2026-09-30 09:43:59'),
(13, 'giramoniniharika77@gmail.com', '355494', '2026-09-30 10:00:59', 1, '2026-09-30 09:45:59'),
(14, 'vinuthnamanikonda7@gmail.com', '959319', '2026-09-30 10:13:16', 1, '2026-09-30 09:58:16'),
(15, 'vinuthnamanikonda7@gmail.com', '955159', '2026-09-30 10:14:13', 1, '2026-09-30 09:59:13'),
(16, 'vinuthnamanikonda7@gmail.com', '338165', '2026-09-30 10:17:38', 1, '2026-09-30 10:02:38'),
(17, 'gadithay3015@gmail.com', '976516', '2026-09-30 13:31:30', 0, '2026-09-30 13:16:30'),
(18, 'gottam15432@gmail.com', '112547', '2026-09-30 13:40:25', 1, '2026-09-30 13:25:25');

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `predictions` (`id`, `user_id`, `predicted_monthly_kwh`, `estimated_cost`, `load_factor`, `ventilation_factor`, `height_factor`, `category_breakdown`, `model_name`, `notes`, `created_at`) VALUES
(5, 13, '344.67', '202.97', '1.00', '1.15', '1.00', '{"Refrigeration":146.41,"Water Heating":66,"Kitchen & Cooking":21.6,"Ceiling/Table Fans":95.65}', 'Physics-Appliance Hybrid Engine', 'Manual calculation run', '2026-09-30 13:33:20');

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `recommendations` (`id`, `user_id`, `prediction_id`, `title`, `description`, `estimated_kwh_savings`, `estimated_cost_savings`, `priority`, `is_applied`, `created_at`) VALUES
(10, 13, 5, 'Install Geyser Timers & Limit Preheating to 25 Mins', 'Water geysers consume 2000W-3000W. Limiting preheating time and insulating hot water delivery pipes prevents continuous thermostat reheating cycles.', '16.50', '9.90', 'High', 0, '2026-09-30 13:33:20'),
(11, 13, 5, 'Improve Cross-Ventilation & Window Shading', 'Your home currently has Poor ventilation, which traps warm air and causes cooling appliances to draw 15% more power. Installing reflective window films and allowing morning/evening cross-breeze will significantly lower cooling costs.', '28.00', '16.80', 'Medium', 0, '2026-09-30 13:33:20'),
(12, 13, 5, 'Eliminate Phantom / Standby Plug Loads', 'Televisions, microwave displays, laptops, and chargers draw small continuous currents when turned off at the device. Utilizing smart power strips or wall switches eliminates up to 8% of wasted idle power.', '14.40', '8.64', 'Low', 1, '2026-09-30 13:33:20');

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`, `phone`, `role`, `is_verified`) VALUES
(2, 'System Admin', 'admin@electricity.com', '$2a$10$ljHF6lJGM.DZrYmBGdr5jeeoEqg39mvBzxR3kvAzWavij/LccmDgm', '2026-09-22 20:36:22', '2026-09-22 22:43:59', '+1 (555) 019-2834', 'admin', 1),
(10, 'Hani', 'giramoniniharika77@gmail.com', '$2a$10$vqR4iq0F0LxdPtzvXxVRd.gwBTqMlEP0YOiK.KwRoNkZYMMplPgUG', '2026-09-30 09:32:11', '2026-09-30 09:46:27', NULL, 'household', 1),
(11, 'vinuthna', 'vinuthnamanikonda7@gmail.com', '$2a$10$S4JcZAJ6.6MlfWNqNWaCFO/S3TIDEW9scc/0v0ZcA/OGE2HYJOcpe', '2026-09-30 10:02:38', '2026-09-30 10:03:22', NULL, 'household', 1),
(13, 'Adithya', 'gottam15432@gmail.com', '$2a$10$FwcOaO4gKMfdc21pvRsnFeKqy8DRlGJRwkoxkBJOITUoBng8nfpma', '2026-09-30 13:25:25', '2026-09-30 13:28:52', NULL, 'household', 1);

SET FOREIGN_KEY_CHECKS = 1;
