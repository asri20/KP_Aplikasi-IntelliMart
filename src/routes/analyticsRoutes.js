const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/top-products?store_id=X&limit=10
router.get('/top-products', analyticsController.getTopProducts);

// GET /api/analytics/profit?store_id=X&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get('/profit', analyticsController.getProfitReport);

// GET /api/analytics/sales-trend?store_id=X&days=30
router.get('/sales-trend', analyticsController.getSalesTrend);

// GET /api/analytics/product-catalog?store_id=X&search=keyword
router.get('/product-catalog', analyticsController.getProductCatalog);

// GET /api/analytics/customer-segments
router.get('/customer-segments', analyticsController.getCustomerSegments);

module.exports = router;
