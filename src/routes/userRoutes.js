const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkOwner, checkOwnerOrManager } = require('../middlewares/authMiddleware');

// Endpoint: POST /api/users (Proteksi: Wajib Token + Owner atau Manager untuk Cashier)
router.post('/', verifyToken, checkOwnerOrManager, userController.createUserByOwner);
router.put('/change-password', verifyToken, userController.changePassword);

// Route khusus Owner & Manager untuk melihat daftar Kasir
router.get('/cashiers', verifyToken, checkOwnerOrManager, userController.getCashiers);

// Route khusus Owner
router.get('/', verifyToken, checkOwner, userController.getUsers);
router.patch('/:id/status', verifyToken, checkOwnerOrManager, userController.toggleUserStatus);

module.exports = router;