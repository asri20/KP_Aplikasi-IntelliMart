const categoryModel = require('../models/categoryModel');

async function listCategories(req, res, next) {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function getCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: `Kategori dengan ID ${id} tidak ditemukan` });
    }
    res.json({ success: true, data: category });
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

    if (parent_id) {
      const parent = await categoryModel.findById(parent_id);
      if (!parent) {
        return res.status(404).json({ success: false, message: `Kategori induk dengan ID ${parent_id} tidak ditemukan` });
      }
    }

    const newCategory = await categoryModel.createCategory({ category_name, parent_id });
    res.status(201).json({ success: true, data: newCategory });
  } catch (err) {
    next(err);
  }
}

async function editCategory(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await categoryModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Kategori dengan ID ${id} tidak ditemukan` });
    }

    const { category_name, parent_id, is_active } = req.body;
    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'category_name wajib diisi' });
    }

    if (parent_id) {
      if (Number(parent_id) === Number(id)) {
        return res.status(400).json({ success: false, message: 'Kategori tidak boleh menjadi induk dari dirinya sendiri' });
      }
      const parent = await categoryModel.findById(parent_id);
      if (!parent) {
        return res.status(404).json({ success: false, message: `Kategori induk dengan ID ${parent_id} tidak ditemukan` });
      }
    }

    const updated = await categoryModel.updateCategory(id, {
      category_name,
      parent_id,
      is_active: is_active !== undefined ? is_active : existing.is_active
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

async function removeCategory(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await categoryModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Kategori dengan ID ${id} tidak ditemukan` });
    }
    res.json({ success: true, message: 'Kategori berhasil dihapus', data: deleted });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, getCategory, addCategory, editCategory, removeCategory };