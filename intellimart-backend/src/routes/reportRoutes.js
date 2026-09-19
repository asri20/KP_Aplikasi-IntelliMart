const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

// GET /api/reports/product-catalog       - Katalog produk lengkap (nama, kategori, brand, harga, stok per toko)
// GET /api/reports/low-stock             - Daftar varian yang stoknya <= min_stock
// GET /api/reports/sales-daily           - Total transaksi & revenue per toko per hari (LUNAS saja)
// GET /api/reports/best-selling          - Produk terlaris per toko
// GET /api/reports/customer-segment      - Segmen terbaru tiap customer

router.get('/product-catalog', ReportController.productCatalog);
router.get('/low-stock',       ReportController.lowStock);
router.get('/sales-daily',     ReportController.salesDaily);
router.get('/best-selling',    ReportController.bestSelling);
router.get('/customer-segment', ReportController.customerSegment);

module.exports = router;
