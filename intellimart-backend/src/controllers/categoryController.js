// src/controllers/categoryController.js
// Controller untuk modul Kategori Produk

const CategoryModel = require('../models/categoryModel');

const CategoryController = {

  /**
   * GET /api/categories
   * Ambil semua kategori
   */
  getAll: async (req, res) => {
    try {
      const data = await CategoryModel.findAll();
      return res.status(200).json({
        success: true,
        message: 'Data kategori berhasil diambil',
        count: data.length,
        data,
      });
    } catch (error) {
      console.error('CategoryController.getAll error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kategori',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/categories/:id
   * Ambil kategori berdasarkan ID
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID kategori tidak valid',
        });
      }

      const data = await CategoryModel.findById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: `Kategori dengan ID ${id} tidak ditemukan`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Data kategori berhasil diambil',
        data,
      });
    } catch (error) {
      console.error('CategoryController.getById error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kategori',
        error: error.message,
      });
    }
  },

  /**
   * POST /api/categories
   * Buat kategori baru
   * Body: { parent_id?, category_name, is_active? }
   */
  create: async (req, res) => {
    try {
      const { parent_id, category_name, is_active } = req.body;

      // Validasi field wajib
      if (!category_name || category_name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori wajib diisi',
        });
      }

      // Validasi parent_id jika diisi
      if (parent_id) {
        const parent = await CategoryModel.findById(parent_id);
        if (!parent) {
          return res.status(404).json({
            success: false,
            message: `Parent kategori dengan ID ${parent_id} tidak ditemukan`,
          });
        }
      }

      const data = await CategoryModel.create({
        parent_id: parent_id || null,
        category_name: category_name.trim(),
        is_active,
      });

      return res.status(201).json({
        success: true,
        message: 'Kategori berhasil dibuat',
        data,
      });
    } catch (error) {
      console.error('CategoryController.create error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membuat kategori',
        error: error.message,
      });
    }
  },

  /**
   * PUT /api/categories/:id
   * Update kategori berdasarkan ID
   * Body: { parent_id?, category_name, is_active }
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { parent_id, category_name, is_active } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID kategori tidak valid',
        });
      }

      // Validasi field wajib
      if (!category_name || category_name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori wajib diisi',
        });
      }

      // Cek apakah kategori yang di-update ada
      const existing = await CategoryModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Kategori dengan ID ${id} tidak ditemukan`,
        });
      }

      // Validasi: kategori tidak boleh menjadi parent dirinya sendiri
      if (parent_id && parseInt(parent_id) === parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Kategori tidak bisa menjadi parent dirinya sendiri',
        });
      }

      // Validasi parent_id jika diisi
      if (parent_id) {
        const parent = await CategoryModel.findById(parent_id);
        if (!parent) {
          return res.status(404).json({
            success: false,
            message: `Parent kategori dengan ID ${parent_id} tidak ditemukan`,
          });
        }
      }

      const data = await CategoryModel.update(id, {
        parent_id: parent_id || null,
        category_name: category_name.trim(),
        is_active: is_active !== undefined ? is_active : existing.is_active,
      });

      return res.status(200).json({
        success: true,
        message: 'Kategori berhasil diperbarui',
        data,
      });
    } catch (error) {
      console.error('CategoryController.update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui kategori',
        error: error.message,
      });
    }
  },

  /**
   * DELETE /api/categories/:id
   * Hapus kategori berdasarkan ID
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID kategori tidak valid',
        });
      }

      const data = await CategoryModel.delete(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: `Kategori dengan ID ${id} tidak ditemukan`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Kategori berhasil dihapus',
        data,
      });
    } catch (error) {
      console.error('CategoryController.delete error:', error);

      // Error dari model (kategori memiliki relasi)
      if (error.message.includes('memiliki') || error.message.includes('digunakan')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          error: 'CONSTRAINT_VIOLATION',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus kategori',
        error: error.message,
      });
    }
  },
};

module.exports = CategoryController;
