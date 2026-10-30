const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const dashboardController = require('../controllers/dashboardController');

// GET /api/reports/product-catalog?store_id=X&search=keyword
router.get('/product-catalog', analyticsController.getProductCatalog);

// GET /api/reports/low-stock?store_id=X&store_name=Y
router.get('/low-stock', dashboardController.getLowStock);

// GET /api/reports/sales-daily?store_id=X&days=30
router.get('/sales-daily', analyticsController.getSalesTrend);

// GET /api/reports/best-selling?store_id=X&limit=10
router.get('/best-selling', analyticsController.getTopProducts);

// GET /api/reports/customer-segment
router.get('/customer-segment', analyticsController.getCustomerSegments);

module.exports = router;
