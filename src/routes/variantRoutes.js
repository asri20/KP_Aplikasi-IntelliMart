const express = require('express');
const router = express.Router();

const VariantController = require('../controllers/variantController');
const { verifyToken, checkOwner, checkOwnerOrManager } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, checkOwnerOrManager, VariantController.getAll);
router.get('/:id', verifyToken, checkOwnerOrManager, VariantController.getById);
router.post('/', verifyToken, checkOwnerOrManager, VariantController.create);
router.put('/:id', verifyToken, checkOwnerOrManager, VariantController.update);
router.delete('/:id', verifyToken, checkOwnerOrManager, VariantController.delete);

module.exports = router;
