// src/models/productModel.js
// Model untuk tabel tm_products

const db = require('../config/db');

const ProductModel = {

  /**
   * =====================================================
   * Ambil semua produk
   * Mendukung search, filter, pagination
   * =====================================================
   */
  findAll: async (
    search = '',
    category = '',
    brand = '',
    page = 1,
    limit = 10,
    sort = 'product_id',
    order = 'ASC'
  ) => {

    let sql = `
      SELECT
        p.product_id,
        p.product_name,
        p.description,
        p.category_id,
        c.category_name,
        p.brand_id,
        b.brand_name,
        p.unit_id,
        u.unit_name,
        p.is_active,
        p.created_at,
        p.updated_at
      FROM tm_products p
      LEFT JOIN tm_categories c
        ON p.category_id = c.category_id
      LEFT JOIN tm_brand b
        ON p.brand_id = b.brand_id
      LEFT JOIN tm_unit u
        ON p.unit_id = u.unit_id
    `;

    const values = [];
    const conditions = [];

    if (search && search.trim() !== '') {
      values.push(`%${search}%`);
      conditions.push(`p.product_name ILIKE $${values.length}`);
    }

    if (category) {
      values.push(category);
      conditions.push(`p.category_id = $${values.length}`);
    }

    if (brand) {
      values.push(brand);
      conditions.push(`p.brand_id = $${values.length}`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const allowedSort = [
      'product_id',
      'product_name',
      'created_at'
    ];

    if (!allowedSort.includes(sort)) {
      sort = 'product_id';
    }

    order = order.toUpperCase() === 'DESC'
      ? 'DESC'
      : 'ASC';

    sql += `
      ORDER BY p.${sort} ${order}
    `;

    const offset = (page - 1) * limit;

    values.push(limit);
    sql += ` LIMIT $${values.length}`;

    values.push(offset);
    sql += ` OFFSET $${values.length}`;

    const result = await db.query(sql, values);

    return result.rows;
  },



  /**
   * =====================================================
   * Ambil detail produk + semua varian
   * =====================================================
   */
  findById: async (id) => {

    const productSql = `
      SELECT
        p.product_id,
        p.product_name,
        p.description,
        p.category_id,
        c.category_name,
        p.brand_id,
        b.brand_name,
        p.unit_id,
        u.unit_name,
        p.is_active,
        p.created_at,
        p.updated_at
      FROM tm_products p
      LEFT JOIN tm_categories c
        ON p.category_id = c.category_id
      LEFT JOIN tm_brand b
        ON p.brand_id = b.brand_id
      LEFT JOIN tm_unit u
        ON p.unit_id = u.unit_id
      WHERE p.product_id = $1
    `;

    const productResult =
      await db.query(productSql, [id]);

    const product = productResult.rows[0];

    if (!product) {
      return null;
    }

    const variantSql = `
      SELECT
        variant_id,
        product_id,
        sku,
        barcode,
        variant_name,
        cost_price,
        selling_price,
        weight,
        is_active,
        created_at,
        updated_at
      FROM tm_product_variants
      WHERE product_id = $1
      ORDER BY variant_id ASC
    `;

    const variantResult =
      await db.query(variantSql, [id]);

    product.variants = variantResult.rows;

    return product;
  },



  /**
   * =====================================================
   * INSERT PRODUCT
   * =====================================================
   */
  create: async ({
    product_name,
    description,
    category_id,
    brand_id,
    unit_id,
    is_active
  }) => {

    const sql = `
      INSERT INTO tm_products
      (
        product_name,
        description,
        category_id,
        brand_id,
        unit_id,
        is_active
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6
      )
      RETURNING *
    `;

    const values = [

      product_name,

      description || null,

      category_id || null,

      brand_id || null,

      unit_id || null,

      is_active !== undefined
        ? is_active
        : true

    ];

    const result =
      await db.query(sql, values);

    return result.rows[0];
  },



  /**
   * =====================================================
   * UPDATE PRODUCT
   * =====================================================
   */
  update: async (
    id,
    {
      product_name,
      description,
      category_id,
      brand_id,
      unit_id,
      is_active
    }
  ) => {

    const sql = `
      UPDATE tm_products
      SET
          product_name = $1,
          description = $2,
          category_id = $3,
          brand_id = $4,
          unit_id = $5,
          is_active = $6,
          updated_at = NOW()
      WHERE product_id = $7
      RETURNING *
    `;

    const values = [

      product_name,

      description || null,

      category_id || null,

      brand_id || null,

      unit_id || null,

      is_active,

      id

    ];

    const result =
      await db.query(sql, values);

    return result.rows[0] || null;
  },



  /**
   * =====================================================
   * DELETE PRODUCT
   * =====================================================
   */
  delete: async (id) => {

    const check =
      await db.query(
        `
        SELECT COUNT(*)
        FROM tm_product_variants
        WHERE product_id = $1
        `,
        [id]
      );

    if (Number(check.rows[0].count) > 0) {

      throw new Error(
        'Produk masih memiliki varian. Hapus seluruh varian terlebih dahulu.'
      );

    }

    const sql = `
      DELETE FROM tm_products
      WHERE product_id = $1
      RETURNING *
    `;

    const result =
      await db.query(sql, [id]);

    return result.rows[0] || null;
  }

};

module.exports = ProductModel;