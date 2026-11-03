
import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

/**
 * Mengubah data DB (snake_case) menjadi bentuk UI.
 */
const mapProduct = (p) => ({
  id: p.id,
  name: p.product_name,
  description: p.description ?? '',
  categoryId: p.category_id ?? null,
  brandId: p.brand_id ?? null,
  unitId: p.unit_id ?? null,
  category: p.category_name ?? null,
  brand: p.brand_name ?? null,
  unit: p.unit_name ?? null,
  isActive: Number(p.is_active) === 1,
  ownerId: p.owner_id ?? null,
  emoji: '📦',
  sku: null,
  buyPrice: null,
  sellPrice: null,
  stock: null,
});

/**
 * GET: mengambil daftar produk.
 */
export async function getProducts(params = {}) {
  const { data } = await axiosClient.get(ENDPOINTS.PRODUCT.LIST, {
    params: { limit: 100, ...params },
  });

  return (data.data ?? []).map(mapProduct);
}

/**
 * CREATE: membuat produk baru.
 */
export async function createProduct({
  name,
  description,
  categoryId,
  brandId,
  unitId,
  isActive,
}) {
  const { data } = await axiosClient.post(ENDPOINTS.PRODUCT.CREATE, {
    product_name: name.trim(),
    description: description?.trim() || null,
    category_id: categoryId ? Number(categoryId) : null,
    brand_id: brandId ? Number(brandId) : null,
    unit_id: unitId ? Number(unitId) : null,
    is_active: isActive ? 1 : 0,
  });

  return data.data;
}

/**
 * UPDATE: memperbarui produk.
 */
export async function updateProduct({
  id,
  name,
  description,
  categoryId,
  brandId,
  unitId,
  isActive,
}) {
  if (id == null || id === '') {
    throw new Error('ID produk tidak ditemukan.');
  }

  const { data } = await axiosClient.put(
    ENDPOINTS.PRODUCT.UPDATE(id),
    {
      product_name: name.trim(),
      description: description?.trim() || null,
      category_id: categoryId ? Number(categoryId) : null,
      brand_id: brandId ? Number(brandId) : null,
      unit_id: unitId ? Number(unitId) : null,
      is_active: isActive ? 1 : 0,
    }
  );

  return data.data;
}

/**
 * DELETE: menghapus produk berdasarkan ID.
 */
export async function deleteProduct(id) {
  if (id == null || id === '') {
    throw new Error('ID produk tidak ditemukan.');
  }

  const { data } = await axiosClient.delete(
    ENDPOINTS.PRODUCT.DELETE(id)
  );

  return data;
}
