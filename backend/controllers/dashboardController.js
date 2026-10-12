const { pool } = require('../config/db');

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get aggregated dashboard summary statistics and chart series for current user
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Basic aggregate statistics
    const [[stats]] = await pool.query(
      `SELECT 
        COUNT(*) as total_readings,
        COALESCE(SUM(consumption), 0) as total_consumption,
        COALESCE(AVG(consumption), 0) as average_consumption,
        COALESCE(MAX(consumption), 0) as highest_consumption,
        COALESCE(MIN(consumption), 0) as lowest_consumption
       FROM electricity_readings 
       WHERE user_id = ?`,
      [userId]
    );

    // 2. Latest reading
    const [latestReadings] = await pool.query(
      `SELECT id, reading_date, consumption, units, notes 
       FROM electricity_readings 
       WHERE user_id = ? 
       ORDER BY reading_date DESC, id DESC 
       LIMIT 1`,
      [userId]
    );

    // 3. Latest forecast record
    const [latestForecasts] = await pool.query(
      `SELECT id, forecast_date, predicted_consumption, model_name, horizon_days, created_at 
       FROM forecasts 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    // 4. Recent 5 readings for dashboard table
    const [recentReadings] = await pool.query(
      `SELECT id, reading_date, consumption, units, notes, created_at 
       FROM electricity_readings 
       WHERE user_id = ? 
       ORDER BY reading_date DESC, id DESC 
       LIMIT 5`,
      [userId]
    );

    // 5. Timeline data for chart (last 30 readings in ascending order)
    const [timelineReadings] = await pool.query(
      `SELECT reading_date as date, consumption as actual
       FROM (
         SELECT reading_date, consumption 
         FROM electricity_readings 
         WHERE user_id = ? 
         ORDER BY reading_date DESC 
         LIMIT 30
       ) sub
       ORDER BY reading_date ASC`,
      [userId]
    );

    // 6. Next 7 days forecast points (if any exist)
    const [upcomingForecasts] = await pool.query(
      `SELECT forecast_date as date, predicted_consumption as predicted
       FROM forecasts 
       WHERE user_id = ? AND forecast_date >= CURDATE()
       ORDER BY forecast_date ASC 
       LIMIT 7`,
      [userId]
    );

    // 7. Day of week averages for consumption distribution
    const [dayOfWeekStats] = await pool.query(
      `SELECT 
        DAYNAME(reading_date) as day_name,
        DAYOFWEEK(reading_date) as day_index,
        AVG(consumption) as avg_consumption
       FROM electricity_readings
       WHERE user_id = ?
       GROUP BY DAYNAME(reading_date), DAYOFWEEK(reading_date)
       ORDER BY day_index ASC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      summary: {
        total_readings: parseInt(stats.total_readings, 10),
        total_consumption: parseFloat(parseFloat(stats.total_consumption).toFixed(2)),
        average_consumption: parseFloat(parseFloat(stats.average_consumption).toFixed(2)),
        highest_consumption: parseFloat(parseFloat(stats.highest_consumption).toFixed(2)),
        lowest_consumption: parseFloat(parseFloat(stats.lowest_consumption).toFixed(2)),
        latest_reading: latestReadings.length > 0 ? latestReadings[0] : null,
        latest_forecast: latestForecasts.length > 0 ? latestForecasts[0] : null,
        recent_readings: recentReadings,
        timeline_readings: timelineReadings.map(t => ({
          date: t.date,
          actual: parseFloat(t.actual)
        })),
        upcoming_forecasts: upcomingForecasts.map(f => ({
          date: f.date,
          predicted: parseFloat(f.predicted)
        })),
        day_of_week_stats: dayOfWeekStats.map(d => ({
          day: d.day_name,
          consumption: parseFloat(parseFloat(d.avg_consumption).toFixed(2))
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};
