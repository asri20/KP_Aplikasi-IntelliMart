const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

router.get('/', unitController.listUnits);
router.post('/', unitController.addUnit);

module.exports = router;