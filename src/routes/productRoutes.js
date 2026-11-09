const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/productController');
const { verifyToken, checkOwner, checkOwnerOrManager } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, checkOwnerOrManager, ProductController.getAll);
router.get('/:id', verifyToken, checkOwnerOrManager, ProductController.getById);
router.post('/', verifyToken, checkOwnerOrManager, ProductController.create);
router.put('/:id', verifyToken, checkOwnerOrManager, ProductController.update);
router.delete('/:id', verifyToken, checkOwnerOrManager, ProductController.delete);

module.exports = router;
