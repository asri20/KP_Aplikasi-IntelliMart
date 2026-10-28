// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// GET    /api/categories       - Ambil semua kategori
// GET    /api/categories/:id   - Ambil kategori by ID
// POST   /api/categories       - Buat kategori baru
// PUT    /api/categories/:id   - Update kategori
// DELETE /api/categories/:id   - Hapus kategori

router.get('/',    CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/',   CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

module.exports = router;
