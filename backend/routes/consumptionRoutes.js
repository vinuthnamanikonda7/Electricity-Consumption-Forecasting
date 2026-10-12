const express = require('express');
const router = express.Router();
const {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
  seedDemoReadings
} = require('../controllers/consumptionController');
const { verifyToken } = require('../middleware/authMiddleware');

// All consumption routes are protected
router.use(verifyToken);

router.post('/seed-demo', seedDemoReadings);
router.post('/', createReading);
router.get('/', getReadings);
router.get('/:id', getReadingById);
router.put('/:id', updateReading);
router.delete('/:id', deleteReading);

module.exports = router;
