
const express = require('express');
const router = express.Router();

const StockMovementController = require('../controllers/stockMovementController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

// Semua endpoint wajib login dan memiliki permission manage_stores
router.use(verifyToken, checkPermission('manage_stock'));

router.get('/', StockMovementController.getAll);
router.get('/:id', StockMovementController.getById);
router.post('/', StockMovementController.create);

module.exports = router;
