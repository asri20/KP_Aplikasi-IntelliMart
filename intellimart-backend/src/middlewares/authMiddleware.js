const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_intellimart_super_aman';

// ========================================================
// 1. VERIFIKASI JWT TOKEN
// ========================================================
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format Header wajib: "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak ditemukan.'
    });
  }

  try {
    // Verify token JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Optional: Pastikan user masih aktif di database
    const user = await userModel.findByEmail(decoded.email);
    if (!user || user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: 'Akses dilarang. Akun tidak ditemukan atau sedang nonaktif.'
      });
    }

    // Simpan data user hasil decode ke object req agar bisa dipakai di controller berikutnya
    req.user = decoded;
    next(); // Lanjut ke middleware / controller berikutnya

  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluwarsa.'
    });
  }
};

// ========================================================
// 2. VERIFIKASI KHUSUS ROLE OWNER
// ========================================================
const checkOwner = (req, res, next) => {
  // Dipanggil SETELAH verifyToken, jadi req.user dipastikan ada
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }

  // Cek apakah role_name adalah 'Owner' atau role_id = 1
  if (req.user.role_name !== 'Owner' && req.user.role_id !== 1) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Fitur ini hanya dapat diakses oleh Owner.'
    });
  }

  next();
};

/**
 * Middleware untuk mengecek apakah role user memiliki permission tertentu
 * @param {string} requiredPermission - Nama permission (misal: 'manage_users')
 */
function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      // Pastikan req.user ada dari verifyToken
      if (!req.user || !req.user.role_id) {
        return res.status(401).json({
          success: false,
          message: 'Sesi tidak valid atau role_id tidak ditemukan pada token.'
        });
      }

      const roleId = req.user.role_id;

      // Ambil daftar permission role user dari DB
      const userPermissions = await userModel.getPermissionsByRoleId(roleId);

      // Cek apakah permission yang dibutuhkan ada
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: `Akses ditolak. Anda tidak memiliki izin '${requiredPermission}'.`
        });
      }

      next();
    } catch (error) {
      // 🔍 Print error asli ke terminal VS Code untuk mempermudah analisa
      console.error('Error detail pada checkPermission:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada verifikasi hak akses.'
      });
    }
  };
}

module.exports = {
  verifyToken,
  checkOwner,
  checkPermission
};