const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

router.get('/', unitController.listUnits);
router.get('/:id', unitController.getUnit);
router.post('/', unitController.addUnit);
router.put('/:id', unitController.editUnit);
router.delete('/:id', unitController.removeUnit);

module.exports = router;