
const express = require('express');
const router = express.Router();

const VariantController = require('../controllers/variantController');
const { verifyToken, checkOwner } = require('../middlewares/authMiddleware');

// Semua endpoint varian hanya dapat diakses Owner yang sudah login.
router.use(verifyToken, checkOwner);

router.get('/', VariantController.getAll);
router.get('/:id', VariantController.getById);
router.post('/', VariantController.create);
router.put('/:id', VariantController.update);
router.delete('/:id', VariantController.delete);

module.exports = router;
