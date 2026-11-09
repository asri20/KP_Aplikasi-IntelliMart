// src/routes/storeRoutes.js
const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { verifyToken, checkOwner, checkOwnerOrManager } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, checkOwner, storeController.createStore);
router.get('/', verifyToken, checkOwnerOrManager, storeController.getMyStores);
router.put('/assign-manager', verifyToken, checkOwner, storeController.assignManagerToStore);

module.exports = router;
