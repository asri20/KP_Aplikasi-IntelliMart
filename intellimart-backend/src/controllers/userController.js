// src/controllers/userController.js
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { logActivity } = require('../helpers/loggerHelper'); // ✅ 1. Import helper logActivity

// ========================================================
// CREATE USER (Manager / Cashier) - KHUSUS OWNER
// ========================================================
async function createUserByOwner(req, res) {
  try {
    const { name, email, password, phone, role_name } = req.body;

    // 1. Validasi input
    if (!name || !email || !password || !phone || !role_name) {
      return res.status(400).json({
        success: false,
        message: 'Field name, email, password, phone, dan role_name wajib diisi.'
      });
    }

    // 2. Batasi role yang boleh dibuat oleh Owner (Hanya Manager & Cashier)
    const allowedRoles = ['Manager', 'Cashier'];
    const formattedRole = role_name.charAt(0).toUpperCase() + role_name.slice(1).toLowerCase();

    if (!allowedRoles.includes(formattedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Owner hanya dapat membuat user dengan role Manager atau Cashier.'
      });
    }

    // 3. Cek apakah email sudah terdaftar
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar.'
      });
    }

    // 4. Cari ID Role di tm_roles secara dinamis
    const roleData = await userModel.findRoleByName(formattedRole);
    if (!roleData) {
      return res.status(500).json({
        success: false,
        message: `Role ${formattedRole} tidak ditemukan di database.`
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Simpan user baru ke database
    const newUser = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role_id: roleData.id,
      is_active: 1
    });

    // 📝 7. Catat aktivitas pembuatan user baru ke tt_activity_log
    await logActivity(req.user.id, 'CREATE_USER', 'tm_users', newUser.id);

    // 8. Response sukses
    return res.status(201).json({
      success: true,
      message: `Berhasil membuat akun ${formattedRole}`,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role_id: roleData.id,
        role_name: formattedRole,
        is_active: 1
      }
    });

  } catch (error) {
    console.error('Error Create User by Owner:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat membuat user.'
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
// GET ALL USERS (Khusus Owner)
// ========================================================
async function getUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar user',
      data: users
    });
  } catch (error) {
    console.error('Error Get Users:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengambil data user.'
    });
  }
}

// ========================================================
// TOGGLE USER STATUS (Khusus Owner)
// ========================================================
async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // Validasi input status
    if (is_active === undefined || (is_active !== 0 && is_active !== 1)) {
      return res.status(400).json({
        success: false,
        message: 'Field is_active wajib diisi dengan nilai 1 (aktif) atau 0 (nonaktif).'
      });
    }

    // Mencegah Owner menonaktifkan dirinya sendiri
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menonaktifkan akun Owner Anda sendiri.'
      });
    }

    // Cek keberadaan user
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    // Update status di database
    await userModel.updateStatus(id, is_active);

    // 📝 Catat aktivitas toggle status ke tt_activity_log
    const actionName = is_active === 1 ? 'ACTIVATE_USER' : 'DEACTIVATE_USER';
    await logActivity(req.user.id, actionName, 'tm_users', id);

    const statusText = is_active === 1 ? 'diaktifkan' : 'dinonaktifkan';
    return res.status(200).json({
      success: true,
      message: `User ${user.name} berhasil ${statusText}.`
    });

  } catch (error) {
    console.error('Error Toggle Status:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengubah status user.'
    });
  }
}

async function getPermissionsByRoleId(roleId){
  const [rows]= await db.query(`
    SELECT p.name
    FROM tt_permission p
    JOIN tt_role_ermission rp ON p.id = rp.permission_id
    WHERE rp.role_id = ?
  `, [roleId]);

  return rows.map(row => row.name); //Mengembalikan array string misal: ['manage_users', 'view_reports']
}


module.exports = {
  createUserByOwner,
  changePassword,
  getUsers,
  toggleUserStatus,
  getPermissionsByRoleId
};