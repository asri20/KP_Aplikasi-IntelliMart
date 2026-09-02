// src/controllers/variantController.js
// Controller untuk modul Varian Produk

const VariantModel = require('../models/variantModel');
const ProductModel = require('../models/productModel');

const VariantController = {

  /**
   * GET /api/variants
   * GET /api/variants?product_id=5   -> filter varian milik satu produk
   */
  getAll: async (req, res) => {
    try {
      const { product_id } = req.query;
      const data = await VariantModel.findAll(product_id);

      return res.status(200).json({
        success: true,
        message: 'Data varian berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('VariantController.getAll error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data varian',
        error: error.message
      });
    }
  },

  /**
   * GET /api/variants/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID varian tidak valid' });
      }

      const data = await VariantModel.findById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: `Varian dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Data varian berhasil diambil', data });
    } catch (error) {
      console.error('VariantController.getById error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data varian', error: error.message });
    }
  },

  /**
   * POST /api/variants
   */
  create: async (req, res) => {
    try {
      const { product_id, variant_name, sku, barcode, cost_price, weight, is_active } = req.body;

      if (!product_id) {
        return res.status(400).json({ success: false, message: 'product_id wajib diisi' });
      }
      if (!variant_name || variant_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'variant_name wajib diisi' });
      }
      if (!sku || sku.trim() === '') {
        return res.status(400).json({ success: false, message: 'sku wajib diisi' });
      }

      const product = await ProductModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Produk dengan ID ${product_id} tidak ditemukan` });
      }

      const data = await VariantModel.create({
        product_id,
        variant_name: variant_name.trim(),
        sku: sku.trim(),
        barcode,
        cost_price,
        weight,
        is_active
      });

      return res.status(201).json({ success: true, message: 'Varian berhasil dibuat', data });
    } catch (error) {
      console.error('VariantController.create error:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'SKU atau barcode sudah dipakai varian lain, gunakan yang unik',
          error: 'DUPLICATE_ENTRY'
        });
      }

      return res.status(500).json({ success: false, message: 'Gagal membuat varian', error: error.message });
    }
  },

  /**
   * PUT /api/variants/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { variant_name, sku, barcode, cost_price, weight, is_active } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID varian tidak valid' });
      }
      if (!variant_name || variant_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'variant_name wajib diisi' });
      }
      if (!sku || sku.trim() === '') {
        return res.status(400).json({ success: false, message: 'sku wajib diisi' });
      }

      const existing = await VariantModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Varian dengan ID ${id} tidak ditemukan` });
      }

      const data = await VariantModel.update(id, {
        variant_name: variant_name.trim(),
        sku: sku.trim(),
        barcode,
        cost_price,
        weight,
        is_active: is_active !== undefined ? is_active : existing.is_active
      });

      return res.status(200).json({ success: true, message: 'Varian berhasil diperbarui', data });
    } catch (error) {
      console.error('VariantController.update error:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'SKU atau barcode sudah dipakai varian lain, gunakan yang unik',
          error: 'DUPLICATE_ENTRY'
        });
      }

      return res.status(500).json({ success: false, message: 'Gagal memperbarui varian', error: error.message });
    }
  },

  /**
   * DELETE /api/variants/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID varian tidak valid' });
      }

      const data = await VariantModel.delete(id);
      if (!data) {
        return res.status(404).json({ success: false, message: `Varian dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Varian berhasil dihapus', data });
    } catch (error) {
      console.error('VariantController.delete error:', error);

      // Varian ini masih dipakai di transaksi/stok/PO/dll -> DB menolak hapus (FK RESTRICT)
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
        return res.status(409).json({
          success: false,
          message: 'Varian ini masih dipakai di data lain (stok, transaksi, atau PO), tidak bisa dihapus',
          error: 'ROW_IS_REFERENCED'
        });
      }

      return res.status(500).json({ success: false, message: 'Gagal menghapus varian', error: error.message });
    }
  }

};

module.exports = VariantController;
