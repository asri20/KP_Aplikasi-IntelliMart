// src/models/stockModel.js
// Model untuk operasi stok pada tabel tm_product_variants

const db = require('../config/db');

const StockModel = {

  /**
   * Ambil data varian berdasarkan ID (untuk keperluan stok)
   */
  findVariantById: async (variant_id) => {
    const sql = `
      SELECT
        v.variant_id, v.product_id, v.sku, v.variant_name,
        v.stock, v.minimum_stock,
        p.product_name
      FROM tm_product_variants v
      LEFT JOIN tm_products p ON v.product_id = p.product_id
      WHERE v.variant_id = $1
    `;
    const result = await db.query(sql, [variant_id]);
    return result.rows[0] || null;
  },

  /**
   * Tambah stok masuk (stock in)
   * Menambahkan jumlah qty ke kolom stock
   */
  stockIn: async (variant_id, qty) => {
    const sql = `
      UPDATE tm_product_variants
      SET
        stock      = stock + $1,
        updated_at = NOW()
      WHERE variant_id = $2
      RETURNING *
    `;
    const result = await db.query(sql, [qty, variant_id]);
    return result.rows[0] || null;
  },

  /**
   * Kurangi stok keluar (stock out)
   * Mengurangi qty dari kolom stock, dengan validasi tidak boleh minus
   */
  stockOut: async (variant_id, qty) => {
    // Gunakan CASE untuk mencegah stok negatif
    // Jika stok setelah dikurangi < 0, lempar error dengan UPDATE yang gagal
    const checkSql = `
      SELECT stock FROM tm_product_variants WHERE variant_id = $1
    `;
    const checkResult = await db.query(checkSql, [variant_id]);
    const variant = checkResult.rows[0];

    if (!variant) {
      throw new Error('Varian tidak ditemukan.');
    }

    if (variant.stock < qty) {
      throw new Error(
        `Stok tidak mencukupi. Stok tersedia: ${variant.stock}, Jumlah diminta: ${qty}`
      );
    }

    const sql = `
      UPDATE tm_product_variants
      SET
        stock      = stock - $1,
        updated_at = NOW()
      WHERE variant_id = $2
      RETURNING *
    `;
    const result = await db.query(sql, [qty, variant_id]);
    return result.rows[0] || null;
  },

  /**
   * Ambil semua produk dengan stok rendah (stock <= minimum_stock)
   */
  getLowStock: async () => {
    const sql = `
      SELECT
        v.variant_id,
        v.product_id,
        p.product_name,
        v.sku,
        v.barcode,
        v.variant_name,
        v.stock,
        v.minimum_stock,
        (v.minimum_stock - v.stock) AS kekurangan_stok,
        v.selling_price,
        v.is_active
      FROM tm_product_variants v
      LEFT JOIN tm_products p ON v.product_id = p.product_id
      WHERE v.stock <= v.minimum_stock
        AND v.is_active = true
      ORDER BY kekurangan_stok DESC, v.stock ASC
    `;
    const result = await db.query(sql);
    return result.rows;
  },
};

module.exports = StockModel;
