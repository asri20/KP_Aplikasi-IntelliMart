
const db = require('../config/db');

// Ambil daftar staff yang ditempatkan di toko milik Owner
async function findStaffByOwnerId(ownerId) {
  const [rows] = await db.query(
    `SELECT
       ss.id AS assignment_id,
       ss.store_id,
       s.store_name,
       u.id AS user_id,
       u.name,
       u.email,
       u.phone,
       u.is_active,
       r.role_name,
       ss.assigned_at
     FROM tr_store_staff ss
     JOIN tm_store s ON s.id = ss.store_id
     JOIN tm_users u ON u.id = ss.user_id
     JOIN tm_roles r ON r.id = u.role_id
     WHERE s.owner_id = ?
     ORDER BY s.id DESC, u.name ASC`,
    [ownerId]
  );

  return rows;
}

// Periksa apakah toko dimiliki Owner
async function findStoreByOwner(storeId, ownerId) {
  const [rows] = await db.query(
    `SELECT id, store_name, owner_id
     FROM tm_store
     WHERE id = ? AND owner_id = ?
     LIMIT 1`,
    [storeId, ownerId]
  );

  return rows[0] || null;
}

// Ambil data staff berdasarkan ID dan role
async function findStaffByIdAndRole(userId, roleName) {
  const [rows] = await db.query(
    `SELECT
       u.id,
       u.name,
       u.role_id,
       u.created_by_owner_id,
       u.is_active,
       r.role_name
     FROM tm_users u
     JOIN tm_roles r ON r.id = u.role_id
     WHERE u.id = ?
       AND LOWER(r.role_name) = LOWER(?)
     LIMIT 1`,
    [userId, roleName]
  );

  return rows[0] || null;
}
// Ambil penempatan staff saat ini
async function findAssignmentByUserId(userId) {
  const [rows] = await db.query(
    `SELECT id, store_id, user_id
     FROM tr_store_staff
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

// Tempatkan staff ke toko
async function assignStaff(storeId, userId) {
  const [result] = await db.query(
    `INSERT INTO tr_store_staff (store_id, user_id, assigned_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)`,
    [storeId, userId]
  );

  return {
    id: result.insertId,
    store_id: storeId,
    user_id: userId
  };
}

// Pindahkan staff ke toko lain
async function moveStaff(userId, newStoreId) {
  const [result] = await db.query(
    `UPDATE tr_store_staff
     SET store_id = ?, assigned_at = CURRENT_TIMESTAMP
     WHERE user_id = ?`,
    [newStoreId, userId]
  );

  return result.affectedRows > 0;
}

module.exports = {
  findStaffByOwnerId,
  findStoreByOwner,
  findStaffByIdAndRole,
  findAssignmentByUserId,
  assignStaff,
  moveStaff
};
