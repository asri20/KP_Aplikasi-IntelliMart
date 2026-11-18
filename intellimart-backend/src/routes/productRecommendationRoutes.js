const express = require("express");
const router = express.Router();

const controller = require("../controllers/productRecommendationController");

router.get("/upsell", controller.getUpselling);
router.get("/cross-sell", controller.getCrossSelling);

module.exports = router;
