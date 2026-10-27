const pool = require("../config/db");

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT s.*, m.name AS manager_name
     FROM tm_store s
     LEFT JOIN tm_users m ON m.id = s.manager_id
     WHERE s.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByManagerId(managerId) {
  const [rows] = await pool.query(
    "SELECT * FROM tm_store WHERE manager_id = ? ORDER BY id ASC LIMIT 1",
    [managerId]
  );
  return rows[0] || null;
}

async function createStore(storeData) {
  const { store_name, location, phone, owner_id, manager_id } = storeData;
  const [result] = await pool.query(
    `INSERT INTO tm_store
      (store_name, location, phone, owner_id, manager_id, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
    [store_name, location, phone || null, owner_id, manager_id || null]
  );
  return { id: result.insertId, ...storeData, is_active: 1 };
}

async function assignManager(storeId, managerId) {
  const [result] = await pool.query(
    "UPDATE tm_store SET manager_id = ?, updated_at = NOW() WHERE id = ?",
    [managerId, storeId]
  );
  return result.affectedRows > 0;
}

// Daftar toko milik owner + nama manager + jumlah produk & transaksi
async function findByOwnerId(ownerId) {
  const [rows] = await pool.query(
    `SELECT
       s.id, s.store_name, s.location, s.phone, s.owner_id, s.manager_id,
       s.is_active, s.created_at, s.updated_at,
       m.name AS manager_name,
       (SELECT COUNT(*) FROM tr_product_stock ps WHERE ps.store_id = s.id) AS total_products,
       (SELECT COUNT(*) FROM tt_transaction t   WHERE t.store_id  = s.id) AS total_transactions
     FROM tm_store s
     LEFT JOIN tm_users m ON m.id = s.manager_id
     WHERE s.owner_id = ?
     ORDER BY s.id DESC`,
    [ownerId]
  );
  return rows;
}

module.exports = { findById, findByManagerId, createStore, assignManager, findByOwnerId };
