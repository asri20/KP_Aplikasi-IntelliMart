const express = require('express');
const router = express.Router();

const ProductStockController = require('../controllers/productStockController');
const { verifyToken, checkOwner, checkOwnerOrManager } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, ProductStockController.getAll);
router.get('/:store_id/:variant_id', verifyToken, checkOwnerOrManager, ProductStockController.getOne);
router.post('/', verifyToken, checkOwnerOrManager, ProductStockController.create);
router.put('/:store_id/:variant_id', verifyToken, checkOwnerOrManager, ProductStockController.update);
router.delete('/:store_id/:variant_id', verifyToken, checkOwnerOrManager, ProductStockController.delete);

module.exports = router;
