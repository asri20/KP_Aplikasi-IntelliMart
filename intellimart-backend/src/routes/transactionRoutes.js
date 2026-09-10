const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransactionDetail); // Route untuk Cetak Struk / Invoice
router.post("/checkout", transactionController.createCheckout);

module.exports = router;
