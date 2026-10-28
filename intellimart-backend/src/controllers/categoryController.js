
const categoryModel = require('../models/categoryModel');

function getOwnerId(req) {
  const ownerId = Number(req.user?.id);
  return Number.isSafeInteger(ownerId) && ownerId > 0
    ? ownerId
    : null;
}

function parseCategoryId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function listCategories(req, res, next) {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: 'Identitas Owner tidak valid.',
      });
    }

    const categories = await categoryModel.getAllCategories(ownerId);

    return res.json({ success: true, data: categories });
  } catch (err) {
    return next(err);
  }
}

async function getCategory(req, res, next) {
  try {
    const ownerId = getOwnerId(req);
    const id = parseCategoryId(req.params.id);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: 'Identitas Owner tidak valid.',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID kategori tidak valid.',
      });
    }

    const category = await categoryModel.findOwnedById(id, ownerId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan atau bukan milik Owner ini.',
      });
    }

    return res.json({ success: true, data: category });
  } catch (err) {
    return next(err);
  }
}

async function addCategory(req, res, next) {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: 'Identitas Owner tidak valid.',
      });
    }

    const category_name =
      typeof req.body.category_name === 'string'
        ? req.body.category_name.trim()
        : '';

    const parent_id = req.body.parent_id ?? null;

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi.',
      });
    }

    if (category_name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori maksimal 100 karakter.',
      });
    }

    const duplicate = await categoryModel.findDuplicateName(
      category_name,
      ownerId
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        code: 'CATEGORY_NAME_EXISTS',
        message: 'Nama kategori sudah digunakan oleh Owner ini.',
      });
    }

    let normalizedParentId = null;

    if (parent_id !== null) {
      normalizedParentId = parseCategoryId(parent_id);

      if (
        !normalizedParentId ||
        !(await categoryModel.findOwnedById(normalizedParentId, ownerId))
      ) {
        return res.status(400).json({
          success: false,
          message: 'Kategori induk tidak valid.',
        });
      }
    }

    const data = await categoryModel.createCategory({
      category_name,
      parent_id: normalizedParentId,
      owner_id: ownerId,
    });

    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function editCategory(req, res, next) {
  try {
    const ownerId = getOwnerId(req);
    const id = parseCategoryId(req.params.id);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: 'Identitas Owner tidak valid.',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID kategori tidak valid.',
      });
    }

    const existing = await categoryModel.findOwnedById(id, ownerId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan atau bukan milik Owner ini.',
      });
    }

    const category_name =
      typeof req.body.category_name === 'string'
        ? req.body.category_name.trim()
        : '';

    const parent_id = req.body.parent_id ?? null;

    let is_active = req.body.is_active ?? existing.is_active;

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi.',
      });
    }

    if (category_name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori maksimal 100 karakter.',
      });
    }

    if (![0, 1, true, false, '0', '1'].includes(is_active)) {
      return res.status(400).json({
        success: false,
        message: 'is_active harus bernilai 0 atau 1.',
      });
    }

    is_active = [1, true, '1'].includes(is_active) ? 1 : 0;

    const duplicate = await categoryModel.findDuplicateName(
      category_name,
      ownerId,
      id
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        code: 'CATEGORY_NAME_EXISTS',
        message: 'Nama kategori sudah digunakan oleh kategori lain milik Owner ini.',
      });
    }

    let normalizedParentId = null;

    if (parent_id !== null) {
      normalizedParentId = parseCategoryId(parent_id);

      if (
        !normalizedParentId ||
        normalizedParentId === id ||
        !(await categoryModel.findOwnedById(normalizedParentId, ownerId))
      ) {
        return res.status(400).json({
          success: false,
          message: 'Kategori induk tidak valid.',
        });
      }
    }

    const data = await categoryModel.updateCategory(id, ownerId, {
      category_name,
      parent_id: normalizedParentId,
      is_active,
    });

    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function removeCategory(req, res, next) {
  try {
    const ownerId = getOwnerId(req);
    const id = parseCategoryId(req.params.id);

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: 'Identitas Owner tidak valid.',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID kategori tidak valid.',
      });
    }

    const result = await categoryModel.deleteCategory(id, ownerId);

    if (!result.category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan atau bukan milik Owner ini.',
      });
    }

    if (result.productCount > 0) {
      return res.status(409).json({
        success: false,
        code: 'CATEGORY_IN_USE',
        message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${result.productCount} produk. Ubah kategori produk tersebut terlebih dahulu.`,
        data: {
          category_id: id,
          product_count: result.productCount,
        },
      });
    }

    return res.json({
      success: true,
      message: 'Kategori berhasil dihapus.',
      data: result.category,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listCategories,
  getCategory,
  addCategory,
  editCategory,
  removeCategory,
};
