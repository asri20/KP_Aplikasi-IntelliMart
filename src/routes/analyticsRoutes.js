const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireStoreAccess, checkRole } = require('../middlewares/storeAccess');

// Semua endpoint analitik wajib login
router.use(verifyToken);

// GET /api/analytics/top-products?store_id=X&limit=10
router.get('/top-products', requireStoreAccess(), analyticsController.getTopProducts);

// GET /api/analytics/profit?store_id=X&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get('/profit', requireStoreAccess(), analyticsController.getProfitReport);

// GET /api/analytics/sales-trend?store_id=X&days=30
router.get('/sales-trend', requireStoreAccess(), analyticsController.getSalesTrend);

// GET /api/analytics/product-catalog?store_id=X&search=keyword
router.get('/product-catalog', requireStoreAccess(), analyticsController.getProductCatalog);

// GET /api/analytics/customer-segments - hanya Owner & Manager
router.get('/customer-segments', checkRole('owner', 'manager'), analyticsController.getCustomerSegments);

module.exports = router;
