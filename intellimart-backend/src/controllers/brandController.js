const brandModel = require('../models/brandModel');

async function listBrands(req, res, next) {
  try {
    const brands = await brandModel.getAllBrands();
    res.json({ success: true, data: brands });
  } catch (err) {
    next(err);
  }
}

async function getBrand(req, res, next) {
  try {
    const { id } = req.params;
    const brand = await brandModel.findById(id);
    if (!brand) {
      return res.status(404).json({ success: false, message: `Brand dengan ID ${id} tidak ditemukan` });
    }
    res.json({ success: true, data: brand });
  } catch (err) {
    next(err);
  }
}

async function addBrand(req, res, next) {
  try {
    const { brand_name } = req.body;
    if (!brand_name || brand_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'brand_name wajib diisi' });
    }
    const newBrand = await brandModel.createBrand({ brand_name });
    res.status(201).json({ success: true, data: newBrand });
  } catch (err) {
    next(err);
  }
}

async function editBrand(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await brandModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Brand dengan ID ${id} tidak ditemukan` });
    }

    const { brand_name, is_active } = req.body;
    if (!brand_name || brand_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'brand_name wajib diisi' });
    }

    const updated = await brandModel.updateBrand(id, {
      brand_name,
      is_active: is_active !== undefined ? is_active : existing.is_active
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

async function removeBrand(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await brandModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Brand dengan ID ${id} tidak ditemukan` });
    }
    res.json({ success: true, message: 'Brand berhasil dihapus', data: deleted });
  } catch (err) {
    next(err);
  }
}

module.exports = { listBrands, getBrand, addBrand, editBrand, removeBrand };