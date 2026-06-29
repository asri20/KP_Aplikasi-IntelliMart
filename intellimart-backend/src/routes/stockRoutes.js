// src/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const StockController = require('../controllers/stockController');

// POST /api/stocks/in        - Stok masuk
// POST /api/stocks/out       - Stok keluar
// GET  /api/stocks/low-stock - Produk dengan stok rendah

// PENTING: Route dengan path spesifik harus didefinisikan
// SEBELUM route dengan parameter (:id)
router.post('/in',        StockController.stockIn);
router.post('/out',       StockController.stockOut);
router.get('/low-stock',  StockController.getLowStock);

module.exports = router;
