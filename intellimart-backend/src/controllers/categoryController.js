const categoryModel = require('../models/categoryModel');

async function listCategories(req, res, next) {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function addCategory(req, res, next) {
  try {
    const { category_name, parent_id } = req.body;
    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'category_name wajib diisi' });
    }
    const newCategory = await categoryModel.createCategory({ category_name, parent_id });
    res.status(201).json({ success: true, data: newCategory });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, addCategory };