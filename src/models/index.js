/**
 * models/index.js
 *
 * Modul Dashboard & Analitik (Modul 10) tidak mendefinisikan model Sequelize sendiri.
 * Semua akses data dilakukan via raw SQL langsung ke MySQL menggunakan
 * pool koneksi dari src/config/database.js.
 *
 * Tabel & VIEW yang digunakan (sesuai intellimart_dokumentasi_database.md):
 *
 * VIEW (tinggal SELECT, sudah didefinisikan di database):
 *   - vw_sales_report_daily       → tren penjualan harian (status LUNAS)
 *   - vw_best_selling_products    → produk terlaris per toko
 *   - vw_low_stock_alert          → varian stok ≤ min_stock
 *   - vw_product_catalog          → katalog produk lengkap per toko
 *   - vw_customer_latest_segment  → segmen terbaru tiap customer
 *
 * Tabel yang di-query langsung:
 *   - tt_transaction              → data transaksi (status: UNPAID / LUNAS)
 *   - tt_transaction_detail       → detail item per transaksi
 *   - tr_product_stock            → stok & harga modal per toko-varian
 *
 * Modul lain yang mengelola data master (JANGAN disentuh dari sini):
 *   - tm_product, ms_product_variant → modul_UserKeamanan (port 5000)
 *   - tm_store, tm_users, tm_roles   → modul_UserKeamanan (port 5000)
 *   - tm_customer_profile, tt_customer_segments → modul_3 (port 5004)
 *   - tt_transaction (write)         → modul_4 / POS (port 3002)
 */
module.exports = {};
