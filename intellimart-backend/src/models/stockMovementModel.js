const pool = require('../config/db');

async function findAll(store_id, variant_id) {
  const conditions = [];
  const params = [];

  if (store_id) {
    conditions.push('m.store_id = ?');
    params.push(store_id);
  }
  if (variant_id) {
    conditions.push('m.variant_id = ?');
    params.push(variant_id);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT m.*, s.store_name, v.variant_name, v.sku, u.name AS created_by_name
     FROM tt_stock_movement m
     JOIN tm_store s ON s.id = m.store_id
     JOIN ms_product_variant v ON v.id = m.variant_id
     JOIN tm_users u ON u.id = m.created_by
     ${whereClause}
     ORDER BY m.created_at DESC
     LIMIT 100`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT m.*, s.store_name, v.variant_name, v.sku, u.name AS created_by_name
     FROM tt_stock_movement m
     JOIN tm_store s ON s.id = m.store_id
     JOIN ms_product_variant v ON v.id = m.variant_id
     JOIN tm_users u ON u.id = m.created_by
     WHERE m.id = ?`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Ambil stok saat ini untuk kombinasi store+variant (dipakai utk validasi stok cukup/tidak
 * sebelum OUT/ADJUSTMENT_OUT). Return null kalau baris tr_product_stock belum ada sama sekali.
 */
async function getCurrentStock(store_id, variant_id) {
  const [rows] = await pool.query(
    'SELECT stock FROM tr_product_stock WHERE store_id = ? AND variant_id = ?',
    [store_id, variant_id]
  );
  return rows[0] ? rows[0].stock : null;
}

/**
 * INSERT ke tt_stock_movement -> trigger trg_stock_movement_after_insert di database
 * OTOMATIS menyesuaikan tr_product_stock.stock. Tidak perlu UPDATE manual di sini.
 */
async function create({ store_id, variant_id, movement_type, qty, reference_type, reference_id, supplier_id, note, created_by }) {
  const [result] = await pool.query(
    `INSERT INTO tt_stock_movement
       (store_id, variant_id, movement_type, qty, reference_type, reference_id, supplier_id, note, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [store_id, variant_id, movement_type, qty, reference_type, reference_id || null, supplier_id || null, note || null, created_by]
  );
  return findById(result.insertId);
}

module.exports = { findAll, findById, getCurrentStock, create };
