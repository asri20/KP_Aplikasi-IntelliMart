const express = require('express');
const router = express.Router();
const ProductImageController = require('../controllers/productImageController');

// GET    /api/product-images                 - Ambil semua (opsional: ?product_id=1)
// GET    /api/product-images/:id             - Ambil satu by ID
// POST   /api/product-images                 - Tambah foto baru
// PUT    /api/product-images/:id             - Update foto
// DELETE /api/product-images/:id             - Hapus foto

router.get('/',    ProductImageController.getAll);
router.get('/:id', ProductImageController.getById);
router.post('/',   ProductImageController.create);
router.put('/:id', ProductImageController.update);
router.delete('/:id', ProductImageController.delete);

module.exports = router;
