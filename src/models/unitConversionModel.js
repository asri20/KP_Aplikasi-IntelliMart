const pool = require('../config/db');

async function findAll(product_id) {
  const conditions = [];
  const params = [];

  if (product_id) {
    conditions.push('c.product_id = ?');
    params.push(product_id);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT c.*, p.product_name, u.unit_name
     FROM tm_unit_conversion c
     JOIN tm_product p ON p.id = c.product_id
     JOIN tm_unit u ON u.id = c.unit_id
     ${whereClause}
     ORDER BY c.product_id ASC, c.is_base_unit DESC, c.conversion_qty ASC`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT c.*, p.product_name, u.unit_name
     FROM tm_unit_conversion c
     JOIN tm_product p ON p.id = c.product_id
     JOIN tm_unit u ON u.id = c.unit_id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Cari baris satuan dasar (is_base_unit = 1) yang SUDAH ADA untuk produk ini.
 * excludeId dipakai saat UPDATE, supaya baris itu sendiri tidak dihitung.
 */
async function findBaseUnit(product_id, excludeId = null) {
  let query = 'SELECT * FROM tm_unit_conversion WHERE product_id = ? AND is_base_unit = 1';
  const params = [product_id];

  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(query, params);
  return rows[0] || null;
}

/**
 * Cek apakah produk ini SUDAH punya stok tercatat (di toko manapun).
 * Dipakai sebagai pengaman: kalau sudah ada stok, jangan diam-diam ganti satuan dasar.
 */
async function hasExistingStock(product_id) {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(ps.stock), 0) AS total_stock
     FROM tr_product_stock ps
     JOIN ms_product_variant v ON v.id = ps.variant_id
     WHERE v.product_id = ?`,
    [product_id]
  );
  return Number(rows[0].total_stock) > 0;
}

async function unsetOtherBaseUnits(product_id, exceptId) {
  await pool.query(
    'UPDATE tm_unit_conversion SET is_base_unit = 0 WHERE product_id = ? AND id != ?',
    [product_id, exceptId]
  );
}

async function create({ product_id, unit_id, conversion_qty, is_base_unit }) {
  const [result] = await pool.query(
    'INSERT INTO tm_unit_conversion (product_id, unit_id, conversion_qty, is_base_unit) VALUES (?, ?, ?, ?)',
    [product_id, unit_id, conversion_qty, is_base_unit ? 1 : 0]
  );
  return findById(result.insertId);
}

async function update(id, { conversion_qty, is_base_unit }) {
  await pool.query(
    'UPDATE tm_unit_conversion SET conversion_qty = ?, is_base_unit = ? WHERE id = ?',
    [conversion_qty, is_base_unit ? 1 : 0, id]
  );
  return findById(id);
}

async function deleteConversion(id) {
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query('DELETE FROM tm_unit_conversion WHERE id = ?', [id]);
  return existing;
}

module.exports = {
  findAll, findById, findBaseUnit, hasExistingStock,
  unsetOtherBaseUnits, create, update, delete: deleteConversion
};
