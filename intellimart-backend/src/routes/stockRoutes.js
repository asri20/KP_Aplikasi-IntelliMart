const express = require('express');
const router = express.Router();
const ProductStockController = require('../controllers/productStockController');

// GET    /api/stocks                              - Ambil semua (opsional: ?store_id=1 dan/atau ?variant_id=1)
// GET    /api/stocks/:store_id/:variant_id         - Ambil satu kombinasi toko+varian
// POST   /api/stocks                               - Buat harga/pengaturan awal (stock selalu mulai 0)
// PUT    /api/stocks/:store_id/:variant_id         - Update harga/pengaturan (TIDAK bisa ubah stock)
// DELETE /api/stocks/:store_id/:variant_id         - Hapus data harga/stok kombinasi ini

router.get('/',    ProductStockController.getAll);
router.get('/:store_id/:variant_id', ProductStockController.getOne);
router.post('/',   ProductStockController.create);
router.put('/:store_id/:variant_id', ProductStockController.update);
router.delete('/:store_id/:variant_id', ProductStockController.delete);

module.exports = router;
