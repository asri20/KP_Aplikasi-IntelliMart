const express = require("express");
const router = express.Router();

const controller = require("../controllers/dashboardController");

router.get("/summary", controller.getSummary);
router.get("/sales-trend", controller.getSalesTrend);
router.get("/top-products", controller.getTopProducts);
router.get("/low-stock", controller.getLowStock);
router.get("/recent-transactions", controller.getRecentTransactions);
router.get("/profit", controller.getProfitReport);

module.exports = router;
