const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/", transactionController.getAllTransactions);
router.post("/checkout", transactionController.createCheckout);

module.exports = router;
