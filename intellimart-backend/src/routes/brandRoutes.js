const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

router.get('/', brandController.listBrands);
router.get('/:id', brandController.getBrand);
router.post('/', brandController.addBrand);
router.put('/:id', brandController.editBrand);
router.delete('/:id', brandController.removeBrand);

module.exports = router;