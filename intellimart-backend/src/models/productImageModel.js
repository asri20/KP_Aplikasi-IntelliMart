const pool = require('../config/db');

async function findAll(product_id) {
  const conditions = [];
  const params = [];

  if (product_id) {
    conditions.push('i.product_id = ?');
    params.push(product_id);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT i.*, p.product_name
     FROM tm_product_image i
     JOIN tm_product p ON p.id = i.product_id
     ${whereClause}
     ORDER BY i.product_id ASC, i.is_primary DESC, i.id ASC`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT i.*, p.product_name
     FROM tm_product_image i
     JOIN tm_product p ON p.id = i.product_id
     WHERE i.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create({ product_id, image_url, is_primary }) {
  const [result] = await pool.query(
    'INSERT INTO tm_product_image (product_id, image_url, is_primary) VALUES (?, ?, ?)',
    [product_id, image_url, is_primary ? 1 : 0]
  );
  return findById(result.insertId);
}

async function update(id, { image_url, is_primary }) {
  await pool.query(
    'UPDATE tm_product_image SET image_url = ?, is_primary = ? WHERE id = ?',
    [image_url, is_primary ? 1 : 0, id]
  );
  return findById(id);
}

async function unsetOtherPrimary(product_id, exceptId) {
  await pool.query(
    'UPDATE tm_product_image SET is_primary = 0 WHERE product_id = ? AND id != ?',
    [product_id, exceptId]
  );
}

async function deleteImage(id) {
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query('DELETE FROM tm_product_image WHERE id = ?', [id]);
  return existing;
}

module.exports = { findAll, findById, create, update, unsetOtherPrimary, delete: deleteImage };
