-- ====================================================================
-- Sample Seed Data for Electricity Forecasting System
-- Preloads Admin account, Demo household account, House details,
-- Appliance inventory, Predictions, and Energy-saving Tips.
-- ====================================================================

USE electricity_forecasting;

-- 1. Insert Admin & Household Demo Users (password: password123)
INSERT INTO users (id, name, email, password, phone, role, is_verified) VALUES
(1, 'Admin Manager', 'admin@electroforecast.local', '$2a$10$7R0wK/VqK6vI/xXGvF2Xve95h8eYc7XpI6HkMh.ZJ42aGZ39LqW1a', '+1 (555) 019-2834', 'admin', 1),
(2, 'Sarah Jenkins', 'sarah@example.com', '$2a$10$7R0wK/VqK6vI/xXGvF2Xve95h8eYc7XpI6HkMh.ZJ42aGZ39LqW1a', '+1 (555) 482-9102', 'household', 1)
ON DUPLICATE KEY UPDATE id=id;

-- 2. Insert House Details for Household User
INSERT INTO house_details (id, user_id, num_rooms, room_height_ft, ventilation, house_size_sqft, occupants_count, address) VALUES
(1, 2, 4, 10.5, 'Good', 1450, 4, '742 Evergreen Terrace, Springfield')
ON DUPLICATE KEY UPDATE id=id;

-- 3. Insert Common Appliances for Household User
INSERT INTO appliances (user_id, appliance_type, quantity, power_rating_watts, daily_usage_hours, star_rating) VALUES
(2, 'Inverter Air Conditioner (1.5 Ton)', 2, 1400.00, 6.00, 5),
(2, 'Double Door Refrigerator (350L)', 1, 220.00, 24.00, 4),
(2, 'Ceiling Fans (BLDC)', 4, 35.00, 10.00, 5),
(2, 'Smart LED Television (55 inch)', 1, 110.00, 4.50, 4),
(2, 'LED Tube Lights & Bulbs', 10, 12.00, 5.00, 5),
(2, 'Front Load Washing Machine', 1, 500.00, 1.00, 4),
(2, 'Microwave Oven', 1, 1200.00, 0.40, 3),
(2, 'Storage Water Geyser (25L)', 1, 2000.00, 1.20, 3);

-- 4. Insert Initial Prediction Run
INSERT INTO predictions (id, user_id, predicted_monthly_kwh, estimated_cost, load_factor, ventilation_factor, height_factor, category_breakdown, model_name) VALUES
(1, 2, 412.50, 247.50, 1.05, 0.95, 1.05, '{"HVAC": 151.2, "Refrigeration": 158.4, "Lighting": 18.0, "Fans": 42.0, "Entertainment": 14.85, "Laundry": 15.0, "Cooking": 14.4, "Water Heating": 72.0}', 'Physics-Appliance Hybrid Engine')
ON DUPLICATE KEY UPDATE id=id;

-- 5. Insert Personalized Energy Saving Recommendations
INSERT INTO recommendations (user_id, prediction_id, title, description, estimated_kwh_savings, estimated_cost_savings, priority) VALUES
(2, 1, 'Optimize AC Thermostat to 24°C', 'Setting your Air Conditioner to 24°C instead of 18°C or 20°C saves up to 24% of cooling energy without sacrificing comfort.', 36.20, 21.72, 'High'),
(2, 1, 'Water Heater Timer Optimization', 'Limit storage geyser preheating duration to 20-30 minutes rather than leaving it powered on for extended periods.', 18.50, 11.10, 'High'),
(2, 1, 'Defrost & Maintain Refrigerator Seals', 'Clean the condenser coils and ensure airtight door gaskets to reduce compressor run time by 10%.', 15.80, 9.48, 'Medium'),
(2, 1, 'Leverage Natural Good Ventilation', 'Your house has Good ventilation rating. Utilize natural evening breeze instead of running secondary AC units.', 22.00, 13.20, 'Medium');
