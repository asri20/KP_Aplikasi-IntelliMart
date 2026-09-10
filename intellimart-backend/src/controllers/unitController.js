const unitModel = require('../models/unitModel');
const unitModel = require('../models/unitModel');

async function listUnits(req, res, next) {
  try {
    const units = await unitModel.getAllUnits();
    res.json({ success: true, data: units });
  } catch (err) {
    next(err);
  }
}

async function getUnit(req, res, next) {
  try {
    const { id } = req.params;
    const unit = await unitModel.findById(id);
    if (!unit) {
      return res.status(404).json({ success: false, message: `Satuan dengan ID ${id} tidak ditemukan` });
    }
    res.json({ success: true, data: unit });
  } catch (err) {
    next(err);
  }
}

async function addUnit(req, res, next) {
  try {
    const { unit_name } = req.body;
    if (!unit_name || unit_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'unit_name wajib diisi' });
    }
    const newUnit = await unitModel.createUnit({ unit_name });
    res.status(201).json({ success: true, data: newUnit });
  } catch (err) {
    next(err);
  }
}

async function editUnit(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await unitModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Satuan dengan ID ${id} tidak ditemukan` });
    }

    const { unit_name, is_active } = req.body;
    if (!unit_name || unit_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'unit_name wajib diisi' });
    }

    const updated = await unitModel.updateUnit(id, {
      unit_name,
      is_active: is_active !== undefined ? is_active : existing.is_active
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

async function removeUnit(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await unitModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Satuan dengan ID ${id} tidak ditemukan` });
    }
    res.json({ success: true, message: 'Satuan berhasil dihapus', data: deleted });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUnits, getUnit, addUnit, editUnit, removeUnit };