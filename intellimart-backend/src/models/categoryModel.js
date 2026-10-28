// src/models/categoryModel.js
// Model untuk tabel tm_categories

const db = require('../config/db');

const CategoryModel = {

  /**
   * Ambil semua kategori beserta nama parent-nya
   */
  findAll: async () => {
    const sql = `
      SELECT
        c.category_id,
        c.parent_id,
        p.category_name AS parent_name,
        c.category_name,
        c.is_active,
        c.created_at,
        c.updated_at
      FROM tm_categories c
      LEFT JOIN tm_categories p ON c.parent_id = p.category_id
      ORDER BY c.category_id ASC
    `;
    const result = await db.query(sql);
    return result.rows;
  },

  /**
   * Ambil kategori berdasarkan ID
   */
  findById: async (id) => {
    const sql = `
      SELECT
        c.category_id,
        c.parent_id,
        p.category_name AS parent_name,
        c.category_name,
        c.is_active,
        c.created_at,
        c.updated_at
      FROM tm_categories c
      LEFT JOIN tm_categories p ON c.parent_id = p.category_id
      WHERE c.category_id = $1
    `;
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  },

  /**
   * Buat kategori baru
   */
  create: async ({ parent_id, category_name, is_active }) => {
    const sql = `
      INSERT INTO tm_categories (parent_id, category_name, is_active)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [
      parent_id || null,
      category_name,
      is_active !== undefined ? is_active : true,
    ];
    const result = await db.query(sql, values);
    return result.rows[0];
  },

  /**
   * Update kategori berdasarkan ID
   */
  update: async (id, { parent_id, category_name, is_active }) => {
    const sql = `
      UPDATE tm_categories
      SET
        parent_id    = $1,
        category_name = $2,
        is_active    = $3,
        updated_at   = NOW()
      WHERE category_id = $4
      RETURNING *
    `;
    const values = [
      parent_id !== undefined ? parent_id : null,
      category_name,
      is_active,
      id,
    ];
    const result = await db.query(sql, values);
    return result.rows[0] || null;
  },

  /**
   * Hapus kategori berdasarkan ID
   */
  delete: async (id) => {
    // Cek apakah kategori ini dipakai sebagai parent
    const checkParent = await db.query(
      'SELECT COUNT(*) FROM tm_categories WHERE parent_id = $1',
      [id]
    );
    if (parseInt(checkParent.rows[0].count) > 0) {
      throw new Error('Kategori ini memiliki sub-kategori. Hapus sub-kategori terlebih dahulu.');
    }

    // Cek apakah kategori dipakai di produk
    const checkProduct = await db.query(
      'SELECT COUNT(*) FROM tm_products WHERE category_id = $1',
      [id]
    );
    if (parseInt(checkProduct.rows[0].count) > 0) {
      throw new Error('Kategori ini sedang digunakan oleh produk. Tidak dapat dihapus.');
    }

    const sql = 'DELETE FROM tm_categories WHERE category_id = $1 RETURNING *';
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  },
};

module.exports = CategoryModel;
