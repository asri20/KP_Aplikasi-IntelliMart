const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/top-products', analyticsController.getTopProducts);
router.get('/profit', analyticsController.getProfitReport);
router.get('/sales-trend', analyticsController.getSalesTrend);

module.exports = router;
