// src/models/productModel.js

const pool = require('../config/db');

const ALLOWED_SORT = {
  product_id: 'p.id',
  product_name: 'p.product_name',
  created_at: 'p.created_at',
  updated_at: 'p.updated_at',
};

// =====================================================
// GET ALL PRODUCTS
// Hanya mengambil:
// 1. Produk milik Owner
// 2. Produk bawaan dengan owner_id NULL
// =====================================================

async function findAll(
  ownerId,
  search,
  category,
  brand,
  page = 1,
  limit = 10,
  sort = 'product_id',
  order = 'ASC'
) {
  const sortColumn = ALLOWED_SORT[sort] || 'p.id';

  const sortOrder =
    String(order).toUpperCase() === 'DESC'
      ? 'DESC'
      : 'ASC';

  const conditions = ['p.owner_id = ?'];

  const params = [ownerId];

  // Search nama produk
  if (search) {
    conditions.push('p.product_name LIKE ?');
    params.push(`%${search}%`);
  }

  // Filter kategori
  if (category) {
    conditions.push('p.category_id = ?');
    params.push(category);
  }

  // Filter brand
  if (brand) {
    conditions.push('p.brand_id = ?');
    params.push(brand);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const safeLimit = Math.max(
    1,
    parseInt(limit) || 10
  );

  const safePage = Math.max(
    1,
    parseInt(page) || 1
  );

  const offset = (safePage - 1) * safeLimit;

  const [rows] = await pool.query(
    `
      SELECT
        p.*,
        c.category_name,
        b.brand_name,
        u.unit_name
      FROM tm_product p

      LEFT JOIN tm_category c
        ON c.id = p.category_id

      LEFT JOIN tm_brand b
        ON b.id = p.brand_id

      LEFT JOIN tm_unit u
        ON u.id = p.unit_id

      ${whereClause}

      ORDER BY ${sortColumn} ${sortOrder}

      LIMIT ? OFFSET ?
    `,
    [
      ...params,
      safeLimit,
      offset
    ]
  );

  return rows;
}


// =====================================================
// GET PRODUCT BY ID
// Owner hanya boleh melihat:
// - produk miliknya
// Produk bawaan owner_id NULL tidak ditampilkan
// melalui endpoint produk milik Owner.
// =====================================================

async function findById(id, ownerId) {
  const [rows] = await pool.query(
    `
      SELECT
        p.*,
        c.category_name,
        b.brand_name,
        u.unit_name
      FROM tm_product p

      LEFT JOIN tm_category c
        ON c.id = p.category_id

      LEFT JOIN tm_brand b
        ON b.id = p.brand_id

      LEFT JOIN tm_unit u
        ON u.id = p.unit_id

      WHERE
        p.id = ?
        AND (
          p.owner_id = ?
          OR p.owner_id IS NULL
        )
    `,
    [id, ownerId]
  );

  return rows[0] || null;
}


// =====================================================
// CREATE PRODUCT
// owner_id otomatis dari user yang login
// =====================================================

async function create({
  owner_id,
  product_name,
  description,
  category_id,
  brand_id,
  unit_id,
  is_active
}) {
  const [result] = await pool.query(
    `
      INSERT INTO tm_product (
        owner_id,
        product_name,
        description,
        category_id,
        brand_id,
        unit_id,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      owner_id,
      product_name,
      description || null,
      category_id || null,
      brand_id || null,
      unit_id || null,
      is_active ?? 1
    ]
  );

  return findById(result.insertId, owner_id);
}


// =====================================================
// UPDATE PRODUCT
// Hanya produk milik Owner yang boleh diubah
// =====================================================

async function update(
  id,
  ownerId,
  {
    product_name,
    description,
    category_id,
    brand_id,
    unit_id,
    is_active
  }
) {
  const [result] = await pool.query(
    `
      UPDATE tm_product

      SET
        product_name = ?,
        description = ?,
        category_id = ?,
        brand_id = ?,
        unit_id = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP

      WHERE
        id = ?
        AND owner_id = ?
    `,
    [
      product_name,
      description || null,
      category_id || null,
      brand_id || null,
      unit_id || null,
      is_active ?? 1,
      id,
      ownerId
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findById(id, ownerId);
}


// =====================================================
// DELETE PRODUCT
// Hanya produk milik Owner yang boleh dihapus
// =====================================================

async function deleteProduct(id, ownerId) {
  const existing = await findById(id, ownerId);

  if (!existing) {
    return null;
  }

  // Cek apakah produk memiliki varian
  const [variants] = await pool.query(
    `
      SELECT id
      FROM ms_product_variant
      WHERE product_id = ?
      LIMIT 1
    `,
    [id]
  );

  if (variants.length > 0) {
    throw new Error(
      'Produk ini masih memiliki varian yang terdaftar, hapus variannya terlebih dahulu'
    );
  }

  // Hanya delete produk milik Owner
  await pool.query(
    `
      DELETE FROM tm_product
      WHERE id = ?
      AND owner_id = ?
    `,
    [id, ownerId]
  );

  return existing;
}


module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: deleteProduct
};