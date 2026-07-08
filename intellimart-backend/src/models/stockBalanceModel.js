// src/models/stockBalanceModel.js

const db = require('../config/db');

const StockBalanceModel = {

  /**
   * ===============================
   * Cek apakah toko tersedia
   * ===============================
   */
  findStore: async (client, store_id) => {

    const sql = `
      SELECT
        store_id,
        store_name
      FROM tm_toko
      WHERE store_id = $1
    `;

    const result = await client.query(sql, [store_id]);

    return result.rows[0] || null;
  },

  /**
   * ===============================
   * Cek apakah varian tersedia
   * ===============================
   */
  findVariant: async (client, variant_id) => {

    const sql = `
      SELECT
        variant_id,
        product_id,
        variant_name,
        minimum_stock,
        is_active
      FROM tm_product_variants
      WHERE variant_id = $1
    `;

    const result = await client.query(sql, [variant_id]);

    return result.rows[0] || null;
  },

  /**
   * ===============================
   * Ambil stok berdasarkan toko & varian
   * ===============================
   */
  findByStoreVariant: async (client, store_id, variant_id) => {

    const sql = `
      SELECT *
      FROM tm_stock_balances
      WHERE
        store_id = $1
        AND variant_id = $2
    `;

    const result = await client.query(sql, [
      store_id,
      variant_id
    ]);

    return result.rows[0] || null;
  },

  /**
   * ===============================
   * Ambil seluruh saldo stok
   * ===============================
   */
  findAll: async () => {

    const sql = `
      SELECT
        sb.store_id,
        t.store_name,

        sb.variant_id,
        v.variant_name,

        sb.quantity_available,
        sb.min_stock,

        sb.updated_at

      FROM tm_stock_balances sb

      INNER JOIN tm_toko t
        ON sb.store_id = t.store_id

      INNER JOIN tm_product_variants v
        ON sb.variant_id = v.variant_id

      ORDER BY
        t.store_name,
        v.variant_name
    `;

    const result = await db.query(sql);

    return result.rows;
  },

  /**
   * ===============================
   * Membuat saldo stok baru
   * ===============================
   */
  createBalance: async (
    client,
    store_id,
    variant_id,
    quantity_available = 0,
    min_stock = 0
  ) => {

    const sql = `
      INSERT INTO tm_stock_balances
      (
        store_id,
        variant_id,
        quantity_available,
        min_stock
      )
      VALUES
      (
        $1,$2,$3,$4
      )
      RETURNING *
    `;

    const result = await client.query(sql, [

      store_id,
      variant_id,
      quantity_available,
      min_stock

    ]);

    return result.rows[0];
  },

  /**
   * ===============================
   * Update saldo stok
   * ===============================
   */
  updateBalance: async (
    client,
    store_id,
    variant_id,
    quantity_available
  ) => {

    const sql = `
      UPDATE tm_stock_balances
      SET
        quantity_available = $3,
        updated_at = NOW()
      WHERE
        store_id = $1
        AND variant_id = $2
      RETURNING *
    `;

    const result = await client.query(sql, [

      store_id,
      variant_id,
      quantity_available

    ]);

    return result.rows[0] || null;
  }

};

module.exports = StockBalanceModel;