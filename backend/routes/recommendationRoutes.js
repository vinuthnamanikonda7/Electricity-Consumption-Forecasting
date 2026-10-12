const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  toggleApplyRecommendation
} = require('../controllers/recommendationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getRecommendations);
router.put('/:id/apply', toggleApplyRecommendation);

module.exports = router;
