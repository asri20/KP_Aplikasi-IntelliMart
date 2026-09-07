// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const { logActivity } = require('../helpers/loggerHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_intellimart_super_aman';

// ========================================================
// 1. REGISTER OWNER
// ========================================================
async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, dan phone wajib diisi'
      });
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    const ownerRole = await userModel.findRoleByName('Owner');
    if (!ownerRole) {
      return res.status(500).json({
        success: false,
        message: 'Role Owner tidak ditemukan di database'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role_id: ownerRole.id,
      is_active: 1
    });

    await logActivity(newUser.id, 'REGISTER_OWNER', 'tm_users', newUser.id);

    return res.status(201).json({
      success: true,
      message: 'Registrasi Owner berhasil',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role_id: ownerRole.id,
        is_active: 1
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat registrasi'
    });
  }
}

// ========================================================
// 2. LOGIN USER
// ========================================================
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi'
      });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    if (user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda dinonaktifkan'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // A. Simpan Session ke tt_user_session via sessionModel
    const userAgent = req.headers['user-agent'];
    await sessionModel.createSession(user.id, token, userAgent);

    // B. Catat Activity Log ke tt_activity_log via logActivity helper
    await logActivity(user.id, 'LOGIN', `User ${user.email} berhasil login`, 'tm_users', user.id, req.ip);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat login'
    });
  }
}

// ========================================================
// 3. LOGOUT USER
// ========================================================
async function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const userId = req.user.id;

    if (token) {
      await sessionModel.deleteSessionByToken(token);
    }

    await logActivity(userId, 'LOGOUT', 'User berhasil logout dari sistem', 'tm_users', userId, req.ip);

    return res.status(200).json({
      success: true,
      message: 'Berhasil logout. Sesi telah diakhiri.'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat logout'
    });
  }
}

module.exports = {
  register,
  login,
  logout
};