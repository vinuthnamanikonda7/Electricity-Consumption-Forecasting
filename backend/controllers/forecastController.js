const { pool } = require('../config/db');
const ForecastService = require('../services/forecastService');

/**
 * @route   POST /api/forecast
 * @desc    Generate a new electricity consumption forecast and save to MySQL
 */
const generateForecast = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { horizon_days = 7, window_size = 7 } = req.body;

    const horizon = parseInt(horizon_days, 10);
    if (![1, 7, 30].includes(horizon)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid forecast horizon. Please choose 1, 7, or 30 days.'
      });
    }

    // 1. Fetch user's historical electricity readings
    const [readings] = await pool.query(
      'SELECT id, reading_date, consumption, units, notes FROM electricity_readings WHERE user_id = ? ORDER BY reading_date ASC',
      [userId]
    );

    if (readings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No historical electricity readings found. Please add at least 1 reading before generating a forecast.'
      });
    }

    // 2. Calculate forecast using Moving Average
    const forecastResult = ForecastService.calculateMovingAverage(
      readings,
      horizon,
      parseInt(window_size, 10) || 7
    );

    // 3. Save predicted values into MySQL forecasts table
    const valuesToInsert = forecastResult.predictions.map(p => [
      userId,
      p.date,
      p.predicted_consumption,
      p.model_name,
      p.horizon_days
    ]);

    if (valuesToInsert.length > 0) {
      await pool.query(
        'INSERT INTO forecasts (user_id, forecast_date, predicted_consumption, model_name, horizon_days) VALUES ?',
        [valuesToInsert]
      );
    }

    // 4. Combine recent historical readings (up to last 30) for frontend chart comparisons
    const recentHistory = readings.slice(-30).map(r => ({
      date: r.reading_date,
      actual_consumption: parseFloat(r.consumption),
      units: r.units
    }));

    res.status(201).json({
      success: true,
      message: `Successfully generated ${horizon}-day Moving Average forecast.`,
      forecast: {
        ...forecastResult,
        historical_comparison: recentHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/forecast
 * @desc    Get user's forecast history
 */
const getForecasts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 100 } = req.query;

    const [forecasts] = await pool.query(
      'SELECT id, user_id, forecast_date, predicted_consumption, model_name, horizon_days, created_at FROM forecasts WHERE user_id = ? ORDER BY forecast_date DESC, created_at DESC LIMIT ?',
      [userId, parseInt(limit, 10)]
    );

    res.status(200).json({
      success: true,
      count: forecasts.length,
      forecasts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/forecast/:id
 * @desc    Get single forecast record by ID
 */
const getForecastById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const forecastId = req.params.id;

    const [forecasts] = await pool.query(
      'SELECT id, user_id, forecast_date, predicted_consumption, model_name, horizon_days, created_at FROM forecasts WHERE id = ? AND user_id = ?',
      [forecastId, userId]
    );

    if (forecasts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Forecast record not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      forecast: forecasts[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/forecast/:id
 * @desc    Delete a forecast record
 */
const deleteForecast = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const forecastId = req.params.id;

    const [result] = await pool.query(
      'DELETE FROM forecasts WHERE id = ? AND user_id = ?',
      [forecastId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Forecast record not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Forecast record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/forecast
 * @desc    Clear all forecast history for user
 */
const clearAllForecasts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await pool.query('DELETE FROM forecasts WHERE user_id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'All forecast history cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateForecast,
  getForecasts,
  getForecastById,
  deleteForecast,
  clearAllForecasts
};
