const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Route untuk Produk Terlaris
router.get('/top-products', analyticsController.getTopProducts);

// Route untuk Laporan Keuntungan
router.get('/profit', analyticsController.getProfitReport);

// Anda dapat menambahkan route /forecast nanti saat Modul 6 (AI) sudah siap
// router.get('/forecast', analyticsController.getForecast);

module.exports = router;
