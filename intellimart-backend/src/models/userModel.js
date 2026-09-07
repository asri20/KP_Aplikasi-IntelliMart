const db = require('../config/db'); // Sesuaikan dengan lokasi db.js kamu

// Fungsi untuk mencari role_id berdasarkan nama role (misal: 'Owner')
async function findRoleByName(roleName) {
    const [rows] = await db.query(
        'SELECT id FROM tm_roles WHERE LOWER(role_name) = LOWER(?)',
        [roleName]
    );
    return rows[0] || null;
}

// Fungsi pendukung lainnya di userModel.js...
async function findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM tm_users WHERE email = ?', [email]);
    return rows[0] || null;
}

async function createUser(userData) {
    const { name, email, password, phone, role_id, is_active } = userData;
    const [result] = await db.query(
        `INSERT INTO tm_users (name, email, password, phone, role_id, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [name, email, password, phone, role_id, is_active || 1]
    );
    return { id: result.insertId, ...userData };
}

// Ambil data user lengkap berdasarkan ID (termasuk password hash)
async function findById(id) {
  const [rows] = await db.query(
    'SELECT id, name, email, password, role_id, is_active FROM tm_users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

// Update password user berdasarkan ID
async function updatePassword(id, newHashedPassword) {
  const [result] = await db.query(
    'UPDATE tm_users SET password = ?, updated_at = NOW() WHERE id = ?',
    [newHashedPassword, id]
  );
  return result.affectedRows > 0;
}

// Ambil semua daftar user beserta nama role-nya
async function getAllUsers() {
  const [rows] = await db.query(`
    SELECT u.id, u.name, u.email, u.phone, u.is_active, r.role_name, u.created_at
    FROM tm_users u
    JOIN tm_roles r ON u.role_id = r.id
    ORDER BY u.id DESC
  `);
  return rows;
}

// Update status is_active (1 = Aktif, 0 = Nonaktif)
async function updateStatus(id, isActive) {
  const [result] = await db.query(
    'UPDATE tm_users SET is_active = ?, updated_at = NOW() WHERE id = ?',
    [isActive, id]
  );
  return result.affectedRows > 0;
}

// Ambil semua permission_name berdasarkan role_id
async function getPermissionsByRoleId(roleId) {
  const [rows] = await db.query(`
    SELECT p.permission_name 
    FROM tt_permission p
    JOIN tt_role_permission rp ON p.id = rp.permission_id
    WHERE rp.role_id = ?
  `, [roleId]);
  
  return rows.map(row => row.permission_name);
}

module.exports = {
    findByEmail,
    findRoleByName,
    createUser,
    findById,
    updatePassword,
    getAllUsers,
    updateStatus,
    getPermissionsByRoleId
};