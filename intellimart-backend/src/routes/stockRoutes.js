// src/routes/stockRoutes.js

const express = require("express");
const router = express.Router();

const StockController = require("../controllers/stockController");

/**
 * =====================================================
 * STOCK IN / OUT
 * =====================================================
 */
router.post("/in", StockController.stockIn);

router.post("/out", StockController.stockOut);


/**
 * =====================================================
 * STOCK BALANCE
 * =====================================================
 */
router.get("/", StockController.getAllStock);


/**
 * =====================================================
 * STOCK HISTORY
 * =====================================================
 */
router.get("/history", StockController.getMovementHistory);


/**
 * =====================================================
 * LOW STOCK
 * =====================================================
 */
router.get("/low-stock", StockController.getLowStock);

module.exports = router;