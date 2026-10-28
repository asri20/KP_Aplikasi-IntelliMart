// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// GET    /api/products       - Ambil semua produk
// GET    /api/products/:id   - Ambil produk by ID (beserta varian)
// POST   /api/products       - Buat produk baru
// PUT    /api/products/:id   - Update produk
// DELETE /api/products/:id   - Hapus produk

router.get('/',    ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/',   ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

module.exports = router;
