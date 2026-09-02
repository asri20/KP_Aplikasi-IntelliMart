const unitModel = require('../models/unitModel');

async function listUnits(req, res, next) {
  try {
    const units = await unitModel.getAllUnits();
    res.json({ success: true, data: units });
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

module.exports = { listUnits, addUnit };