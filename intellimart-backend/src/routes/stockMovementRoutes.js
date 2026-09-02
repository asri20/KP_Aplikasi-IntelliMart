const express = require('express');
const router = express.Router();
const StockMovementController = require('../controllers/stockMovementController');

// GET  /api/stock-movements                     - Ambil histori pergerakan stok (max 100 terbaru)
// GET  /api/stock-movements?store_id=1          - Filter per toko
// GET  /api/stock-movements?variant_id=1        - Filter per varian
// GET  /api/stock-movements/:id                 - Ambil satu pergerakan stok by ID
// POST /api/stock-movements                     - Catat pergerakan stok baru (stok otomatis ter-update via trigger DB)

router.get('/',    StockMovementController.getAll);
router.get('/:id', StockMovementController.getById);
router.post('/',   StockMovementController.create);

module.exports = router;
