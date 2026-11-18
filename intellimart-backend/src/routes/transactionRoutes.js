const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactionController");
const customerController = require("../controllers/customerController");

router.get("/payment-methods", transactionController.getPaymentMethods);

// Daftar pelanggan untuk POS
router.get("/customers", customerController.getPOSCustomers);

router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransactionDetail);
router.post("/checkout", transactionController.createCheckout);

module.exports = router;
