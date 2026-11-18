const pool = require("../config/db");

/**
 * Menambahkan daftar harga grosir ke setiap data stok.
 * Pengambilan tier dilakukan sekaligus untuk menghindari query berulang
 * pada setiap produk.
 */
async function attachPriceTiers(rows) {
  if (!rows.length) return rows;

  const priceCodeIds = [
    ...new Set(
      rows
        .map((row) => row.price_code_id)
        .filter((id) => id !== null && id !== undefined),
    ),
  ];

  if (!priceCodeIds.length) {
    return rows.map((row) => ({
      ...row,
      price_tiers: [],
    }));
  }

  const [tierRows] = await pool.query(
    `SELECT price_code_id, min_qty, max_qty, unit_price
     FROM tr_tier_price
     WHERE price_code_id IN (?)
     ORDER BY price_code_id ASC, min_qty ASC`,
    [priceCodeIds],
  );

  const tierMap = {};

  for (const tier of tierRows) {
    if (!tierMap[tier.price_code_id]) {
      tierMap[tier.price_code_id] = [];
    }

    tierMap[tier.price_code_id].push({
      min_qty: Number(tier.min_qty),
      max_qty: tier.max_qty === null ? null : Number(tier.max_qty),
      unit_price: Number(tier.unit_price),
    });
  }

  return rows.map((row) => ({
    ...row,
    price_tiers: tierMap[row.price_code_id] || [],
  }));
}

async function findAll(store_id, variant_id) {
  const conditions = [];
  const params = [];

  if (store_id) {
    conditions.push("ps.store_id = ?");
    params.push(store_id);
  }

  if (variant_id) {
    conditions.push("ps.variant_id = ?");
    params.push(variant_id);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [rows] = await pool.query(
    `SELECT
       ps.*,
       s.store_name,
       v.variant_name,
       v.sku,
       p.product_name,
       pc.code AS price_code,
       pc.is_active AS price_code_active
     FROM tr_product_stock ps
     JOIN tm_store s ON s.id = ps.store_id
     JOIN ms_product_variant v ON v.id = ps.variant_id
     JOIN tm_product p ON p.id = v.product_id
     LEFT JOIN tm_price_code pc ON pc.id = ps.price_code_id
     ${whereClause}
     ORDER BY ps.store_id ASC, ps.variant_id ASC`,
    params,
  );

  return attachPriceTiers(rows);
}

async function findOne(store_id, variant_id) {
  const [rows] = await pool.query(
    `SELECT
       ps.*,
       s.store_name,
       v.variant_name,
       v.sku,
       p.product_name,
       pc.code AS price_code,
       pc.is_active AS price_code_active
     FROM tr_product_stock ps
     JOIN tm_store s ON s.id = ps.store_id
     JOIN ms_product_variant v ON v.id = ps.variant_id
     JOIN tm_product p ON p.id = v.product_id
     LEFT JOIN tm_price_code pc ON pc.id = ps.price_code_id
     WHERE ps.store_id = ? AND ps.variant_id = ?`,
    [store_id, variant_id],
  );

  if (!rows.length) return null;

  const data = await attachPriceTiers(rows);
  return data[0];
}

/**
 * Buat baris baru.
 * Stok selalu dimulai dari 0.
 */
async function create({
  store_id,
  variant_id,
  base_price,
  price_code_id,
  discount_store,
  min_stock,
}) {
  await pool.query(
    `INSERT INTO tr_product_stock
      (store_id, variant_id, stock, base_price,
       price_code_id, discount_store, min_stock)
     VALUES (?, ?, 0, ?, ?, ?, ?)`,
    [
      store_id,
      variant_id,
      base_price || 0,
      price_code_id || null,
      discount_store || 0,
      min_stock || 0,
    ],
  );

  return findOne(store_id, variant_id);
}

/**
 * Update harga dan pengaturan saja.
 * Tidak mengubah stok.
 */
async function update(
  store_id,
  variant_id,
  { base_price, price_code_id, discount_store, min_stock },
) {
  await pool.query(
    `UPDATE tr_product_stock
     SET base_price = ?,
         price_code_id = ?,
         discount_store = ?,
         min_stock = ?
     WHERE store_id = ? AND variant_id = ?`,
    [
      base_price,
      price_code_id ?? null,
      discount_store ?? 0,
      min_stock ?? 0,
      store_id,
      variant_id,
    ],
  );

  return findOne(store_id, variant_id);
}

async function deleteOne(store_id, variant_id) {
  const existing = await findOne(store_id, variant_id);
  if (!existing) return null;

  await pool.query(
    `DELETE FROM tr_product_stock
     WHERE store_id = ? AND variant_id = ?`,
    [store_id, variant_id],
  );

  return existing;
}

module.exports = {
  findAll,
  findOne,
  create,
  update,
  delete: deleteOne,
};
