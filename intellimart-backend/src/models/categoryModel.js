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
  return { id: result.insertId, parent_id: parent_id || null, category_name };
}

module.exports = { 
  getAllCategories, 
  findById, 
  createCategory 
};