// src/routes/productRoutes.js

const express = require('express');

const router = express.Router();

const ProductController = require('../controllers/productController');
const { verifyToken, checkOwner } = require('../middlewares/authMiddleware');

// =====================================================
// PRODUCT ROUTES
// Semua endpoint produk membutuhkan login.
// Owner hanya bisa mengakses produk miliknya sendiri.
// =====================================================

// GET /api/products
// Ambil semua produk milik Owner yang sedang login
router.get(
  '/',
  verifyToken,
  checkOwner,
  ProductController.getAll
);

// GET /api/products/:id
// Ambil detail produk milik Owner yang sedang login
router.get(
  '/:id',
  verifyToken,
  checkOwner,
  ProductController.getById
);

// POST /api/products
// Buat produk baru
router.post(
  '/',
  verifyToken,
  checkOwner,
  ProductController.create
);

// PUT /api/products/:id
// Update produk milik Owner
router.put(
  '/:id',
  verifyToken,
  checkOwner,
  ProductController.update
);

// DELETE /api/products/:id
// Hapus produk milik Owner
router.delete(
  '/:id',
  verifyToken,
  checkOwner,
  ProductController.delete
);

module.exports = router;