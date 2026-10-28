// src/models/variantModel.js
// Model untuk tabel tm_product_variants

const db = require('../config/db');

const VariantModel = {

  /**
   * Ambil semua varian beserta nama produknya
   */
  findAll: async () => {
    const sql = `
      SELECT
        v.variant_id,
        v.product_id,
        p.product_name,
        v.sku,
        v.barcode,
        v.variant_name,
        v.cost_price,
        v.selling_price,
        v.stock,
        v.minimum_stock,
        v.is_active,
        v.created_at,
        v.updated_at
      FROM tm_product_variants v
      LEFT JOIN tm_products p ON v.product_id = p.product_id
      ORDER BY v.variant_id ASC
    `;
    const result = await db.query(sql);
    return result.rows;
  },

  /**
   * Ambil varian berdasarkan ID
   */
  findById: async (id) => {
    const sql = `
      SELECT
        v.variant_id,
        v.product_id,
        p.product_name,
        v.sku,
        v.barcode,
        v.variant_name,
        v.cost_price,
        v.selling_price,
        v.stock,
        v.minimum_stock,
        v.is_active,
        v.created_at,
        v.updated_at
      FROM tm_product_variants v
      LEFT JOIN tm_products p ON v.product_id = p.product_id
      WHERE v.variant_id = $1
    `;
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  },

  /**
   * Cek apakah SKU sudah digunakan
   */
  findBySku: async (sku, excludeId = null) => {
    let sql = 'SELECT variant_id FROM tm_product_variants WHERE LOWER(sku) = LOWER($1)';
    const values = [sku];
    if (excludeId) {
      sql += ' AND variant_id != $2';
      values.push(excludeId);
    }
    const result = await db.query(sql, values);
    return result.rows[0] || null;
  },

  /**
   * Cek apakah Barcode sudah digunakan
   */
  findByBarcode: async (barcode, excludeId = null) => {
    let sql = 'SELECT variant_id FROM tm_product_variants WHERE barcode = $1';
    const values = [barcode];
    if (excludeId) {
      sql += ' AND variant_id != $2';
      values.push(excludeId);
    }
    const result = await db.query(sql, values);
    return result.rows[0] || null;
  },

  /**
   * Buat varian baru
   */
  create: async ({
    product_id, sku, barcode, variant_name,
    cost_price, selling_price, stock, minimum_stock, is_active
  }) => {
    const sql = `
      INSERT INTO tm_product_variants
        (product_id, sku, barcode, variant_name, cost_price, selling_price, stock, minimum_stock, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      product_id,
      sku,
      barcode       || null,
      variant_name,
      cost_price    || 0,
      selling_price || 0,
      stock         || 0,
      minimum_stock || 0,
      is_active !== undefined ? is_active : true,
    ];
    const result = await db.query(sql, values);
    return result.rows[0];
  },

  /**
   * Update varian berdasarkan ID
   */
  update: async (id, {
    product_id, sku, barcode, variant_name,
    cost_price, selling_price, stock, minimum_stock, is_active
  }) => {
    const sql = `
      UPDATE tm_product_variants
      SET
        product_id    = $1,
        sku           = $2,
        barcode       = $3,
        variant_name  = $4,
        cost_price    = $5,
        selling_price = $6,
        stock         = $7,
        minimum_stock = $8,
        is_active     = $9,
        updated_at    = NOW()
      WHERE variant_id = $10
      RETURNING *
    `;
    const values = [
      product_id,
      sku,
      barcode       || null,
      variant_name,
      cost_price    || 0,
      selling_price || 0,
      stock         || 0,
      minimum_stock || 0,
      is_active,
      id,
    ];
    const result = await db.query(sql, values);
    return result.rows[0] || null;
  },

  /**
   * Hapus varian berdasarkan ID
   */
  delete: async (id) => {
    const sql = 'DELETE FROM tm_product_variants WHERE variant_id = $1 RETURNING *';
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  },
};

module.exports = VariantModel;
