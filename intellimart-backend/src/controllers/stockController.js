// src/controllers/stockController.js
// Controller untuk modul Manajemen Stok

const StockModel = require('../models/stockModel');

const StockController = {

  /**
   * POST /api/stocks/in
   * Stok masuk - menambah stok pada varian
   * Body: { variant_id, qty, keterangan? }
   */
  stockIn: async (req, res) => {
    try {
      const { variant_id, qty, keterangan } = req.body;

      // Validasi field wajib
      if (!variant_id) {
        return res.status(400).json({ success: false, message: 'ID varian wajib diisi' });
      }

      if (qty === undefined || qty === null || qty === '') {
        return res.status(400).json({ success: false, message: 'Jumlah (qty) wajib diisi' });
      }

      const qtyNum = parseInt(qty);

      // Validasi qty positif
      if (isNaN(qtyNum) || qtyNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah stok masuk harus berupa angka positif (minimal 1)',
        });
      }

      // Cek apakah varian ada
      const variant = await StockModel.findVariantById(variant_id);
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: `Varian dengan ID ${variant_id} tidak ditemukan`,
        });
      }

      const stokSebelum = parseInt(variant.stock);

      // Update stok
      const updated = await StockModel.stockIn(variant_id, qtyNum);
      const stokSesudah = parseInt(updated.stock);

      return res.status(200).json({
        success: true,
        message: `Stok masuk berhasil dicatat. ${variant.product_name} - ${variant.variant_name}`,
        data: {
          variant_id:    updated.variant_id,
          product_name:  variant.product_name,
          variant_name:  variant.variant_name,
          sku:           variant.sku,
          qty_masuk:     qtyNum,
          stok_sebelum:  stokSebelum,
          stok_sesudah:  stokSesudah,
          keterangan:    keterangan || 'Stok masuk',
          updated_at:    updated.updated_at,
        },
      });
    } catch (error) {
      console.error('StockController.stockIn error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memproses stok masuk',
        error: error.message,
      });
    }
  },

  /**
   * POST /api/stocks/out
   * Stok keluar - mengurangi stok pada varian
   * Body: { variant_id, qty, keterangan? }
   */
  stockOut: async (req, res) => {
    try {
      const { variant_id, qty, keterangan } = req.body;

      // Validasi field wajib
      if (!variant_id) {
        return res.status(400).json({ success: false, message: 'ID varian wajib diisi' });
      }

      if (qty === undefined || qty === null || qty === '') {
        return res.status(400).json({ success: false, message: 'Jumlah (qty) wajib diisi' });
      }

      const qtyNum = parseInt(qty);

      // Validasi qty positif
      if (isNaN(qtyNum) || qtyNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah stok keluar harus berupa angka positif (minimal 1)',
        });
      }

      // Cek apakah varian ada
      const variant = await StockModel.findVariantById(variant_id);
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: `Varian dengan ID ${variant_id} tidak ditemukan`,
        });
      }

      const stokSebelum = parseInt(variant.stock);

      // Proses stok keluar (model akan validasi tidak minus)
      const updated = await StockModel.stockOut(variant_id, qtyNum);
      const stokSesudah = parseInt(updated.stock);

      // Peringatan jika stok rendah setelah pengurangan
      const warning = stokSesudah <= parseInt(variant.minimum_stock)
        ? `⚠️ Perhatian: Stok sekarang (${stokSesudah}) berada di bawah atau sama dengan minimum stok (${variant.minimum_stock})`
        : null;

      return res.status(200).json({
        success: true,
        message: `Stok keluar berhasil dicatat. ${variant.product_name} - ${variant.variant_name}`,
        data: {
          variant_id:    updated.variant_id,
          product_name:  variant.product_name,
          variant_name:  variant.variant_name,
          sku:           variant.sku,
          qty_keluar:    qtyNum,
          stok_sebelum:  stokSebelum,
          stok_sesudah:  stokSesudah,
          minimum_stock: parseInt(variant.minimum_stock),
          keterangan:    keterangan || 'Stok keluar',
          warning,
          updated_at:    updated.updated_at,
        },
      });
    } catch (error) {
      console.error('StockController.stockOut error:', error);

      // Error stok tidak mencukupi
      if (error.message.includes('Stok tidak mencukupi')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'INSUFFICIENT_STOCK',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal memproses stok keluar',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/stocks/low-stock
   * Ambil semua produk dengan stok di bawah atau sama dengan minimum stok
   */
  getLowStock: async (req, res) => {
    try {
      const data = await StockModel.getLowStock();

      return res.status(200).json({
        success: true,
        message: data.length > 0
          ? `Ditemukan ${data.length} varian dengan stok rendah`
          : 'Tidak ada varian dengan stok rendah',
        count: data.length,
        data,
      });
    } catch (error) {
      console.error('StockController.getLowStock error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data stok rendah',
        error: error.message,
      });
    }
  },
};

module.exports = StockController;
