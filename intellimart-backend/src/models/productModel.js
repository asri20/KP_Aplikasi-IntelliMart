const pool = require('../config/db');

const ALLOWED_SORT = {
  product_id: 'p.id',
  product_name: 'p.product_name',
  created_at: 'p.created_at',
  updated_at: 'p.updated_at',
};

async function findAll(search, category, brand, page = 1, limit = 10, sort = 'product_id', order = 'ASC') {
  const sortColumn = ALLOWED_SORT[sort] || 'p.id';
  const sortOrder = String(order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('p.product_name LIKE ?');
    params.push(`%${search}%`);
  }
  if (category) {
    conditions.push('p.category_id = ?');
    params.push(category);
  }
  if (brand) {
    conditions.push('p.brand_id = ?');
    params.push(brand);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const safeLimit = Math.max(1, parseInt(limit) || 10);
  const safePage = Math.max(1, parseInt(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  const [rows] = await pool.query(
    `SELECT p.*, c.category_name, b.brand_name, u.unit_name
     FROM tm_product p
     LEFT JOIN tm_category c ON c.id = p.category_id
     LEFT JOIN tm_brand b ON b.id = p.brand_id
     LEFT JOIN tm_unit u ON u.id = p.unit_id
     ${whereClause}
     ORDER BY ${sortColumn} ${sortOrder}
     LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, c.category_name, b.brand_name, u.unit_name
     FROM tm_product p
     LEFT JOIN tm_category c ON c.id = p.category_id
     LEFT JOIN tm_brand b ON b.id = p.brand_id
     LEFT JOIN tm_unit u ON u.id = p.unit_id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create({ product_name, description, category_id, brand_id, unit_id, is_active }) {
  const [result] = await pool.query(
    `INSERT INTO tm_product (product_name, description, category_id, brand_id, unit_id, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [product_name, description || null, category_id || null, brand_id || null, unit_id || null, is_active ?? 1]
  );
  return findById(result.insertId);
}

async function update(id, { product_name, description, category_id, brand_id, unit_id, is_active }) {
  await pool.query(
    `UPDATE tm_product
     SET product_name = ?, description = ?, category_id = ?, brand_id = ?, unit_id = ?, is_active = ?
     WHERE id = ?`,
    [product_name, description || null, category_id || null, brand_id || null, unit_id || null, is_active ?? 1, id]
  );
  return findById(id);
}

async function deleteProduct(id) {
  const existing = await findById(id);
  if (!existing) return null;

  const [variants] = await pool.query('SELECT id FROM ms_product_variant WHERE product_id = ? LIMIT 1', [id]);
  if (variants.length > 0) {
    throw new Error('Produk ini masih memiliki varian yang terdaftar, hapus variannya terlebih dahulu');
  }

  await pool.query('DELETE FROM tm_product WHERE id = ?', [id]);
  return existing;
}

module.exports = { 
  findAll, 
  findById, 
  create, 
  update, 
  delete: deleteProduct 
};