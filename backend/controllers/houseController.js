const { pool } = require('../config/db');

/**
 * @route   GET /api/house
 * @desc    Get user's house architectural details & appliance inventory
 */
const getHouseData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch house details
    let [houses] = await pool.query('SELECT * FROM house_details WHERE user_id = ? LIMIT 1', [userId]);
    let houseDetails = houses.length > 0 ? houses[0] : null;

    if (!houseDetails) {
      // Auto create baseline house details row if not exists
      const [insertRes] = await pool.query(
        'INSERT INTO house_details (user_id, num_rooms, room_height_ft, ventilation, house_size_sqft, occupants_count) VALUES (?, 3, 10.0, "Moderate", 1200, 4)',
        [userId]
      );
      const [newHouse] = await pool.query('SELECT * FROM house_details WHERE id = ?', [insertRes.insertId]);
      houseDetails = newHouse[0];
    }

    // 2. Fetch appliances inventory
    const [appliances] = await pool.query(
      'SELECT id, user_id, appliance_type, quantity, power_rating_watts, daily_usage_hours, star_rating, created_at FROM appliances WHERE user_id = ? ORDER BY id ASC',
      [userId]
    );

    res.status(200).json({
      success: true,
      house_details: houseDetails,
      appliances
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/house
 * @desc    Save or Update house details (rooms, height, ventilation, size)
 */
const saveHouseDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      num_rooms = 3,
      room_height_ft = 10.0,
      ventilation = 'Moderate',
      house_size_sqft = 1200,
      occupants_count = 4,
      address
    } = req.body;

    const validVentilation = ['Good', 'Moderate', 'Poor'].includes(ventilation) ? ventilation : 'Moderate';
    const cleanRooms = Math.max(1, parseInt(num_rooms, 10) || 3);
    const cleanHeight = Math.max(6.0, Math.min(25.0, parseFloat(room_height_ft) || 10.0));
    const cleanSize = Math.max(100, parseInt(house_size_sqft, 10) || 1200);
    const cleanOccupants = Math.max(1, parseInt(occupants_count, 10) || 4);

    // Upsert house details
    const [existing] = await pool.query('SELECT id FROM house_details WHERE user_id = ? LIMIT 1', [userId]);

    if (existing.length > 0) {
      await pool.query(
        'UPDATE house_details SET num_rooms = ?, room_height_ft = ?, ventilation = ?, house_size_sqft = ?, occupants_count = ?, address = ? WHERE user_id = ?',
        [cleanRooms, cleanHeight, validVentilation, cleanSize, cleanOccupants, address ? address.trim() : null, userId]
      );
    } else {
      await pool.query(
        'INSERT INTO house_details (user_id, num_rooms, room_height_ft, ventilation, house_size_sqft, occupants_count, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, cleanRooms, cleanHeight, validVentilation, cleanSize, cleanOccupants, address ? address.trim() : null]
      );
    }

    const [updated] = await pool.query('SELECT * FROM house_details WHERE user_id = ? LIMIT 1', [userId]);

    res.status(200).json({
      success: true,
      message: 'House architectural details saved successfully.',
      house_details: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/house/appliances
 * @desc    Add a new electrical appliance to user inventory
 */
const addAppliance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      appliance_type,
      quantity = 1,
      power_rating_watts,
      daily_usage_hours,
      star_rating = 3
    } = req.body;

    if (!appliance_type || power_rating_watts === undefined || daily_usage_hours === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Appliance type, wattage rating, and daily usage hours are required.'
      });
    }

    const cleanQty = Math.max(1, parseInt(quantity, 10) || 1);
    const cleanWatts = Math.max(1, parseFloat(power_rating_watts) || 100);
    const cleanHours = Math.max(0.1, Math.min(24.0, parseFloat(daily_usage_hours) || 4));
    const cleanStars = Math.max(1, Math.min(5, parseInt(star_rating, 10) || 3));

    const [insertResult] = await pool.query(
      'INSERT INTO appliances (user_id, appliance_type, quantity, power_rating_watts, daily_usage_hours, star_rating) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, appliance_type.trim(), cleanQty, cleanWatts, cleanHours, cleanStars]
    );

    const [newApp] = await pool.query('SELECT * FROM appliances WHERE id = ?', [insertResult.insertId]);

    res.status(201).json({
      success: true,
      message: `${appliance_type.trim()} added to appliance inventory.`,
      appliance: newApp[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/house/appliances/:id
 * @desc    Update an existing appliance
 */
const updateAppliance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const appIndex = req.params.id;
    const { appliance_type, quantity, power_rating_watts, daily_usage_hours, star_rating } = req.body;

    const [existing] = await pool.query('SELECT id FROM appliances WHERE id = ? AND user_id = ?', [appIndex, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Appliance record not found or unauthorized.' });
    }

    const updates = [];
    const params = [];

    if (appliance_type) {
      updates.push('appliance_type = ?');
      params.push(appliance_type.trim());
    }
    if (quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(Math.max(1, parseInt(quantity, 10)));
    }
    if (power_rating_watts !== undefined) {
      updates.push('power_rating_watts = ?');
      params.push(Math.max(1, parseFloat(power_rating_watts)));
    }
    if (daily_usage_hours !== undefined) {
      updates.push('daily_usage_hours = ?');
      params.push(Math.max(0.1, Math.min(24, parseFloat(daily_usage_hours))));
    }
    if (star_rating !== undefined) {
      updates.push('star_rating = ?');
      params.push(Math.max(1, Math.min(5, parseInt(star_rating, 10))));
    }

    if (updates.length > 0) {
      params.push(appIndex, userId);
      await pool.query(`UPDATE appliances SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);
    }

    const [updated] = await pool.query('SELECT * FROM appliances WHERE id = ?', [appIndex]);

    res.status(200).json({
      success: true,
      message: 'Appliance updated successfully.',
      appliance: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/house/appliances/:id
 * @desc    Delete an appliance from inventory
 */
const deleteAppliance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const appId = req.params.id;

    const [result] = await pool.query('DELETE FROM appliances WHERE id = ? AND user_id = ?', [appId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Appliance not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Appliance removed from inventory.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHouseData,
  saveHouseDetails,
  addAppliance,
  updateAppliance,
  deleteAppliance
};
