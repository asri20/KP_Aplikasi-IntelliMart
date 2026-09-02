const brandModel = require('../models/brandModel');

async function listBrands(req, res) {
  try {
    const brands = await brandModel.getAllBrands();
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function addBrand(req, res) {
  try {
    const { brand_name } = req.body;
    if (!brand_name || brand_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'brand_name wajib diisi' });
    }
    const newBrand = await brandModel.createBrand({ brand_name });
    res.status(201).json({ success: true, data: newBrand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listBrands, addBrand };