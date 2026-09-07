const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkOwner } = require('../middlewares/authMiddleware');

// Endpoint: POST /api/users (Proteksi: Wajib Token + Harus Role Owner)
router.post('/', verifyToken, checkOwner, userController.createUserByOwner);
router.put('/change-password', verifyToken, userController.changePassword);

// Route khusus Owner
router.post('/', verifyToken, checkOwner, userController.createUserByOwner);
router.get('/', verifyToken, checkOwner, userController.getUsers);
router.patch('/:id/status', verifyToken, checkOwner, userController.toggleUserStatus);

//hanya user yang rolenya punya permission 'manage_usesrs' yang bisa panggil route ini


module.exports = router;