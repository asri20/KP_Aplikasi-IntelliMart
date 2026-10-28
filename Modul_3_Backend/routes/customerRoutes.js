const express = require('express');
const router = express.Router();
const { 
  getAllCustomers, 
  createCustomer, 
  upgradeToReseller,
  registerStore 
} = require('../controllers/customerController');

router.get('/customers', getAllCustomers);
router.post('/customers', createCustomer); 
router.post('/upgrade-reseller', upgradeToReseller);

// Endpoint baru untuk pendaftaran toko lengkap
router.post('/register-store', registerStore);

module.exports = router;