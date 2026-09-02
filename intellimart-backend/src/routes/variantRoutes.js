const express = require('express');
const router = express.Router();
const VariantController = require('../controllers/variantController');

// GET    /api/variants              - Ambil semua varian (opsional: ?product_id=5)
// GET    /api/variants/:id          - Ambil varian by ID
// POST   /api/variants              - Buat varian baru
// PUT    /api/variants/:id          - Update varian
// DELETE /api/variants/:id          - Hapus varian

router.get('/',    VariantController.getAll);
router.get('/:id', VariantController.getById);
router.post('/',   VariantController.create);
router.put('/:id', VariantController.update);
router.delete('/:id', VariantController.delete);

module.exports = router;
