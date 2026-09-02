const pool = require('../config/db');

async function findAll(product_id) {
  const conditions = [];
  const params = [];

  if (product_id) {
    conditions.push('v.product_id = ?');
    params.push(product_id);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT v.*, p.product_name
     FROM ms_product_variant v
     JOIN tm_product p ON p.id = v.product_id
     ${whereClause}
     ORDER BY v.id DESC`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT v.*, p.product_name
     FROM ms_product_variant v
     JOIN tm_product p ON p.id = v.product_id
     WHERE v.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create({ product_id, variant_name, sku, barcode, cost_price, weight, is_active }) {
  const [result] = await pool.query(
    `INSERT INTO ms_product_variant (product_id, variant_name, sku, barcode, cost_price, weight, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [product_id, variant_name, sku, barcode || null, cost_price || 0, weight || null, is_active ?? 1]
  );
  return findById(result.insertId);
}

async function update(id, { variant_name, sku, barcode, cost_price, weight, is_active }) {
  await pool.query(
    `UPDATE ms_product_variant
     SET variant_name = ?, sku = ?, barcode = ?, cost_price = ?, weight = ?, is_active = ?
     WHERE id = ?`,
    [variant_name, sku, barcode || null, cost_price || 0, weight || null, is_active ?? 1, id]
  );
  return findById(id);
}

async function deleteVariant(id) {
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query('DELETE FROM ms_product_variant WHERE id = ?', [id]);
  return existing;
}

module.exports = { findAll, findById, create, update, delete: deleteVariant };
