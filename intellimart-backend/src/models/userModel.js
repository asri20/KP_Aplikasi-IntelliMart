const db = require("../config/db");

async function findRoleByName(roleName) {
  const [rows] = await db.query(
    "SELECT id, role_name FROM tm_roles WHERE LOWER(role_name) = LOWER(?) LIMIT 1",
    [roleName]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await db.query(
    "SELECT * FROM tm_users WHERE LOWER(email) = LOWER(?) LIMIT 1",
    [email]
  );
  return rows[0] || null;
}


async function findByIdentity(identity) {
  const [rows] = await db.query(
    `SELECT * FROM tm_users
     WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)
     LIMIT 1`,
    [identity, identity]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT id, name, email, phone, role_id, is_active FROM tm_users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function createUser(userData) {
  const { name, email, password, phone, role_id, is_active } = userData;
  const [result] = await db.query(
    `INSERT INTO tm_users
      (name, email, password, phone, role_id, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [name, email, password, phone || null, role_id, is_active ?? 1]
  );
  return { id: result.insertId, ...userData };
}

async function updatePassword(id, newHashedPassword) {
  const [result] = await db.query(
    "UPDATE tm_users SET password = ?, updated_at = NOW() WHERE id = ?",
    [newHashedPassword, id]
  );
  return result.affectedRows > 0;
}

async function getAllUsers() {
  const [rows] = await db.query(`
    SELECT u.id, u.name, u.email, u.phone, u.is_active, r.role_name, u.created_at
    FROM tm_users u
    JOIN tm_roles r ON u.role_id = r.id
    ORDER BY u.id DESC
  `);
  return rows;
}

async function updateStatus(id, isActive) {
  const [result] = await db.query(
    "UPDATE tm_users SET is_active = ?, updated_at = NOW() WHERE id = ?",
    [isActive, id]
  );
  return result.affectedRows > 0;
}

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
  findRoleByName,
  findByEmail,
  findByIdentity,
  findById,
  createUser,
  updatePassword,
  getAllUsers,
  updateStatus,
  getPermissionsByRoleId
};
