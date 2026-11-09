const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireStoreAccess, checkRole } = require('../middlewares/storeAccess');

// Semua laporan wajib login
router.use(verifyToken);

// GET /api/reports/product-catalog?store_id=X&search=keyword
router.get('/product-catalog', requireStoreAccess(), analyticsController.getProductCatalog);

// GET /api/reports/low-stock?store_id=X&store_name=Y
router.get('/low-stock', requireStoreAccess(), dashboardController.getLowStock);

// GET /api/reports/sales-daily?store_id=X&days=30
router.get('/sales-daily', requireStoreAccess(), analyticsController.getSalesTrend);

// GET /api/reports/best-selling?store_id=X&limit=10
router.get('/best-selling', requireStoreAccess(), analyticsController.getTopProducts);

// GET /api/reports/customer-segment - hanya Owner & Manager
router.get('/customer-segment', checkRole('owner', 'manager'), analyticsController.getCustomerSegments);

module.exports = router;
