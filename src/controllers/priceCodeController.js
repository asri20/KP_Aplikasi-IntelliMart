// src/controllers/priceCodeController.js
// Controller untuk modul Kode Harga

const PriceCodeModel = require('../models/priceCodeModel');

const PriceCodeController = {

  /**
   * GET /api/price-codes
   */
  getAll: async (req, res) => {
    try {
      const data = await PriceCodeModel.findAll();
      return res.status(200).json({
        success: true,
        message: 'Data kode harga berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('PriceCodeController.getAll error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data kode harga', error: error.message });
    }
  },

  /**
   * GET /api/price-codes/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID kode harga tidak valid' });
      }

      const data = await PriceCodeModel.findById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: `Kode harga dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Data kode harga berhasil diambil', data });
    } catch (error) {
      console.error('PriceCodeController.getById error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data kode harga', error: error.message });
    }
  },

  /**
   * POST /api/price-codes
   */
  create: async (req, res) => {
    try {
      const { code, description, is_active } = req.body;

      if (!code || code.trim() === '') {
        return res.status(400).json({ success: false, message: 'code wajib diisi' });
      }

      const data = await PriceCodeModel.create({ code: code.trim(), description, is_active });
      return res.status(201).json({ success: true, message: 'Kode harga berhasil dibuat', data });
    } catch (error) {
      console.error('PriceCodeController.create error:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: `Kode harga '${req.body.code}' sudah dipakai, gunakan kode lain`,
          error: 'DUPLICATE_ENTRY'
        });
      }

      return res.status(500).json({ success: false, message: 'Gagal membuat kode harga', error: error.message });
    }
  },

  /**
   * PATCH /api/price-codes/:id/deactivate
   * "Matikan" kode harga tanpa menghapusnya (sesuai aturan tim: jangan DELETE tm_price_code)
   */
  deactivate: async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID kode harga tidak valid' });
      }

      const data = await PriceCodeModel.setActive(id, false);
      if (!data) {
        return res.status(404).json({ success: false, message: `Kode harga dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Kode harga berhasil dinonaktifkan', data });
    } catch (error) {
      console.error('PriceCodeController.deactivate error:', error);
      return res.status(500).json({ success: false, message: 'Gagal menonaktifkan kode harga', error: error.message });
    }
  },

  /**
   * PATCH /api/price-codes/:id/activate
   */
  activate: async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID kode harga tidak valid' });
      }

      const data = await PriceCodeModel.setActive(id, true);
      if (!data) {
        return res.status(404).json({ success: false, message: `Kode harga dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Kode harga berhasil diaktifkan', data });
    } catch (error) {
      console.error('PriceCodeController.activate error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengaktifkan kode harga', error: error.message });
    }
  }

};

module.exports = PriceCodeController;
