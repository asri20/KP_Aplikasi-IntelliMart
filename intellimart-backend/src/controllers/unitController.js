// src/controllers/unitController.js
// Controller untuk modul Satuan Produk

const UnitModel = require('../models/unitModel');

const UnitController = {

  /**
   * GET /api/units
   */
  getAll: async (req, res) => {
    try {
      const data = await UnitModel.findAll();
      return res.status(200).json({
        success: true,
        message: 'Data satuan berhasil diambil',
        count: data.length,
        data,
      });
    } catch (error) {
      console.error('UnitController.getAll error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data satuan', error: error.message });
    }
  },

  /**
   * GET /api/units/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID satuan tidak valid' });
      }

      const data = await UnitModel.findById(id);

      if (!data) {
        return res.status(404).json({ success: false, message: `Satuan dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Data satuan berhasil diambil', data });
    } catch (error) {
      console.error('UnitController.getById error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data satuan', error: error.message });
    }
  },

  /**
   * POST /api/units
   * Body: { unit_name, is_active? }
   */
  create: async (req, res) => {
    try {
      const { unit_name, is_active } = req.body;

      if (!unit_name || unit_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nama satuan wajib diisi' });
      }

      // Cek duplikat
      const existing = await UnitModel.findByName(unit_name);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Satuan dengan nama '${unit_name}' sudah ada`,
        });
      }

      const data = await UnitModel.create({ unit_name: unit_name.trim(), is_active });

      return res.status(201).json({ success: true, message: 'Satuan berhasil dibuat', data });
    } catch (error) {
      console.error('UnitController.create error:', error);
      return res.status(500).json({ success: false, message: 'Gagal membuat satuan', error: error.message });
    }
  },

  /**
   * PUT /api/units/:id
   * Body: { unit_name, is_active }
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { unit_name, is_active } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID satuan tidak valid' });
      }

      if (!unit_name || unit_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nama satuan wajib diisi' });
      }

      const existing = await UnitModel.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: `Satuan dengan ID ${id} tidak ditemukan` });
      }

      // Cek duplikat (kecuali dirinya sendiri)
      const duplicate = await UnitModel.findByName(unit_name, id);
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Satuan dengan nama '${unit_name}' sudah ada`,
        });
      }

      const data = await UnitModel.update(id, {
        unit_name: unit_name.trim(),
        is_active: is_active !== undefined ? is_active : existing.is_active,
      });

      return res.status(200).json({ success: true, message: 'Satuan berhasil diperbarui', data });
    } catch (error) {
      console.error('UnitController.update error:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui satuan', error: error.message });
    }
  },

  /**
   * DELETE /api/units/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID satuan tidak valid' });
      }

      const data = await UnitModel.delete(id);

      if (!data) {
        return res.status(404).json({ success: false, message: `Satuan dengan ID ${id} tidak ditemukan` });
      }

      return res.status(200).json({ success: true, message: 'Satuan berhasil dihapus', data });
    } catch (error) {
      console.error('UnitController.delete error:', error);

      if (error.message.includes('digunakan')) {
        return res.status(409).json({ success: false, message: error.message, error: 'CONSTRAINT_VIOLATION' });
      }

      return res.status(500).json({ success: false, message: 'Gagal menghapus satuan', error: error.message });
    }
  },
};

module.exports = UnitController;
