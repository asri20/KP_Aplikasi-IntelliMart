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
  const [result] = await pool.query(
    'INSERT INTO tm_unit (unit_name) VALUES (?)',
    [unit_name]
  );
  return { id: result.insertId, unit_name };
}

module.exports = { 
  getAllUnits, 
  findById, 
  createUnit 
};