const pool = require('../config/db');

async function getAllCategories() {
  const [rows] = await pool.query('SELECT * FROM tm_category ORDER BY id ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM tm_category WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createCategory({ category_name, parent_id }) {
  const [result] = await pool.query(
    'INSERT INTO tm_category (parent_id, category_name) VALUES (?, ?)',
    [parent_id || null, category_name]
  );
  return findById(result.insertId);
}

async function updateCategory(id, { category_name, parent_id, is_active }) {
  await pool.query(
    'UPDATE tm_category SET category_name = ?, parent_id = ?, is_active = ? WHERE id = ?',
    [category_name, parent_id || null, is_active ?? 1, id]
  );
  return findById(id);
}

async function deleteCategory(id) {
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query('DELETE FROM tm_category WHERE id = ?', [id]);
  return existing;
}

module.exports = { getAllCategories, createCategory, findById, updateCategory, delete: deleteCategory };
