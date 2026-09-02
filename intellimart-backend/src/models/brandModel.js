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
  const [result] = await pool.query(
    'INSERT INTO tm_brand (brand_name) VALUES (?)',
    [brand_name]
  );
  return { id: result.insertId, brand_name };
}

module.exports = { 
  getAllBrands, 
  findById, 
  createBrand 
};