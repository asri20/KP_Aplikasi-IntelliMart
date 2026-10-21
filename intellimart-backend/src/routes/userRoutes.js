
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { verifyToken, checkOwner } = require('../middlewares/authMiddleware');

// Kelola akun — khusus Owner
router.post('/', verifyToken, checkOwner, userController.createUserByOwner);
router.get('/', verifyToken, checkOwner, userController.getUsers);
router.patch('/:id/status', verifyToken, checkOwner, userController.toggleUserStatus);

// Ganti password — user yang sudah login
router.put('/change-password', verifyToken, userController.changePassword);

module.exports = router;
