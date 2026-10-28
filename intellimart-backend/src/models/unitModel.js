// src/models/unitModel.js
// Model untuk tabel tm_unit

const db = require('../config/db');

const UnitModel = {

  /**
   * Ambil semua satuan
   */
  findAll: async () => {
    const sql = `
      SELECT unit_id, unit_name, is_active, created_at, updated_at
      FROM tm_unit
      ORDER BY unit_id ASC
    `;
    const result = await db.query(sql);
    return result.rows;
  },

  /**
   * Ambil satuan berdasarkan ID
   */
  findById: async (id) => {
    const sql = `
      SELECT unit_id, unit_name, is_active, created_at, updated_at
      FROM tm_unit
      WHERE unit_id = $1
    `;
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  },

  /**
   * Cek apakah unit_name sudah ada
   */
  findByName: async (unit_name, excludeId = null) => {
    let sql = 'SELECT unit_id FROM tm_unit WHERE LOWER(unit_name) = LOWER($1)';
    const values = [unit_name];
    if (excludeId) {
      sql += ' AND unit_id != $2';
      values.push(excludeId);
    }
    const result = await db.query(sql, values);
    return result.rows[0] || null;
  },

  /**
   * Buat satuan baru
   */
  create: async ({ unit_name, is_active }) => {
    const sql = `
      INSERT INTO tm_unit (unit_name, is_active)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [unit_name, is_active !== undefined ? is_active : true];
    const result = await db.query(sql, values);
    return result.rows[0];
  },

  /**
   * Update satuan berdasarkan ID
   */
  update: async (id, { unit_name, is_active }) => {
    const sql = `
      UPDATE tm_unit
      SET
        unit_name  = $1,
        is_active  = $2,
        updated_at = NOW()
      WHERE unit_id = $3
      RETURNING *
    `;
    const result = await db.query(sql, [unit_name, is_active, id]);
    return result.rows[0] || null;
  },

  /**
   * Hapus satuan berdasarkan ID
   */
  delete: async (id) => {
    // Cek apakah unit digunakan di produk
    const check = await db.query(
      'SELECT COUNT(*) FROM tm_products WHERE unit_id = $1',
      [id]
    );
    if (parseInt(check.rows[0].count) > 0) {
      throw new Error('Satuan ini sedang digunakan oleh produk. Tidak dapat dihapus.');
    }

    const sql = 'DELETE FROM tm_unit WHERE unit_id = $1 RETURNING *';
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  },
};

module.exports = UnitModel;
