
const pool = require('../config/db');

async function getAllCategories(ownerId) {
  const [rows] = await pool.query(
    `SELECT id, parent_id, category_name, is_active, owner_id
     FROM tm_category
     WHERE owner_id = ?
     ORDER BY id ASC`,
    [ownerId]
  );

  return rows;
}

// Digunakan oleh productController.js saat membuat produk.
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id, parent_id, category_name, is_active, owner_id
     FROM tm_category
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

// Mencari kategori yang dimiliki owner.
async function findAccessibleById(id, ownerId) {
  return findOwnedById(id, ownerId);
}

async function findOwnedById(id, ownerId) {
  const [rows] = await pool.query(
    `SELECT id, parent_id, category_name, is_active, owner_id
     FROM tm_category
     WHERE id = ? AND owner_id = ?
     LIMIT 1`,
    [id, ownerId]
  );

  return rows[0] || null;
}

// Mencari nama kategori duplikat milik owner yang sama.
// excludeId digunakan saat mengedit kategori.
async function findDuplicateName(categoryName, ownerId, excludeId = null) {
  const [rows] = await pool.query(
    `SELECT id, category_name
     FROM tm_category
     WHERE owner_id = ?
       AND LOWER(TRIM(category_name)) = LOWER(TRIM(?))
       AND (? IS NULL OR id <> ?)
     LIMIT 1`,
    [ownerId, categoryName, excludeId, excludeId]
  );

  return rows[0] || null;
}

async function createCategory({
  category_name,
  parent_id,
  owner_id,
}) {
  const [result] = await pool.query(
    `INSERT INTO tm_category
       (parent_id, category_name, owner_id)
     VALUES (?, ?, ?)`,
    [parent_id || null, category_name, owner_id]
  );

  return findOwnedById(result.insertId, owner_id);
}

async function updateCategory(
  id,
  ownerId,
  { category_name, parent_id, is_active }
) {
  await pool.query(
    `UPDATE tm_category
     SET category_name = ?,
         parent_id = ?,
         is_active = ?
     WHERE id = ? AND owner_id = ?`,
    [
      category_name,
      parent_id || null,
      is_active ?? 1,
      id,
      ownerId,
    ]
  );

  return findOwnedById(id, ownerId);
}

// Kategori tidak boleh dihapus jika masih digunakan produk.
async function deleteCategory(id, ownerId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [categoryRows] = await connection.query(
      `SELECT id, parent_id, category_name, is_active, owner_id
       FROM tm_category
       WHERE id = ? AND owner_id = ?
       FOR UPDATE`,
      [id, ownerId]
    );

    const category = categoryRows[0];

    if (!category) {
      await connection.rollback();
      return { category: null, productCount: 0 };
    }

    const [countRows] = await connection.query(
      `SELECT COUNT(*) AS total
       FROM tm_product
       WHERE category_id = ?`,
      [id]
    );

    const productCount = Number(countRows[0]?.total || 0);

    if (productCount > 0) {
      await connection.rollback();
      return { category, productCount };
    }

    await connection.query(
      `DELETE FROM tm_category
       WHERE id = ? AND owner_id = ?`,
      [id, ownerId]
    );

    await connection.commit();

    return { category, productCount: 0 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllCategories,
  findById,
  findAccessibleById,
  findOwnedById,
  findDuplicateName,
  createCategory,
  updateCategory,
  deleteCategory,
};
