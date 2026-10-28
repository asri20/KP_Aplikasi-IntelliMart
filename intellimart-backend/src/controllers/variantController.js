// src/controllers/variantController.js
// Controller untuk modul Varian Produk

const VariantModel = require('../models/variantModel');
const ProductModel = require('../models/productModel');

const VariantController = {

  /**
   * GET /api/variants
   * Ambil semua varian
   */
  getAll: async (req, res) => {
    try {
      const data = await VariantModel.findAll();
      return res.status(200).json({
        success: true,
        message: 'Data varian berhasil diambil',
        count: data.length,
        data,
      });
    } catch (error) {
      console.error('VariantController.getAll error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data varian', error: error.message });
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
   * Body: { product_id, sku, barcode?, variant_name, cost_price, selling_price, stock?, minimum_stock?, is_active? }
   */
  create: async (req, res) => {
    try {
      const {
        product_id, sku, barcode, variant_name,
        cost_price, selling_price, stock, minimum_stock, is_active
      } = req.body;

      // Validasi field wajib
      if (!product_id)                         return res.status(400).json({ success: false, message: 'ID produk wajib diisi' });
      if (!sku || sku.trim() === '')           return res.status(400).json({ success: false, message: 'SKU wajib diisi' });
      if (!variant_name || variant_name.trim() === '') return res.status(400).json({ success: false, message: 'Nama varian wajib diisi' });

      // Validasi harga tidak boleh negatif
      if (cost_price !== undefined && parseFloat(cost_price) < 0) {
        return res.status(400).json({ success: false, message: 'Harga modal tidak boleh negatif' });
      }
      if (selling_price !== undefined && parseFloat(selling_price) < 0) {
        return res.status(400).json({ success: false, message: 'Harga jual tidak boleh negatif' });
      }

      // Validasi stok tidak boleh negatif
      if (stock !== undefined && parseInt(stock) < 0) {
        return res.status(400).json({ success: false, message: 'Stok tidak boleh negatif' });
      }
      if (minimum_stock !== undefined && parseInt(minimum_stock) < 0) {
        return res.status(400).json({ success: false, message: 'Minimum stok tidak boleh negatif' });
      }

      // Validasi produk ada
      const product = await ProductModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Produk dengan ID ${product_id} tidak ditemukan` });
      }

      // Validasi SKU unik
      const existingSku = await VariantModel.findBySku(sku);
      if (existingSku) {
        return res.status(409).json({ success: false, message: `SKU '${sku}' sudah digunakan` });
      }

      // Validasi Barcode unik (jika diisi)
      if (barcode) {
        const existingBarcode = await VariantModel.findByBarcode(barcode);
        if (existingBarcode) {
          return res.status(409).json({ success: false, message: `Barcode '${barcode}' sudah digunakan` });
        }
      }

      const data = await VariantModel.create({
        product_id,
        sku: sku.trim(),
        barcode: barcode ? barcode.trim() : null,
        variant_name: variant_name.trim(),
        cost_price,
        selling_price,
        stock,
        minimum_stock,
        is_active,
      });

      return res.status(201).json({ success: true, message: 'Varian produk berhasil dibuat', data });
    } catch (error) {
      console.error('VariantController.create error:', error);
      return res.status(500).json({ success: false, message: 'Gagal membuat varian produk', error: error.message });
    }
  },

  /**
   * PUT /api/variants/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        product_id, sku, barcode, variant_name,
        cost_price, selling_price, stock, minimum_stock, is_active
      } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID varian tidak valid' });
      }

      // Validasi field wajib
      if (!product_id)                         return res.status(400).json({ success: false, message: 'ID produk wajib diisi' });
      if (!sku || sku.trim() === '')           return res.status(400).json({ success: false, message: 'SKU wajib diisi' });
      if (!variant_name || variant_name.trim() === '') return res.status(400).json({ success: false, message: 'Nama varian wajib diisi' });

      // Validasi harga tidak boleh negatif
      if (cost_price !== undefined && parseFloat(cost_price) < 0) {
        return res.status(400).json({ success: false, message: 'Harga modal tidak boleh negatif' });
      }
      if (selling_price !== undefined && parseFloat(selling_price) < 0) {
        return res.status(400).json({ success: false, message: 'Harga jual tidak boleh negatif' });
      }

      // Validasi stok tidak boleh negatif
      if (stock !== undefined && parseInt(stock) < 0) {
        return res.status(400).json({ success: false, message: 'Stok tidak boleh negatif' });
      }
      if (minimum_stock !== undefined && parseInt(minimum_stock) < 0) {
        return res.status(400).json({ success: false, message: 'Minimum stok tidak boleh negatif' });
      }

      const existing = await VariantModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Varian dengan ID ${id} tidak ditemukan` });
      }

      // Validasi produk ada
      const product = await ProductModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Produk dengan ID ${product_id} tidak ditemukan` });
      }

      // Validasi SKU unik (kecuali dirinya sendiri)
      const existingSku = await VariantModel.findBySku(sku, id);
      if (existingSku) {
        return res.status(409).json({ success: false, message: `SKU '${sku}' sudah digunakan` });
      }

      // Validasi Barcode unik (kecuali dirinya sendiri, jika diisi)
      if (barcode) {
        const existingBarcode = await VariantModel.findByBarcode(barcode, id);
        if (existingBarcode) {
          return res.status(409).json({ success: false, message: `Barcode '${barcode}' sudah digunakan` });
        }
      }

      const data = await VariantModel.update(id, {
        product_id,
        sku: sku.trim(),
        barcode: barcode ? barcode.trim() : null,
        variant_name: variant_name.trim(),
        cost_price,
        selling_price,
        stock,
        minimum_stock,
        is_active: is_active !== undefined ? is_active : existing.is_active,
      });

      return res.status(200).json({ success: true, message: 'Varian produk berhasil diperbarui', data });
    } catch (error) {
      console.error('VariantController.update error:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui varian produk', error: error.message });
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

      return res.status(200).json({ success: true, message: 'Varian produk berhasil dihapus', data });
    } catch (error) {
      console.error('VariantController.delete error:', error);
      return res.status(500).json({ success: false, message: 'Gagal menghapus varian produk', error: error.message });
    }
  },
};

module.exports = VariantController;
