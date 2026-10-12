const express = require('express');
const router = express.Router();
const {
  calculatePrediction,
  getPredictionHistory,
  deletePrediction
} = require('../controllers/predictionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/calculate', calculatePrediction);
router.get('/history', getPredictionHistory);
router.delete('/:id', deletePrediction);

module.exports = router;
