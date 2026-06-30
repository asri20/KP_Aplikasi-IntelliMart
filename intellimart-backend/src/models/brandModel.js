// src/models/brandModel.js
// Model untuk tabel tm_brand

const db = require('../config/db');

const BrandModel = {

  /**
   * Ambil semua brand
   */
  findAll: async () => {
    const sql = `
      SELECT brand_id, brand_name, is_active, created_at, updated_at
      FROM tm_brand
      ORDER BY brand_id ASC
    `;
    const result = await db.query(sql);
    return result.rows;
  },

  /**
   * Ambil brand berdasarkan ID
   */
  findById: async (id) => {
    const sql = `
      SELECT brand_id, brand_name, is_active, created_at, updated_at
      FROM tm_brand
      WHERE brand_id = $1
    `;
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  },

  /**
   * Cek apakah brand_name sudah ada
   */
  findByName: async (brand_name, excludeId = null) => {
    let sql = 'SELECT brand_id FROM tm_brand WHERE LOWER(brand_name) = LOWER($1)';
    const values = [brand_name];
    if (excludeId) {
      sql += ' AND brand_id != $2';
      values.push(excludeId);
    }
    const result = await db.query(sql, values);
    return result.rows[0] || null;
  },

  /**
   * Buat brand baru
   */
  create: async ({ brand_name, is_active }) => {
    const sql = `
      INSERT INTO tm_brand (brand_name, is_active)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [brand_name, is_active !== undefined ? is_active : true];
    const result = await db.query(sql, values);
    return result.rows[0];
  },

  /**
   * Update brand berdasarkan ID
   */
  update: async (id, { brand_name, is_active }) => {
    const sql = `
      UPDATE tm_brand
      SET
        brand_name = $1,
        is_active  = $2,
        updated_at = NOW()
      WHERE brand_id = $3
      RETURNING *
    `;
    const result = await db.query(sql, [brand_name, is_active, id]);
    return result.rows[0] || null;
  },

  /**
   * Hapus brand berdasarkan ID
   */
  delete: async (id) => {
    // Cek apakah brand digunakan di produk
    const check = await db.query(
      'SELECT COUNT(*) FROM tm_products WHERE brand_id = $1',
      [id]
    );
    if (parseInt(check.rows[0].count) > 0) {
      throw new Error('Brand ini sedang digunakan oleh produk. Tidak dapat dihapus.');
    }

    const sql = 'DELETE FROM tm_brand WHERE brand_id = $1 RETURNING *';
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  },
};

module.exports = BrandModel;
