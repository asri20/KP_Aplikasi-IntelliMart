// src/controllers/productController.js
// Controller untuk modul Produk

const ProductModel  = require('../models/productModel');
const CategoryModel = require('../models/categoryModel');
const BrandModel    = require('../models/brandModel');
const UnitModel     = require('../models/unitModel');

const ProductController = {

  /**
   * GET /api/products
   * Ambil semua produk
   */
  getAll: async (req, res) => {
    try {
      const data = await ProductModel.findAll();
      return res.status(200).json({
        success: true,
        message: 'Data produk berhasil diambil',
        count: data.length,
        data,
      });
    } catch (error) {
      console.error('ProductController.getAll error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data produk', error: error.message });
    }
  },

  /**
   * GET /api/products/:id
   * Ambil produk berdasarkan ID (beserta varian)
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID produk tidak valid' });
      }

      const data = await ProductModel.findById(id);

      if (!data) {
        return res.status(404).json({ success: false, message: `Produk dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Data produk berhasil diambil', data });
    } catch (error) {
      console.error('ProductController.getById error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data produk', error: error.message });
    }
  },

  /**
   * POST /api/products
   * Body: { product_name, description?, category_id?, brand_id?, unit_id?, is_active? }
   */
  create: async (req, res) => {
    try {
      const { product_name, description, category_id, brand_id, unit_id, is_active } = req.body;

      // Validasi field wajib
      if (!product_name || product_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });
      }

      // Validasi referensi (jika diisi)
      if (category_id) {
        const category = await CategoryModel.findById(category_id);
        if (!category) {
          return res.status(404).json({ success: false, message: `Kategori dengan ID ${category_id} tidak ditemukan` });
        }
      }

      if (brand_id) {
        const brand = await BrandModel.findById(brand_id);
        if (!brand) {
          return res.status(404).json({ success: false, message: `Brand dengan ID ${brand_id} tidak ditemukan` });
        }
      }

      if (unit_id) {
        const unit = await UnitModel.findById(unit_id);
        if (!unit) {
          return res.status(404).json({ success: false, message: `Satuan dengan ID ${unit_id} tidak ditemukan` });
        }
      }

      const data = await ProductModel.create({
        product_name: product_name.trim(),
        description,
        category_id,
        brand_id,
        unit_id,
        is_active,
      });

      return res.status(201).json({ success: true, message: 'Produk berhasil dibuat', data });
    } catch (error) {
      console.error('ProductController.create error:', error);
      return res.status(500).json({ success: false, message: 'Gagal membuat produk', error: error.message });
    }
  },

  /**
   * PUT /api/products/:id
   * Body: { product_name, description?, category_id?, brand_id?, unit_id?, is_active }
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { product_name, description, category_id, brand_id, unit_id, is_active } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID produk tidak valid' });
      }

      if (!product_name || product_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });
      }

      const existing = await ProductModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Produk dengan ID ${id} tidak ditemukan` });
      }

      // Validasi referensi
      if (category_id) {
        const category = await CategoryModel.findById(category_id);
        if (!category) {
          return res.status(404).json({ success: false, message: `Kategori dengan ID ${category_id} tidak ditemukan` });
        }
      }

      if (brand_id) {
        const brand = await BrandModel.findById(brand_id);
        if (!brand) {
          return res.status(404).json({ success: false, message: `Brand dengan ID ${brand_id} tidak ditemukan` });
        }
      }

      if (unit_id) {
        const unit = await UnitModel.findById(unit_id);
        if (!unit) {
          return res.status(404).json({ success: false, message: `Satuan dengan ID ${unit_id} tidak ditemukan` });
        }
      }

      const data = await ProductModel.update(id, {
        product_name: product_name.trim(),
        description,
        category_id,
        brand_id,
        unit_id,
        is_active: is_active !== undefined ? is_active : existing.is_active,
      });

      return res.status(200).json({ success: true, message: 'Produk berhasil diperbarui', data });
    } catch (error) {
      console.error('ProductController.update error:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui produk', error: error.message });
    }
  },

  /**
   * DELETE /api/products/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID produk tidak valid' });
      }

      const data = await ProductModel.delete(id);

      if (!data) {
        return res.status(404).json({ success: false, message: `Produk dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Produk berhasil dihapus', data });
    } catch (error) {
      console.error('ProductController.delete error:', error);

      if (error.message.includes('memiliki') || error.message.includes('digunakan')) {
        return res.status(409).json({ success: false, message: error.message, error: 'CONSTRAINT_VIOLATION' });
      }

      return res.status(500).json({ success: false, message: 'Gagal menghapus produk', error: error.message });
    }
  },
};

module.exports = ProductController;
