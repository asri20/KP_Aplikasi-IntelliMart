const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stores - Daftar toko aktif
router.get('/stores', dashboardController.getStores);

// GET /api/dashboard/summary?store_id=X - Ringkasan KPI statistik
router.get('/summary', dashboardController.getSummary);

// GET /api/dashboard/low-stock?store_id=X - Peringatan stok menipis
router.get('/low-stock', dashboardController.getLowStock);

// GET /api/dashboard/recent-transactions?store_id=X - Transaksi terbaru
router.get('/recent-transactions', dashboardController.getRecentTransactions);

module.exports = router;
