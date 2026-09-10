const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkOwner } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);

// Endpoint Protected Khusus Owner (Contoh Uji Coba Middleware)
// router.get('/me', verifyToken, checkOwner, (req, res) => {
//   return res.status(200).json({
//     success: true,
//     message: 'Berhasil mengakses endpoint rahasia Owner',
//     userLoggedIn: req.user
//   });
// });

module.exports = router;