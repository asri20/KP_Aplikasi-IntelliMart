const pool = require('../config/db');

async function findAll(price_code_id) {
  const conditions = [];
  const params = [];

  if (price_code_id) {
    conditions.push('t.price_code_id = ?');
    params.push(price_code_id);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT t.*, pc.code AS price_code
     FROM tr_tier_price t
     JOIN tm_price_code pc ON pc.id = t.price_code_id
     ${whereClause}
     ORDER BY t.price_code_id ASC, t.min_qty ASC`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT t.*, pc.code AS price_code
     FROM tr_tier_price t
     JOIN tm_price_code pc ON pc.id = t.price_code_id
     WHERE t.id = ?`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Cari tier lain di price_code yang sama yang range qty-nya tumpang tindih
 * dengan range (min_qty, max_qty) yang mau disimpan.
 * excludeId dipakai saat UPDATE, supaya baris itu sendiri tidak dianggap "tumpang tindih" dengan dirinya sendiri.
 */
async function findOverlapping(price_code_id, min_qty, max_qty, excludeId = null) {
  let query = `
    SELECT * FROM tr_tier_price
    WHERE price_code_id = ?
      AND min_qty <= ?
      AND max_qty >= ?
  `;
  const params = [price_code_id, max_qty, min_qty];

  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

async function create({ price_code_id, min_qty, max_qty, unit_price }) {
  const [result] = await pool.query(
    'INSERT INTO tr_tier_price (price_code_id, min_qty, max_qty, unit_price) VALUES (?, ?, ?, ?)',
    [price_code_id, min_qty, max_qty, unit_price]
  );
  return findById(result.insertId);
}

async function update(id, { min_qty, max_qty, unit_price }) {
  await pool.query(
    'UPDATE tr_tier_price SET min_qty = ?, max_qty = ?, unit_price = ? WHERE id = ?',
    [min_qty, max_qty, unit_price, id]
  );
  return findById(id);
}

async function deleteTier(id) {
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query('DELETE FROM tr_tier_price WHERE id = ?', [id]);
  return existing;
}

module.exports = { findAll, findById, findOverlapping, create, update, delete: deleteTier };
