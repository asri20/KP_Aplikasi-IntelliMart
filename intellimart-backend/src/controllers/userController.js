// src/controllers/userController.js
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { logActivity } = require('../helpers/loggerHelper'); // ✅ 1. Import helper logActivity

// ========================================================
// CREATE USER (Manager / Cashier) - KHUSUS OWNER
// ========================================================
async function createUserByOwner(req, res) {
  try {
    const {
      name,
      email,
      password,
      phone,
      role_name,
      store_id
    } = req.body;

    // 1. Validasi input dasar
    if (!name || !email || !password || !phone || !role_name) {
      return res.status(400).json({
        success: false,
        message: 'Field name, email, password, phone, dan role_name wajib diisi.'
      });
    }

    // 2. Format string role agar konsisten (Capitalize)
    const formattedRole =
      role_name.charAt(0).toUpperCase() +
      role_name.slice(1).toLowerCase();

    // 3. Tolak role selain Manager dan Cashier
    const allowedRoles = ['Manager', 'Cashier'];
    if (!allowedRoles.includes(formattedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Owner hanya dapat membuat user dengan role Manager atau Cashier.'
      });
    }

    // 4. Logika Pembuatan Akun Cashier
    if (formattedRole === 'Cashier') {
      const existingCashier = await userModel.findByEmail(email);

      if (existingCashier) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar.'
        });
      }

      const cashierRole = await userModel.findRoleByName('Cashier');

      if (!cashierRole) {
        return res.status(500).json({
          success: false,
          message: 'Role Cashier tidak ditemukan di database.'
        });
      }

      const hashedCashierPassword = await bcrypt.hash(password, 10);

      const newCashier = await userModel.createUser({
        name,
        email,
        password: hashedCashierPassword,
        phone,
        role_id: cashierRole.id,
        is_active: 1
      });

      await logActivity(
        req.user.id,
        'CREATE_USER',
        'tm_users',
        newCashier.id
      );

      return res.status(201).json({
        success: true,
        message: 'Berhasil membuat akun Cashier.',
        data: {
          id: newCashier.id,
          name: newCashier.name,
          email: newCashier.email,
          phone: newCashier.phone,
          role_id: cashierRole.id,
          role_name: 'Cashier',
          is_active: 1
        }
      });
    }

    // 5. Logika Pembuatan Akun Manager (Wajib ditugaskan ke toko)
    const storeId = Number(store_id);

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Pilih toko yang valid untuk Manager.'
      });
    }

    // Cek email sebelum membuat akun
    const existingUser = await userModel.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar.'
      });
    }

    const roleData = await userModel.findRoleByName('Manager');

    if (!roleData) {
      return res.status(500).json({
        success: false,
        message: 'Role Manager tidak ditemukan di database.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);



// Buat Manager dan hubungkan ke toko milik Owner
const newManager = await userModel.createManagerForStore(
  {
    name,
    email,
    password: hashedPassword,
    phone,
    role_id: roleData.id
  },
  storeId,
  req.user.id
);


    await logActivity(
      req.user.id,
      'CREATE_USER',
      'tm_users',
      newManager.id
    );

    await logActivity(
      req.user.id,
      'ASSIGN_MANAGER',
      'tm_store',
      storeId
    );

    return res.status(201).json({
      success: true,
      message: 'Akun Manager berhasil dibuat dan ditugaskan ke toko.',
      data: {
        ...newManager,
        role_name: 'Manager',
        store_id: storeId
      }
    });

  } catch (error) {
    console.error('Error Create User by Owner:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Terjadi kesalahan server saat membuat user.'
    });
  }
}

// ========================================================
// CHANGE PASSWORD (Mandiri)
// ========================================================
async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id; // Diambil otomatis dari JWT via middleware verifyToken

    // 1. Validasi input
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini (current_password) dan password baru (new_password) wajib diisi.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter.'
      });
    }

    // 2. Ambil data user dari database
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    // 3. Verifikasi apakah current_password cocok dengan hash di database
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password saat ini salah.'
      });
    }

    // 4. Hash password baru
    const newHashedPassword = await bcrypt.hash(new_password, 10);

    // 5. Simpan password baru ke database
    await userModel.updatePassword(userId, newHashedPassword);

    // 📝 6. Catat aktivitas ubah password ke tt_activity_log
    await logActivity(userId, 'CHANGE_PASSWORD', 'tm_users', userId);

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diperbarui. Silakan gunakan password baru untuk login berikutnya.'
    });

  } catch (error) {
    console.error('Error Change Password:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengubah password.'
    });
  }
}

// ========================================================
// GET MANAGERS BERDASARKAN TOKO MILIK OWNER
// ========================================================
async function getUsers(req, res) {
  try {
    const users = await userModel.getManagersByOwnerId(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar Manager toko Anda.',
      data: users
    });
  } catch (error) {
    console.error('Error Get Managers:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengambil data Manager.'
    });
  }
}

// ========================================================
// TOGGLE STATUS MANAGER MILIK OWNER
// ========================================================
async function toggleUserStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { is_active } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID user tidak valid.'
      });
    }

    if (is_active !== 0 && is_active !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Field is_active wajib bernilai 1 atau 0.'
      });
    }

    // Ambil Manager yang ditugaskan ke toko milik Owner login
    const managers = await userModel.getManagersByOwnerId(req.user.id);
    const manager = managers.find(user => Number(user.id) === id);

    // Tolak jika Manager bukan bagian dari toko Owner ini
    if (!manager) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk mengubah status Manager ini.'
      });
    }

    await userModel.updateStatus(id, is_active);

    const actionName = is_active === 1
      ? 'ACTIVATE_USER'
      : 'DEACTIVATE_USER';

    await logActivity(req.user.id, actionName, 'tm_users', id);

    const statusText = is_active === 1
      ? 'diaktifkan'
      : 'dinonaktifkan';

    return res.status(200).json({
      success: true,
      message: `Manager ${manager.name} berhasil ${statusText}.`
    });
  } catch (error) {
    console.error('Error Toggle Manager Status:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengubah status Manager.'
    });
  }
}




module.exports = {
  createUserByOwner,
  changePassword,
  getUsers,
  toggleUserStatus,
};