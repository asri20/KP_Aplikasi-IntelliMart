const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_intellimart_super_aman';

// ========================================================
// 1. VERIFIKASI JWT TOKEN
// ========================================================
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak ditemukan.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.log('JWT VERIFY ERROR:', error.name, '-', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluwarsa.',
    });
  }

  try {
    const user = await userModel.findByEmail(decoded.email);
    if (!user || Number(user.is_active) === 0) {
      return res.status(403).json({
        success: false,
        message: 'Akses dilarang. Akun tidak ditemukan atau sedang nonaktif.',
      });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    console.log('DB/USER CHECK ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memeriksa data user.',
    });
  }
};

// ========================================================
// 2. VERIFIKASI KHUSUS ROLE OWNER
// ========================================================
const checkOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }

  if (
    String(req.user.role_name || '').toLowerCase() !== 'owner' &&
    Number(req.user.role_id) !== 1
  ) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Fitur ini hanya dapat diakses oleh Owner.',
    });
  }

  next();
};

/**
 * Verifikasi Owner atau Manager
 */
const checkOwnerOrManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }

  const roleName = String(req.user.role_name || '').toLowerCase();
  const roleId = Number(req.user.role_id);

  if (
    roleName !== 'owner' &&
    roleName !== 'manager' &&
    roleId !== 1 &&
    roleId !== 2
  ) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Fitur ini hanya dapat diakses oleh Owner atau Manager.',
    });
  }

  next();
};

/**
 * Middleware untuk mengecek apakah role user memiliki permission tertentu
 * @param {string} requiredPermission - Nama permission (misal: 'manage_stores')
 */
function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role_id) {
        return res.status(401).json({
          success: false,
          message: 'Sesi tidak valid atau role_id tidak ditemukan pada token.',
        });
      }

      const roleId = Number(req.user.role_id);
      const roleName = String(req.user.role_name || '').toLowerCase();

      // Fallback untuk Owner & Manager pada manage_stores jika tabel permission kosong
      let userPermissions = [];
      try {
        userPermissions = await userModel.getPermissionsByRoleId(roleId);
      } catch (err) {
        console.warn('[checkPermission] fallback role check:', err.message);
      }

      const isAllowedByFallback =
        requiredPermission === 'manage_stores' &&
        (roleId === 1 || roleId === 2 || roleName === 'owner' || roleName === 'manager');

      if (!userPermissions.includes(requiredPermission) && !isAllowedByFallback) {
        return res.status(403).json({
          success: false,
          message: `Akses ditolak. Anda tidak memiliki izin '${requiredPermission}'.`,
        });
      }

      next();
    } catch (error) {
      console.error('Error detail pada checkPermission:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada verifikasi hak akses.',
      });
    }
  };
}

module.exports = {
  verifyToken,
  checkOwner,
  checkOwnerOrManager,
  checkPermission,
  JWT_SECRET,
};
