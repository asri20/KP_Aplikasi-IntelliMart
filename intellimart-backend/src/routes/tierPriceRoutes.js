const express = require('express');
const router = express.Router();
const TierPriceController = require('../controllers/tierPriceController');

// GET    /api/tier-prices                      - Ambil semua harga tier (opsional: ?price_code_id=1)
// GET    /api/tier-prices/:id                  - Ambil harga tier by ID
// POST   /api/tier-prices                      - Buat harga tier baru
// PUT    /api/tier-prices/:id                  - Update harga tier
// DELETE /api/tier-prices/:id                  - Hapus harga tier

router.get('/',    TierPriceController.getAll);
router.get('/:id', TierPriceController.getById);
router.post('/',   TierPriceController.create);
router.put('/:id', TierPriceController.update);
router.delete('/:id', TierPriceController.delete);

module.exports = router;
