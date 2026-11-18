const express = require("express");
const router = express.Router();

const controller = require("../controllers/salesAnalyticsController");

router.get("/customers", controller.getCustomerAnalytics);
router.get("/best-selling-products", controller.getBestSellingProducts);

module.exports = router;
