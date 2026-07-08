// src/models/storeModel.js
// Model untuk tabel tm_toko

const db = require('../config/db');

const StoreModel = {

  /**
   * Ambil seluruh toko
   */
  findAll: async () => {

    const sql = `
      SELECT
        store_id,
        store_name,
        address,
        phone,
        created_at,
        updated_at
      FROM tm_toko
      ORDER BY store_name ASC
    `;

    const result = await db.query(sql);

    return result.rows;

  },

  /**
   * Ambil toko berdasarkan ID
   */
  findById: async (id) => {

    const sql = `
      SELECT
        store_id,
        store_name,
        address,
        phone,
        created_at,
        updated_at
      FROM tm_toko
      WHERE store_id = $1
    `;

    const result = await db.query(sql, [id]);

    return result.rows[0] || null;

  },

  /**
   * Cek nama toko
   */
  findByName: async (store_name, excludeId = null) => {

    let sql = `
      SELECT
        store_id
      FROM tm_toko
      WHERE LOWER(store_name) = LOWER($1)
    `;

    const values = [store_name];

    if (excludeId) {
      sql += ` AND store_id <> $2`;
      values.push(excludeId);
    }

    const result = await db.query(sql, values);

    return result.rows[0] || null;

  },

  /**
   * Tambah toko
   */
  create: async ({
    store_name,
    address,
    phone
  }) => {

    const sql = `
      INSERT INTO tm_toko
      (
        store_name,
        address,
        phone
      )
      VALUES
      (
        $1,$2,$3
      )
      RETURNING *
    `;

    const values = [
      store_name,
      address || null,
      phone || null
    ];

    const result = await db.query(sql, values);

    return result.rows[0];

  },

  /**
   * Update toko
   */
  update: async (
    id,
    {
      store_name,
      address,
      phone
    }
  ) => {

    const sql = `
      UPDATE tm_toko
      SET
        store_name = $1,
        address = $2,
        phone = $3,
        updated_at = NOW()
      WHERE store_id = $4
      RETURNING *
    `;

    const values = [
      store_name,
      address || null,
      phone || null,
      id
    ];

    const result = await db.query(sql, values);

    return result.rows[0] || null;

  },

  /**
   * Hapus toko
   */
  delete: async (id) => {

    const sql = `
      DELETE FROM tm_toko
      WHERE store_id = $1
      RETURNING *
    `;

    const result = await db.query(sql, [id]);

    return result.rows[0] || null;

  }

};

module.exports = StoreModel;