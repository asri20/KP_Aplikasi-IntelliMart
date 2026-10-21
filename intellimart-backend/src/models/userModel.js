/**
 * @file userModel.js
 * @description Model untuk mengelola data user, autentikasi, role, dan relasi store-manager.
 */

const db = require("../config/db");

/**
 * Mencari role berdasarkan nama role.
 * @param {string} roleName 
 * @returns {Promise<Object|null>}
 */
async function findRoleByName(roleName) {
  const [rows] = await db.query(
    `SELECT id, role_name
     FROM tm_roles
     WHERE LOWER(role_name) = LOWER(?)
     LIMIT 1`,
    [roleName]
  );
  return rows[0] || null;
}

/**
 * Mencari user berdasarkan alamat email.
 * @param {string} email 
 * @returns {Promise<Object|null>}
 */
async function findByEmail(email) {
  const [rows] = await db.query(
    `SELECT *
     FROM tm_users
     WHERE LOWER(email) = LOWER(?)
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

/*
 * Mencari user berdasarkan email atau nama (identitas).
 * @param {string} identity 
 * @returns {Promise<Object|null>}
 */
async function findByIdentity(identity) {
  const [rows] = await db.query(
    `SELECT *
     FROM tm_users
     WHERE LOWER(email) = LOWER(?)
        OR LOWER(name) = LOWER(?)
     LIMIT 1`,
    [identity, identity]
  );
  return rows[0] || null;
}

/**
 * Mencari user berdasarkan ID (tanpa password).
 * @param {number|string} id 
 * @returns {Promise<Object|null>}
 */
async function findById(id) {
  const [rows] = await db.query(
    `SELECT id, name, email, phone, role_id, is_active
     FROM tm_users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Membuat user baru.
 * @param {Object} userData 
 * @returns {Promise<Object>}
 */
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

/**
 * Membuat akun Manager baru dan langsung menugaskannya ke toko milik Owner.
 * Menggunakan transaksi database (ACID).
 * @param {Object} userData 
 * @param {number|string} storeId 
 * @param {number|string} ownerId 
 * @returns {Promise<Object>}
 */
async function createManagerForStore(userData, storeId, ownerId) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Pastikan toko ada dan milik Owner yang sedang login dengan row locking (FOR UPDATE)
    const [stores] = await connection.query(
      `SELECT id, owner_id, manager_id
       FROM tm_store
       WHERE id = ?
       FOR UPDATE`,
      [storeId]
    );

    const store = stores[0];

    if (!store) {
      const error = new Error("Toko tidak ditemukan.");
      error.statusCode = 404;
      throw error;
    }

    if (Number(store.owner_id) !== Number(ownerId)) {
      const error = new Error("Anda tidak memiliki akses ke toko ini.");
      error.statusCode = 403;
      throw error;
    }

    if (store.manager_id !== null) {
      const error = new Error("Toko ini sudah memiliki Manager.");
      error.statusCode = 409;
      throw error;
    }

    // 2. Buat akun Manager baru
    const [userResult] = await connection.query(
      `INSERT INTO tm_users
        (name, email, password, phone, role_id, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        userData.name,
        userData.email,
        userData.password,
        userData.phone || null,
        userData.role_id
      ]
    );
    const managerId = userResult.insertId;

    // 3. Hubungkan Manager baru ke toko pilihan
    const [storeResult] = await connection.query(
      `UPDATE tm_store
       SET manager_id = ?, updated_at = NOW()
       WHERE id = ?
         AND owner_id = ?
         AND manager_id IS NULL`,
      [managerId, storeId, ownerId]
    );

    if (storeResult.affectedRows !== 1) {
      const error = new Error(
        "Manager berhasil dibuat, tetapi gagal ditugaskan ke toko."
      );
      error.statusCode = 409;
      throw error;
    }

    await connection.commit();

    return {
      id: managerId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || null,
      role_id: userData.role_id,
      is_active: 1,
      store_id: Number(storeId)
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Memperbarui password user.
 * @param {number|string} id 
 * @param {string} newHashedPassword 
 * @returns {Promise<boolean>}
 */
async function updatePassword(id, newHashedPassword) {
  const [result] = await db.query(
    `UPDATE tm_users
     SET password = ?, updated_at = NOW()
     WHERE id = ?`,
    [newHashedPassword, id]
  );

  return result.affectedRows > 0;
}

/**
 * Mengambil daftar seluruh user beserta rolenya.
 * @returns {Promise<Array>}
 */
async function getAllUsers() {
  const [rows] = await db.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.is_active,
      r.role_name,
      u.created_at
    FROM tm_users u
    JOIN tm_roles r ON u.role_id = r.id
    ORDER BY u.id DESC
  `);

  return rows;
}

/**
 * Memperbarui status keaktifan user (is_active).
 * @param {number|string} id 
 * @param {number|boolean} isActive 
 * @returns {Promise<boolean>}
 */
async function updateStatus(id, isActive) {
  const [result] = await db.query(
    `UPDATE tm_users
     SET is_active = ?, updated_at = NOW()
     WHERE id = ?`,
    [isActive, id]
  );

  return result.affectedRows > 0;
}

/**
 * Mengambil daftar permission berdasarkan role ID.
 * @param {number|string} roleId 
 * @returns {Promise<Array<string>>}
 */
async function getPermissionsByRoleId(roleId) {
  const [rows] = await db.query(`
    SELECT p.permission_name
    FROM tt_permission p
    JOIN tt_role_permission rp ON p.id = rp.permission_id
    WHERE rp.role_id = ?
  `, [roleId]);

  return rows.map(row => row.permission_name);
}

/**
 * Mengambil daftar manager yang dikelola oleh owner tertentu beserta toko mereka.
 * @param {number|string} ownerId 
 * @returns {Promise<Array>}
 */
async function getManagersByOwnerId(ownerId) {
  const [rows] = await db.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.is_active,
      r.role_name,
      u.created_at,
      s.id AS store_id,
      s.store_name
    FROM tm_users u
    JOIN tm_roles r ON u.role_id = r.id
    JOIN tm_store s ON s.manager_id = u.id
    WHERE s.owner_id = ?
      AND LOWER(r.role_name) = 'manager'
    ORDER BY u.id DESC
  `, [ownerId]);

  return rows;
}

module.exports = {
  findRoleByName,
  findByEmail,
  findByIdentity,
  findById,
  createUser,
  createManagerForStore,
  updatePassword,
  getAllUsers,
  updateStatus,
  getPermissionsByRoleId,
  getManagersByOwnerId
};