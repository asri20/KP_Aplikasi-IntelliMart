const db = require("../config/db");

const getRows = async (sql, params = []) => {
  const result = await db.query(sql, params);
  return Array.isArray(result[0]) ? result[0] : result;
};

const ProductRecommendationModel = {
  // Upselling: cari varian yang lebih besar dari varian yang sedang dipilih.
  // Hanya menampilkan varian aktif dan tersedia di stok toko.
  selling: async (variantId, storeId) => {
    const sql = `
      SELECT
        source.id AS source_variant_id,
        source.variant_name AS source_variant_name,
        source.weight AS source_weight,
        target.id AS recommended_variant_id,
        p.product_name,
        target.variant_name AS recommended_variant_name,
        target.sku,
        target.weight AS recommended_weight,
        COALESCE(stock.stock, 0) AS available_stock,
        stock.base_price,
        COALESCE(stock.discount_store, 0) AS discount_store,
        ROUND(
          stock.base_price *
          (1 - COALESCE(stock.discount_store, 0) / 100),
          0
        ) AS retail_price
      FROM ms_product_variant source
      JOIN ms_product_variant target
        ON target.product_id = source.product_id
       AND target.id <> source.id
       AND target.weight > source.weight
       AND target.is_active = 1
      JOIN tm_product p
        ON p.id = target.product_id
      JOIN tr_product_stock stock
        ON stock.variant_id = target.id
       AND stock.store_id = ?
      WHERE source.id = ?
        AND source.is_active = 1
        AND COALESCE(stock.stock, 0) > 0
      ORDER BY target.weight ASC
    `;

    return getRows(sql, [storeId, variantId]);
  },

  // Cross-selling: pasangan produk berbeda yang pernah dibeli bersamaan.

  getUpselling: async (variantId, storeId) => {
    const sql = `
    SELECT
      source.id AS source_variant_id,
      source.variant_name AS source_variant_name,

      target.id AS recommended_variant_id,
      p.product_name,
      target.variant_name AS recommended_variant_name,
      target.sku,

      COALESCE(
        NULLIF(source.weight, 0),
        CAST(REPLACE(LOWER(source.variant_name), 'gr', '') AS DECIMAL(10,2))
      ) AS source_size,

      COALESCE(
        NULLIF(target.weight, 0),
        CAST(REPLACE(LOWER(target.variant_name), 'gr', '') AS DECIMAL(10,2))
      ) AS recommended_size,

      COALESCE(stock.stock, 0) AS available_stock,
      stock.base_price,

      COALESCE(stock.discount_store, 0) AS discount_store,

      CASE
        WHEN stock.base_price IS NOT NULL THEN
          ROUND(
            stock.base_price *
            (1 - COALESCE(stock.discount_store, 0) / 100),
            0
          )
        ELSE NULL
      END AS retail_price,

      CASE
        WHEN COALESCE(stock.stock, 0) > 0 THEN 1
        ELSE 0
      END AS is_available

    FROM ms_product_variant source

    JOIN ms_product_variant target
      ON target.product_id = source.product_id
     AND target.id <> source.id
     AND target.is_active = 1

    JOIN tm_product p
      ON p.id = target.product_id

    LEFT JOIN tr_product_stock stock
      ON stock.variant_id = target.id
     AND stock.store_id = ?

    WHERE source.id = ?
      AND source.is_active = 1

      AND COALESCE(
        NULLIF(target.weight, 0),
        CAST(REPLACE(LOWER(target.variant_name), 'gr', '') AS DECIMAL(10,2))
      ) >
      COALESCE(
        NULLIF(source.weight, 0),
        CAST(REPLACE(LOWER(source.variant_name), 'gr', '') AS DECIMAL(10,2))
      )

    ORDER BY recommended_size ASC
  `;

    return getRows(sql, [storeId, variantId]);
  },
};

module.exports = ProductRecommendationModel;
