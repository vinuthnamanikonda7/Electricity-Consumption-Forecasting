const express = require('express');
const router = express.Router();
const {
  getHouseData,
  saveHouseDetails,
  addAppliance,
  updateAppliance,
  deleteAppliance
} = require('../controllers/houseController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getHouseData);
router.post('/', saveHouseDetails);
router.put('/', saveHouseDetails);
router.post('/appliances', addAppliance);
router.put('/appliances/:id', updateAppliance);
router.delete('/appliances/:id', deleteAppliance);

module.exports = router;
