// src/controllers/productImageController.js
// Controller untuk modul Foto Produk

const ProductImageModel = require('../models/productImageModel');
const ProductModel = require('../models/productModel');

const ProductImageController = {

  /**
   * GET /api/product-images
   * GET /api/product-images?product_id=1
   */
  getAll: async (req, res) => {
    try {
      const { product_id } = req.query;
      const data = await ProductImageModel.findAll(product_id);

      return res.status(200).json({
        success: true,
        message: 'Data foto produk berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('ProductImageController.getAll error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data foto produk', error: error.message });
    }
  },

  /**
   * GET /api/product-images/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID foto produk tidak valid' });
      }

      const data = await ProductImageModel.findById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: `Foto produk dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Data foto produk berhasil diambil', data });
    } catch (error) {
      console.error('ProductImageController.getById error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data foto produk', error: error.message });
    }
  },

  /**
   * POST /api/product-images
   *
   * Satu produk cuma boleh punya SATU foto utama (is_primary). Beda dari satuan dasar,
   * gambar tidak punya histori bisnis yang bisa "salah tafsir", jadi otomatis switch
   * TANPA pengaman tambahan -- yang baru langsung jadi utama, yang lama otomatis bukan lagi.
   */
  create: async (req, res) => {
    try {
      const { product_id, image_url, is_primary } = req.body;

      if (!product_id) {
        return res.status(400).json({ success: false, message: 'product_id wajib diisi' });
      }
      if (!image_url || image_url.trim() === '') {
        return res.status(400).json({ success: false, message: 'image_url wajib diisi' });
      }

      const product = await ProductModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Produk dengan ID ${product_id} tidak ditemukan` });
      }

      const data = await ProductImageModel.create({ product_id, image_url: image_url.trim(), is_primary });

      if (is_primary) {
        await ProductImageModel.unsetOtherPrimary(product_id, data.id);
      }

      return res.status(201).json({ success: true, message: 'Foto produk berhasil ditambahkan', data });
    } catch (error) {
      console.error('ProductImageController.create error:', error);
      return res.status(500).json({ success: false, message: 'Gagal menambahkan foto produk', error: error.message });
    }
  },

  /**
   * PUT /api/product-images/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { image_url, is_primary } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID foto produk tidak valid' });
      }

      const existing = await ProductImageModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Foto produk dengan ID ${id} tidak ditemukan` });
      }

      const finalImageUrl = image_url !== undefined ? image_url : existing.image_url;
      const finalIsPrimary = is_primary !== undefined ? is_primary : !!existing.is_primary;

      if (!finalImageUrl || finalImageUrl.trim() === '') {
        return res.status(400).json({ success: false, message: 'image_url tidak boleh kosong' });
      }

      const data = await ProductImageModel.update(id, { image_url: finalImageUrl.trim(), is_primary: finalIsPrimary });

      if (finalIsPrimary) {
        await ProductImageModel.unsetOtherPrimary(existing.product_id, id);
      }

      return res.status(200).json({ success: true, message: 'Foto produk berhasil diperbarui', data });
    } catch (error) {
      console.error('ProductImageController.update error:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui foto produk', error: error.message });
    }
  },

  /**
   * DELETE /api/product-images/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID foto produk tidak valid' });
      }

      const data = await ProductImageModel.delete(id);
      if (!data) {
        return res.status(404).json({ success: false, message: `Foto produk dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Foto produk berhasil dihapus', data });
    } catch (error) {
      console.error('ProductImageController.delete error:', error);
      return res.status(500).json({ success: false, message: 'Gagal menghapus foto produk', error: error.message });
    }
  }

};

module.exports = ProductImageController;
