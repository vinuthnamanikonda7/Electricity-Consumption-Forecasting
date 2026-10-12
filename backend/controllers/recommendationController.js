const { pool } = require('../config/db');

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized energy-saving recommendations for the current user
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [recommendations] = await pool.query(
      'SELECT id, user_id, prediction_id, title, description, estimated_kwh_savings, estimated_cost_savings, priority, is_applied, created_at FROM recommendations WHERE user_id = ? ORDER BY priority ASC, estimated_kwh_savings DESC',
      [userId]
    );

    const totalPotentialKwh = recommendations.reduce((acc, r) => acc + parseFloat(r.estimated_kwh_savings || 0), 0);
    const totalPotentialCost = recommendations.reduce((acc, r) => acc + parseFloat(r.estimated_cost_savings || 0), 0);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      total_potential_kwh_savings: parseFloat(totalPotentialKwh.toFixed(2)),
      total_potential_cost_savings: parseFloat(totalPotentialCost.toFixed(2)),
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/recommendations/:id/apply
 * @desc    Toggle recommendation applied status
 */
const toggleApplyRecommendation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recId = req.params.id;

    const [recs] = await pool.query('SELECT id, is_applied FROM recommendations WHERE id = ? AND user_id = ?', [recId, userId]);
    if (recs.length === 0) {
      return res.status(404).json({ success: false, message: 'Recommendation not found or unauthorized.' });
    }

    const currentStatus = recs[0].is_applied;
    const newStatus = currentStatus ? 0 : 1;

    await pool.query('UPDATE recommendations SET is_applied = ? WHERE id = ?', [newStatus, recId]);

    res.status(200).json({
      success: true,
      message: newStatus ? 'Tip marked as applied!' : 'Tip moved back to active suggestions.',
      is_applied: newStatus
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  toggleApplyRecommendation
};
