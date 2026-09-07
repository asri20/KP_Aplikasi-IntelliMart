// src/routes/storeRoutes.js
const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, checkPermission('manage_stores'), storeController.createStore);
router.get('/', verifyToken, checkPermission('manage_stores'), storeController.getMyStores);
router.put('/assign-manager', verifyToken, checkPermission('manage_stores'), storeController.assignManagerToStore);

module.exports = router;