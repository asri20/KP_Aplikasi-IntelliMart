// src/controllers/tierPriceController.js
// Controller untuk modul Harga Tier/Grosir

const TierPriceModel = require('../models/tierPriceModel');
const PriceCodeModel = require('../models/priceCodeModel');

function validateQtyRange(min_qty, max_qty) {
  if (min_qty === undefined || min_qty === null || max_qty === undefined || max_qty === null) {
    return 'min_qty dan max_qty wajib diisi';
  }
  if (isNaN(min_qty) || isNaN(max_qty)) {
    return 'min_qty dan max_qty harus berupa angka';
  }
  if (Number(min_qty) < 1) {
    return 'min_qty minimal 1';
  }
  if (Number(min_qty) > Number(max_qty)) {
    return 'min_qty tidak boleh lebih besar dari max_qty';
  }
  return null;
}

const TierPriceController = {

  /**
   * GET /api/tier-prices
   * GET /api/tier-prices?price_code_id=1
   */
  getAll: async (req, res) => {
    try {
      const { price_code_id } = req.query;
      const data = await TierPriceModel.findAll(price_code_id);

      return res.status(200).json({
        success: true,
        message: 'Data harga tier berhasil diambil',
        count: data.length,
        data
      });
    } catch (error) {
      console.error('TierPriceController.getAll error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data harga tier', error: error.message });
    }
  },

  /**
   * GET /api/tier-prices/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID harga tier tidak valid' });
      }

      const data = await TierPriceModel.findById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: `Harga tier dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Data harga tier berhasil diambil', data });
    } catch (error) {
      console.error('TierPriceController.getById error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data harga tier', error: error.message });
    }
  },

  /**
   * POST /api/tier-prices
   */
  create: async (req, res) => {
    try {
      const { price_code_id, min_qty, max_qty, unit_price } = req.body;

      if (!price_code_id) {
        return res.status(400).json({ success: false, message: 'price_code_id wajib diisi' });
      }

      const qtyError = validateQtyRange(min_qty, max_qty);
      if (qtyError) {
        return res.status(400).json({ success: false, message: qtyError });
      }

      if (unit_price === undefined || unit_price === null || isNaN(unit_price) || Number(unit_price) < 0) {
        return res.status(400).json({ success: false, message: 'unit_price wajib diisi dan tidak boleh negatif' });
      }

      const priceCode = await PriceCodeModel.findById(price_code_id);
      if (!priceCode) {
        return res.status(404).json({ success: false, message: `Kode harga dengan ID ${price_code_id} tidak ditemukan` });
      }

      const overlaps = await TierPriceModel.findOverlapping(price_code_id, min_qty, max_qty);
      if (overlaps.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Range qty ${min_qty}-${max_qty} tumpang tindih dengan tier yang sudah ada (qty ${overlaps[0].min_qty}-${overlaps[0].max_qty})`,
          error: 'RANGE_OVERLAP',
          conflicting_tier: overlaps[0]
        });
      }

      const data = await TierPriceModel.create({ price_code_id, min_qty, max_qty, unit_price });
      return res.status(201).json({ success: true, message: 'Harga tier berhasil dibuat', data });
    } catch (error) {
      console.error('TierPriceController.create error:', error);
      return res.status(500).json({ success: false, message: 'Gagal membuat harga tier', error: error.message });
    }
  },

  /**
   * PUT /api/tier-prices/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { min_qty, max_qty, unit_price } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID harga tier tidak valid' });
      }

      const existing = await TierPriceModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Harga tier dengan ID ${id} tidak ditemukan` });
      }

      const qtyError = validateQtyRange(min_qty, max_qty);
      if (qtyError) {
        return res.status(400).json({ success: false, message: qtyError });
      }

      if (unit_price === undefined || unit_price === null || isNaN(unit_price) || Number(unit_price) < 0) {
        return res.status(400).json({ success: false, message: 'unit_price wajib diisi dan tidak boleh negatif' });
      }

      // excludeId = id sendiri, supaya tidak dianggap tumpang tindih dgn dirinya sendiri
      const overlaps = await TierPriceModel.findOverlapping(existing.price_code_id, min_qty, max_qty, id);
      if (overlaps.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Range qty ${min_qty}-${max_qty} tumpang tindih dengan tier lain (qty ${overlaps[0].min_qty}-${overlaps[0].max_qty})`,
          error: 'RANGE_OVERLAP',
          conflicting_tier: overlaps[0]
        });
      }

      const data = await TierPriceModel.update(id, { min_qty, max_qty, unit_price });
      return res.status(200).json({ success: true, message: 'Harga tier berhasil diperbarui', data });
    } catch (error) {
      console.error('TierPriceController.update error:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui harga tier', error: error.message });
    }
  },

  /**
   * DELETE /api/tier-prices/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID harga tier tidak valid' });
      }

      const data = await TierPriceModel.delete(id);
      if (!data) {
        return res.status(404).json({ success: false, message: `Harga tier dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Harga tier berhasil dihapus', data });
    } catch (error) {
      console.error('TierPriceController.delete error:', error);
      return res.status(500).json({ success: false, message: 'Gagal menghapus harga tier', error: error.message });
    }
  }

};

module.exports = TierPriceController;
