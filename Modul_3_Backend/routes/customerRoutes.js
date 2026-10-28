const express = require('express');
const router = express.Router();
const { 
  getAllCustomers, 
  createCustomer, 
  upgradeToReseller,
  registerStore,
  createTransaction,
  getPurchaseHistory
} = require('../controllers/customerController');

router.get('/customers', getAllCustomers);
router.post('/customers', createCustomer); 
router.post('/upgrade-reseller', upgradeToReseller);

// Endpoint untuk pendaftaran toko lengkap
router.post('/register-store', registerStore);

// RUTE BARU: Pencatatan transaksi dan riwayat pembelian pelanggan
router.post('/transactions', createTransaction);
router.get('/history/:user_id', getPurchaseHistory);

module.exports = router;