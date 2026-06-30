// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, StoreUser, Store, Role, sequelize } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'intellimart_super_secret_2026';

// REGISTER (Bisa pilih toko)
exports.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password, phone, store_id, role_id = 1 } = req.body;

    if (!name || !email || !password || !store_id) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Name, email, password, dan store_id wajib diisi' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
    }, { transaction: t });

    // Cek apakah toko ada
    const store = await Store.findByPk(store_id);
    if (!store) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Toko tidak ditemukan' });
    }

    // Daftarkan user ke toko dengan role yang dipilih
    await StoreUser.create({
      store_id,
      user_id: user.user_id,
      role_id
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'User berhasil didaftarkan dan ditambahkan ke toko',
      data: { 
        user_id: user.user_id, 
        name: user.name, 
        email: user.email,
        store_id: store_id,
        role_id: role_id
      }
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// LOGIN (Versi Debug)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'Email tidak ditemukan' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Password salah' });

    // Hardcode store_id untuk test
    const token = jwt.sign({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      store_id: 1   // ← Hardcode dulu
    }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login berhasil (test mode)',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = exports;