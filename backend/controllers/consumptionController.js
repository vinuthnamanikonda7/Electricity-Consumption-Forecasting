const { pool } = require('../config/db');

/**
 * @route   POST /api/consumption
 * @desc    Create a new electricity consumption reading
 */
const createReading = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reading_date, consumption, units = 'kWh', notes } = req.body;

    if (!reading_date || consumption === undefined || consumption === null) {
      return res.status(400).json({
        success: false,
        message: 'Reading date and consumption value are required.'
      });
    }

    const numConsumption = parseFloat(consumption);
    if (isNaN(numConsumption) || numConsumption < 0) {
      return res.status(400).json({
        success: false,
        message: 'Consumption must be a valid positive number.'
      });
    }

    // Insert reading into MySQL using parameterized query
    const [result] = await pool.query(
      'INSERT INTO electricity_readings (user_id, reading_date, consumption, units, notes) VALUES (?, ?, ?, ?, ?)',
      [userId, reading_date, numConsumption, units.trim() || 'kWh', notes ? notes.trim() : null]
    );

    const [newRecord] = await pool.query(
      'SELECT id, user_id, reading_date, consumption, units, notes, created_at FROM electricity_readings WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Consumption reading recorded successfully.',
      reading: newRecord[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/consumption
 * @desc    Get all electricity readings for the current user (with search and sorting)
 */
const getReadings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, sortBy = 'reading_date', order = 'DESC', limit } = req.query;

    let query = 'SELECT id, user_id, reading_date, consumption, units, notes, created_at FROM electricity_readings WHERE user_id = ?';
    const queryParams = [userId];

    if (search && search.trim()) {
      query += ' AND (notes LIKE ? OR reading_date LIKE ?)';
      const searchPattern = `%${search.trim()}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    // Safe sorting column whitelist
    const allowedSortColumns = ['reading_date', 'consumption', 'created_at'];
    const sortCol = allowedSortColumns.includes(sortBy) ? sortBy : 'reading_date';
    const sortDir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortCol} ${sortDir}`;

    if (limit && !isNaN(parseInt(limit, 10))) {
      query += ` LIMIT ${parseInt(limit, 10)}`;
    }

    const [readings] = await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      count: readings.length,
      readings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/consumption/:id
 * @desc    Get a single reading by ID
 */
const getReadingById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const readingId = req.params.id;

    const [readings] = await pool.query(
      'SELECT id, user_id, reading_date, consumption, units, notes, created_at FROM electricity_readings WHERE id = ? AND user_id = ?',
      [readingId, userId]
    );

    if (readings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Electricity reading not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      reading: readings[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/consumption/:id
 * @desc    Update an existing electricity reading
 */
const updateReading = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const readingId = req.params.id;
    const { reading_date, consumption, units, notes } = req.body;

    // Check existence & ownership
    const [existing] = await pool.query(
      'SELECT id FROM electricity_readings WHERE id = ? AND user_id = ?',
      [readingId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found or unauthorized.'
      });
    }

    const updates = [];
    const params = [];

    if (reading_date) {
      updates.push('reading_date = ?');
      params.push(reading_date);
    }

    if (consumption !== undefined && consumption !== null) {
      const numVal = parseFloat(consumption);
      if (isNaN(numVal) || numVal < 0) {
        return res.status(400).json({
          success: false,
          message: 'Consumption must be a valid positive number.'
        });
      }
      updates.push('consumption = ?');
      params.push(numVal);
    }

    if (units) {
      updates.push('units = ?');
      params.push(units.trim());
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes ? notes.trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update.'
      });
    }

    params.push(readingId, userId);
    await pool.query(
      `UPDATE electricity_readings SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    const [updated] = await pool.query(
      'SELECT id, user_id, reading_date, consumption, units, notes, created_at, updated_at FROM electricity_readings WHERE id = ?',
      [readingId]
    );

    res.status(200).json({
      success: true,
      message: 'Reading updated successfully.',
      reading: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/consumption/:id
 * @desc    Delete a consumption reading
 */
const deleteReading = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const readingId = req.params.id;

    const [result] = await pool.query(
      'DELETE FROM electricity_readings WHERE id = ? AND user_id = ?',
      [readingId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consumption record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/consumption/seed-demo
 * @desc    Preload 30 days of realistic sample electricity consumption readings for current user
 */
const seedDemoReadings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Sample 30 days of historical data
    const values = [];
    const baseUsage = 14.5;

    for (let i = 30; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const variation = (Math.sin(i) * 1.8) + (isWeekend ? 3.2 : 0) + (Math.random() * 0.8);
      const consumption = parseFloat((baseUsage + variation).toFixed(2));
      const notes = isWeekend ? 'Weekend appliance & AC usage' : 'Standard weekday consumption';

      values.push([userId, dateStr, consumption, 'kWh', notes]);
    }

    await pool.query(
      'INSERT INTO electricity_readings (user_id, reading_date, consumption, units, notes) VALUES ?',
      [values]
    );

    res.status(201).json({
      success: true,
      message: 'Successfully loaded 30 days of realistic sample meter readings!',
      count: values.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
  seedDemoReadings
};
