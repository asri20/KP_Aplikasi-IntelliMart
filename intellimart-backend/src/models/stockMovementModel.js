// src/models/stockMovementModel.js

const db = require('../config/db');

const StockMovementModel = {

  /**
   * Ambil seluruh histori pergerakan stok
   */
  findAll: async () => {
    const sql = `
      SELECT
        sm.movement_id,
        sm.store_id,
        t.store_name,
        sm.variant_id,
        v.variant_name,
        sm.movement_type,
        sm.quantity,
        sm.reference_type,
        sm.reference_id,
        sm.notes,
        sm.created_by,
        sm.created_at
      FROM tt_stock_movements sm
      INNER JOIN tm_toko t
        ON sm.store_id = t.store_id
      INNER JOIN tm_product_variants v
        ON sm.variant_id = v.variant_id
      ORDER BY sm.created_at DESC
    `;

    const result = await db.query(sql);
    return result.rows;
  },

  /**
   * Ambil histori berdasarkan ID
   */
  findById: async (movement_id) => {

    const sql = `
      SELECT
        sm.movement_id,
        sm.store_id,
        t.store_name,
        sm.variant_id,
        v.variant_name,
        sm.movement_type,
        sm.quantity,
        sm.reference_type,
        sm.reference_id,
        sm.notes,
        sm.created_by,
        sm.created_at
      FROM tt_stock_movements sm
      INNER JOIN tm_toko t
        ON sm.store_id = t.store_id
      INNER JOIN tm_product_variants v
        ON sm.variant_id = v.variant_id
      WHERE sm.movement_id = $1
    `;

    const result = await db.query(sql, [movement_id]);

    return result.rows[0] || null;
  },

  /**
   * Histori berdasarkan varian
   */
  findByVariant: async (variant_id) => {

    const sql = `
      SELECT
        sm.movement_id,
        sm.store_id,
        t.store_name,
        sm.variant_id,
        v.variant_name,
        sm.movement_type,
        sm.quantity,
        sm.reference_type,
        sm.reference_id,
        sm.notes,
        sm.created_by,
        sm.created_at
      FROM tt_stock_movements sm
      INNER JOIN tm_toko t
        ON sm.store_id = t.store_id
      INNER JOIN tm_product_variants v
        ON sm.variant_id = v.variant_id
      WHERE sm.variant_id = $1
      ORDER BY sm.created_at DESC
    `;

    const result = await db.query(sql, [variant_id]);

    return result.rows;
  },

  /**
   * Histori berdasarkan toko
   */
  findByStore: async (store_id) => {

    const sql = `
      SELECT
        sm.movement_id,
        sm.store_id,
        t.store_name,
        sm.variant_id,
        v.variant_name,
        sm.movement_type,
        sm.quantity,
        sm.reference_type,
        sm.reference_id,
        sm.notes,
        sm.created_by,
        sm.created_at
      FROM tt_stock_movements sm
      INNER JOIN tm_toko t
        ON sm.store_id = t.store_id
      INNER JOIN tm_product_variants v
        ON sm.variant_id = v.variant_id
      WHERE sm.store_id = $1
      ORDER BY sm.created_at DESC
    `;

    const result = await db.query(sql, [store_id]);

    return result.rows;
  },

  /**
   * Histori berdasarkan toko + varian
   */
  findByStoreVariant: async (store_id, variant_id) => {

    const sql = `
      SELECT
        sm.movement_id,
        sm.store_id,
        t.store_name,
        sm.variant_id,
        v.variant_name,
        sm.movement_type,
        sm.quantity,
        sm.reference_type,
        sm.reference_id,
        sm.notes,
        sm.created_by,
        sm.created_at
      FROM tt_stock_movements sm
      INNER JOIN tm_toko t
        ON sm.store_id = t.store_id
      INNER JOIN tm_product_variants v
        ON sm.variant_id = v.variant_id
      WHERE sm.store_id = $1
        AND sm.variant_id = $2
      ORDER BY sm.created_at DESC
    `;

    const result = await db.query(sql, [store_id, variant_id]);

    return result.rows;
  },

  /**
   * Simpan histori movement
   * Menggunakan transaction (client)
   */
  createMovement: async (client, {
    store_id,
    variant_id,
    movement_type,
    quantity,
    reference_type,
    reference_id,
    notes,
    created_by
  }) => {

    const sql = `
      INSERT INTO tt_stock_movements
      (
        store_id,
        variant_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        notes,
        created_by
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8
      )
      RETURNING *
    `;

    const values = [
      store_id,
      variant_id,
      movement_type,
      quantity,
      reference_type || null,
      reference_id || null,
      notes || null,
      created_by || null
    ];

    const result = await client.query(sql, values);

    return result.rows[0];
  }

};

module.exports = StockMovementModel;