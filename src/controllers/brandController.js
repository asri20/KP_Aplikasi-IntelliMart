const BrandModel = require('../models/brandModel');

const BrandController = {
  /**
   * GET /api/brands
   */
  getAll: async (req, res) => {
    try {
      const data = await BrandModel.getAllBrands();

      return res.status(200).json({
        success: true,
        message: 'Data brand berhasil diambil',
        count: data.length,
        data,
      });
    } catch (error) {
      console.error('BrandController.getAll error:', error);

      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data brand',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/brands/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID brand tidak valid',
        });
      }

      const data = await BrandModel.findById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: `Brand dengan ID ${id} tidak ditemukan`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Data brand berhasil diambil',
        data,
      });
    } catch (error) {
      console.error('BrandController.getById error:', error);

      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data brand',
        error: error.message,
      });
    }
  },

  /**
   * POST /api/brands
   * Body: { brand_name }
   */
  create: async (req, res) => {
    try {
      const { brand_name } = req.body;

      if (!brand_name || brand_name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nama brand wajib diisi',
        });
      }

      const data = await BrandModel.createBrand({
        brand_name: brand_name.trim(),
      });

      return res.status(201).json({
        success: true,
        message: 'Brand berhasil dibuat',
        data,
      });
    } catch (error) {
      console.error('BrandController.create error:', error);

      return res.status(500).json({
        success: false,
        message: 'Gagal membuat brand',
        error: error.message,
      });
    }
  },

  /**
   * PUT /api/brands/:id
   * Body: { brand_name, is_active }
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { brand_name, is_active } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID brand tidak valid',
        });
      }

      if (!brand_name || brand_name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nama brand wajib diisi',
        });
      }

      const existing = await BrandModel.findById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Brand dengan ID ${id} tidak ditemukan`,
        });
      }

      const data = await BrandModel.updateBrand(id, {
        brand_name: brand_name.trim(),
        is_active:
          is_active !== undefined
            ? is_active
            : existing.is_active,
      });

      return res.status(200).json({
        success: true,
        message: 'Brand berhasil diperbarui',
        data,
      });
    } catch (error) {
      console.error('BrandController.update error:', error);

      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui brand',
        error: error.message,
      });
    }
  },

  /**
   * DELETE /api/brands/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID brand tidak valid',
        });
      }

      const data = await BrandModel.delete(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: `Brand dengan ID ${id} tidak ditemukan`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Brand berhasil dihapus',
        data,
      });
    } catch (error) {
      console.error('BrandController.delete error:', error);

      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus brand',
        error: error.message,
      });
    }
  },
};

module.exports = BrandController;