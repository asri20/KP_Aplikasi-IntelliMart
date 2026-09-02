const express = require('express');
const router = express.Router();
const UnitConversionController = require('../controllers/unitConversionController');

// GET    /api/unit-conversions                 - Ambil semua (opsional: ?product_id=1)
// GET    /api/unit-conversions/:id             - Ambil satu by ID
// POST   /api/unit-conversions                 - Buat konversi satuan baru
// PUT    /api/unit-conversions/:id             - Update konversi satuan
// DELETE /api/unit-conversions/:id             - Hapus konversi satuan

router.get('/',    UnitConversionController.getAll);
router.get('/:id', UnitConversionController.getById);
router.post('/',   UnitConversionController.create);
router.put('/:id', UnitConversionController.update);
router.delete('/:id', UnitConversionController.delete);

module.exports = router;
