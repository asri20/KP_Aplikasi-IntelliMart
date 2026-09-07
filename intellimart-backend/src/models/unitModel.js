const pool = require('../config/db');

async function getAllUnits() {
  const [rows] = await pool.query('SELECT * FROM tm_unit ORDER BY id ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM tm_unit WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createUnit({ unit_name }) {
  const [result] = await pool.query('INSERT INTO tm_unit (unit_name) VALUES (?)', [unit_name]);
  return findById(result.insertId);
}

async function updateUnit(id, { unit_name, is_active }) {
  await pool.query('UPDATE tm_unit SET unit_name = ?, is_active = ? WHERE id = ?', [unit_name, is_active ?? 1, id]);
  return findById(id);
}

async function deleteUnit(id) {
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query('DELETE FROM tm_unit WHERE id = ?', [id]);
  return existing;
}

module.exports = { getAllUnits, createUnit, findById, updateUnit, delete: deleteUnit };