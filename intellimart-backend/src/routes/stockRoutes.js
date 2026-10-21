
const express = require('express');
const router = express.Router();

const ProductStockController = require('../controllers/productStockController');
const { verifyToken, checkOwner } = require('../middlewares/authMiddleware');

// Khusus Owner
router.use(verifyToken, checkOwner);

// Semua endpoint stok wajib login dan memiliki permission manage_stores
// router.use(verifyToken, checkPermission('manage_stores'));

router.get('/', ProductStockController.getAll);
router.get('/:store_id/:variant_id', ProductStockController.getOne);
router.post('/', ProductStockController.create);
router.put('/:store_id/:variant_id', ProductStockController.update);
router.delete('/:store_id/:variant_id', ProductStockController.delete);

module.exports = router;
