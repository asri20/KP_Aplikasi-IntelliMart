const express = require('express');
const router = express.Router();
const PriceCodeController = require('../controllers/priceCodeController');

// GET   /api/price-codes                  - Ambil semua kode harga
// GET   /api/price-codes/:id              - Ambil kode harga by ID
// POST  /api/price-codes                  - Buat kode harga baru
// PATCH /api/price-codes/:id/activate     - Aktifkan kode harga
// PATCH /api/price-codes/:id/deactivate   - Nonaktifkan kode harga (bukan delete)

router.get('/',    PriceCodeController.getAll);
router.get('/:id', PriceCodeController.getById);
router.post('/',   PriceCodeController.create);
router.patch('/:id/activate',   PriceCodeController.activate);
router.patch('/:id/deactivate', PriceCodeController.deactivate);

module.exports = router;
