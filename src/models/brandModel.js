const pool = require('../config/db');

async function getAllBrands() {
  const [rows] = await pool.query('SELECT * FROM tm_brand ORDER BY id ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM tm_brand WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createBrand({ brand_name }) {
  const [result] = await pool.query('INSERT INTO tm_brand (brand_name) VALUES (?)', [brand_name]);
  return findById(result.insertId);
}

async function updateBrand(id, { brand_name, is_active }) {
  await pool.query('UPDATE tm_brand SET brand_name = ?, is_active = ? WHERE id = ?', [brand_name, is_active ?? 1, id]);
  return findById(id);
}

async function deleteBrand(id) {
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query('DELETE FROM tm_brand WHERE id = ?', [id]);
  return existing;
}

module.exports = { getAllBrands, createBrand, findById, updateBrand, delete: deleteBrand };
