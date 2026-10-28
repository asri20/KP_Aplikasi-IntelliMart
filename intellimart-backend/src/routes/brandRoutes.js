// src/routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/brandController');

// GET    /api/brands       - Ambil semua brand
// GET    /api/brands/:id   - Ambil brand by ID
// POST   /api/brands       - Buat brand baru
// PUT    /api/brands/:id   - Update brand
// DELETE /api/brands/:id   - Hapus brand

router.get('/',    BrandController.getAll);
router.get('/:id', BrandController.getById);
router.post('/',   BrandController.create);
router.put('/:id', BrandController.update);
router.delete('/:id', BrandController.delete);

module.exports = router;
