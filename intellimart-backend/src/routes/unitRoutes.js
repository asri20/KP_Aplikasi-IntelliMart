// src/routes/unitRoutes.js
const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/unitController');

// GET    /api/units       - Ambil semua satuan
// GET    /api/units/:id   - Ambil satuan by ID
// POST   /api/units       - Buat satuan baru
// PUT    /api/units/:id   - Update satuan
// DELETE /api/units/:id   - Hapus satuan

router.get('/',    UnitController.getAll);
router.get('/:id', UnitController.getById);
router.post('/',   UnitController.create);
router.put('/:id', UnitController.update);
router.delete('/:id', UnitController.delete);

module.exports = router;
