const express = require('express');
const router = express.Router();
const {
  generateForecast,
  getForecasts,
  getForecastById,
  deleteForecast,
  clearAllForecasts
} = require('../controllers/forecastController');
const { verifyToken } = require('../middleware/authMiddleware');

// All forecast routes are protected
router.use(verifyToken);

router.post('/', generateForecast);
router.get('/', getForecasts);
router.get('/:id', getForecastById);
router.delete('/:id', deleteForecast);
router.delete('/', clearAllForecasts);

module.exports = router;
