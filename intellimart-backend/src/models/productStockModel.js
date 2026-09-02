const pool = require("../config/db");

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
    `SELECT ps.*, s.store_name, v.variant_name, v.sku, p.product_name, pc.code AS price_code
     FROM tr_product_stock ps
     JOIN tm_store s ON s.id = ps.store_id
     JOIN ms_product_variant v ON v.id = ps.variant_id
     JOIN tm_product p ON p.id = v.product_id
     LEFT JOIN tm_price_code pc ON pc.id = ps.price_code_id
     ${whereClause}
     ORDER BY ps.store_id ASC, ps.variant_id ASC`,
    params,
  );
  return rows;
}

async function findOne(store_id, variant_id) {
  const [rows] = await pool.query(
    `SELECT ps.*, s.store_name, v.variant_name, v.sku, p.product_name, pc.code AS price_code
     FROM tr_product_stock ps
     JOIN tm_store s ON s.id = ps.store_id
     JOIN ms_product_variant v ON v.id = ps.variant_id
     JOIN tm_product p ON p.id = v.product_id
     LEFT JOIN tm_price_code pc ON pc.id = ps.price_code_id
     WHERE ps.store_id = ? AND ps.variant_id = ?`,
    [store_id, variant_id],
  );
  return rows[0] || null;
}

/**
 * Buat baris baru (harga & pengaturan awal untuk kombinasi toko+varian ini).
 * stock SELALU dimulai dari 0 -- kalau butuh stok awal, harus lewat tt_stock_movement (movement_type INITIAL).
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
    `INSERT INTO tr_product_stock (store_id, variant_id, stock, base_price, price_code_id, discount_store, min_stock)
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
 * Update HARGA & PENGATURAN saja (base_price, price_code_id, discount_store, min_stock).
 * TIDAK ADA parameter 'stock' di sini secara sengaja.
 */
async function update(
  store_id,
  variant_id,
  { base_price, price_code_id, discount_store, min_stock },
) {
  await pool.query(
    `UPDATE tr_product_stock
     SET base_price = ?, price_code_id = ?, discount_store = ?, min_stock = ?
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
    "DELETE FROM tr_product_stock WHERE store_id = ? AND variant_id = ?",
    [store_id, variant_id],
  );
  return existing;
}

module.exports = { findAll, findOne, create, update, delete: deleteOne };
