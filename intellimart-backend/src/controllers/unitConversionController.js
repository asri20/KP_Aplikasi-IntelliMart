// src/controllers/unitConversionController.js
// Controller untuk modul Konversi Satuan (Multi-satuan Ecer/Grosir)

const UnitConversionModel = require('../models/unitConversionModel');
const ProductModel = require('../models/productModel');
const UnitModel = require('../models/unitModel');

const UnitConversionController = {

  /**
   * GET /api/unit-conversions
   * GET /api/unit-conversions?product_id=1
   */
  getAll: async (req, res) => {
    try {
      const { product_id } = req.query;
      const data = await UnitConversionModel.findAll(product_id);

      return res.status(200).json({
        success: true,
        message: 'Data konversi satuan berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('UnitConversionController.getAll error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data konversi satuan', error: error.message });
    }
  },

  /**
   * GET /api/unit-conversions/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID konversi satuan tidak valid' });
      }

      const data = await UnitConversionModel.findById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: `Konversi satuan dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Data konversi satuan berhasil diambil', data });
    } catch (error) {
      console.error('UnitConversionController.getById error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data konversi satuan', error: error.message });
    }
  },

  /**
   * POST /api/unit-conversions
   *
   * ATURAN SATUAN DASAR (is_base_unit):
   * - Satu produk cuma boleh punya SATU satuan dasar aktif.
   * - Kalau produk BELUM punya stok tercatat sama sekali -> otomatis switch
   *   (satuan dasar lama di-nonaktifkan, yang baru jadi aktif).
   * - Kalau produk SUDAH punya stok tercatat -> DITOLAK, harus ditangani manual dulu,
   *   supaya tidak ada histori stok yang jadi salah tafsir gara-gara satuan dasar berubah.
   */
  create: async (req, res) => {
    try {
      const { product_id, unit_id, conversion_qty, is_base_unit } = req.body;

      if (!product_id) {
        return res.status(400).json({ success: false, message: 'product_id wajib diisi' });
      }
      if (!unit_id) {
        return res.status(400).json({ success: false, message: 'unit_id wajib diisi' });
      }
      if (conversion_qty === undefined || conversion_qty === null || isNaN(conversion_qty) || Number(conversion_qty) <= 0) {
        return res.status(400).json({ success: false, message: 'conversion_qty wajib diisi dan harus lebih besar dari 0' });
      }
      if (is_base_unit && Number(conversion_qty) !== 1) {
        return res.status(400).json({ success: false, message: 'Satuan dasar (is_base_unit=true) wajib punya conversion_qty = 1' });
      }

      const product = await ProductModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Produk dengan ID ${product_id} tidak ditemukan` });
      }

      const unit = await UnitModel.findById(unit_id);
      if (!unit) {
        return res.status(404).json({ success: false, message: `Satuan dengan ID ${unit_id} tidak ditemukan` });
      }

      let existingBase = null;
      if (is_base_unit) {
        existingBase = await UnitConversionModel.findBaseUnit(product_id);
        if (existingBase) {
          const hasStock = await UnitConversionModel.hasExistingStock(product_id);
          if (hasStock) {
            return res.status(409).json({
              success: false,
              message: `Produk ini sudah punya stok tercatat. Ganti satuan dasar bisa membuat histori stok salah tafsir -- tangani manual dulu (mis. audit stok) sebelum mengganti.`,
              error: 'BASE_UNIT_CHANGE_BLOCKED_HAS_STOCK'
            });
          }
        }
      }

      const data = await UnitConversionModel.create({ product_id, unit_id, conversion_qty, is_base_unit });

      // Auto-switch: kalau ini satuan dasar baru dan sebelumnya ada satuan dasar lain (dan aman, stok=0), nonaktifkan yang lama
      if (is_base_unit && existingBase) {
        await UnitConversionModel.unsetOtherBaseUnits(product_id, data.id);
      }

      return res.status(201).json({ success: true, message: 'Konversi satuan berhasil dibuat', data });
    } catch (error) {
      console.error('UnitConversionController.create error:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Produk ini sudah punya konversi untuk satuan tersebut, gunakan PUT untuk update',
          error: 'DUPLICATE_ENTRY'
        });
      }

      return res.status(500).json({ success: false, message: 'Gagal membuat konversi satuan', error: error.message });
    }
  },

  /**
   * PUT /api/unit-conversions/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { conversion_qty, is_base_unit } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID konversi satuan tidak valid' });
      }

      const existing = await UnitConversionModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Konversi satuan dengan ID ${id} tidak ditemukan` });
      }

      const finalQty = conversion_qty !== undefined ? conversion_qty : existing.conversion_qty;
      const finalIsBase = is_base_unit !== undefined ? is_base_unit : !!existing.is_base_unit;

      if (finalQty === undefined || finalQty === null || isNaN(finalQty) || Number(finalQty) <= 0) {
        return res.status(400).json({ success: false, message: 'conversion_qty wajib diisi dan harus lebih besar dari 0' });
      }
      if (finalIsBase && Number(finalQty) !== 1) {
        return res.status(400).json({ success: false, message: 'Satuan dasar (is_base_unit=true) wajib punya conversion_qty = 1' });
      }

      let existingBase = null;
      // Cuma perlu cek switch kalau field ini SEDANG diubah dari false -> true
      if (finalIsBase && !existing.is_base_unit) {
        existingBase = await UnitConversionModel.findBaseUnit(existing.product_id, id);
        if (existingBase) {
          const hasStock = await UnitConversionModel.hasExistingStock(existing.product_id);
          if (hasStock) {
            return res.status(409).json({
              success: false,
              message: `Produk ini sudah punya stok tercatat. Ganti satuan dasar bisa membuat histori stok salah tafsir -- tangani manual dulu sebelum mengganti.`,
              error: 'BASE_UNIT_CHANGE_BLOCKED_HAS_STOCK'
            });
          }
        }
      }

      const data = await UnitConversionModel.update(id, { conversion_qty: finalQty, is_base_unit: finalIsBase });

      if (finalIsBase && existingBase) {
        await UnitConversionModel.unsetOtherBaseUnits(existing.product_id, id);
      }

      return res.status(200).json({ success: true, message: 'Konversi satuan berhasil diperbarui', data });
    } catch (error) {
      console.error('UnitConversionController.update error:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui konversi satuan', error: error.message });
    }
  },

  /**
   * DELETE /api/unit-conversions/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID konversi satuan tidak valid' });
      }

      const data = await UnitConversionModel.delete(id);
      if (!data) {
        return res.status(404).json({ success: false, message: `Konversi satuan dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Konversi satuan berhasil dihapus', data });
    } catch (error) {
      console.error('UnitConversionController.delete error:', error);
      return res.status(500).json({ success: false, message: 'Gagal menghapus konversi satuan', error: error.message });
    }
  }

};

module.exports = UnitConversionController;
