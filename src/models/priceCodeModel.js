const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM tm_price_code ORDER BY id DESC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM tm_price_code WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ code, description, is_active }) {
  const [result] = await pool.query(
    'INSERT INTO tm_price_code (code, description, is_active) VALUES (?, ?, ?)',
    [code, description || null, is_active ?? 1]
  );
  return findById(result.insertId);
}

async function setActive(id, is_active) {
  const existing = await findById(id);
  if (!existing) return null;

  await pool.query('UPDATE tm_price_code SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
  return findById(id);
}

module.exports = { findAll, findById, create, setActive };
