const { pool } = require('../config/db');
const PredictionEngine = require('../services/predictionEngine');
const RecommendationEngine = require('../services/recommendationEngine');

/**
 * @route   POST /api/predictions/calculate
 * @desc    Compute physics & appliance electricity prediction, save to MySQL, and trigger recommendations
 */
const calculatePrediction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { notes } = req.body;

    // 1. Fetch user's house details
    let [houses] = await pool.query('SELECT * FROM house_details WHERE user_id = ? LIMIT 1', [userId]);
    let house = houses.length > 0 ? houses[0] : { num_rooms: 3, room_height_ft: 10.0, ventilation: 'Moderate', house_size_sqft: 1200, occupants_count: 4 };

    // 2. Fetch user's appliance inventory
    const [appliances] = await pool.query('SELECT * FROM appliances WHERE user_id = ?', [userId]);

    if (appliances.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No appliances found in your inventory. Please add at least 1 appliance in the House Details tab before generating a prediction.'
      });
    }

    // 3. Execute Prediction Engine calculation
    const predictionResult = PredictionEngine.predict(house, appliances);

    // 4. Save into MySQL predictions table
    const [insertRes] = await pool.query(
      `INSERT INTO predictions 
       (user_id, predicted_monthly_kwh, estimated_cost, load_factor, ventilation_factor, height_factor, category_breakdown, model_name, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        predictionResult.predicted_monthly_kwh,
        predictionResult.estimated_cost,
        predictionResult.occupancy_factor,
        predictionResult.ventilation_factor,
        predictionResult.height_factor,
        JSON.stringify(predictionResult.category_breakdown),
        predictionResult.model_name,
        notes ? notes.trim() : null
      ]
    );

    const predictionId = insertRes.insertId;

    // 5. Generate and store personalized recommendations
    const recommendations = RecommendationEngine.generate(house, appliances, predictionResult);
    
    // Clear old unapplied recommendations and save fresh suggestions
    await pool.query('DELETE FROM recommendations WHERE user_id = ? AND is_applied = 0', [userId]);

    for (const rec of recommendations) {
      await pool.query(
        `INSERT INTO recommendations 
         (user_id, prediction_id, title, description, estimated_kwh_savings, estimated_cost_savings, priority) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, predictionId, rec.title, rec.description, rec.estimated_kwh_savings, rec.estimated_cost_savings, rec.priority]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Electricity consumption prediction generated successfully!',
      prediction: {
        id: predictionId,
        ...predictionResult,
        created_at: new Date().toISOString()
      },
      recommendations_count: recommendations.length,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/predictions/history
 * @desc    Get user's previous predictions with breakdown and comparison
 */
const getPredictionHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [predictions] = await pool.query(
      'SELECT id, user_id, predicted_monthly_kwh, estimated_cost, load_factor, ventilation_factor, height_factor, category_breakdown, model_name, notes, created_at FROM predictions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Format category breakdown JSON
    const formatted = predictions.map(p => ({
      ...p,
      category_breakdown: typeof p.category_breakdown === 'string' ? JSON.parse(p.category_breakdown) : p.category_breakdown
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      predictions: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/predictions/:id
 * @desc    Delete a prediction record
 */
const deletePrediction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const predId = req.params.id;

    const [result] = await pool.query('DELETE FROM predictions WHERE id = ? AND user_id = ?', [predId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Prediction record not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Prediction record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculatePrediction,
  getPredictionHistory,
  deletePrediction
};
