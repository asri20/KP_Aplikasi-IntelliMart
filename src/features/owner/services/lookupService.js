import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

/** Ambil daftar {id, name} dari endpoint master (kategori/brand/satuan). */
const fetchOptions = async (url, nameKey) => {
  const { data } = await axiosClient.get(url, { params: { limit: 100 } });
  const rows = Array.isArray(data.data) ? data.data : [];
  return rows.map((r) => ({ id: r.id, name: r[nameKey] ?? r.name }));
};

export const getCategories = () => fetchOptions(ENDPOINTS.CATEGORY.LIST, 'category_name');
export const getBrands = () => fetchOptions(ENDPOINTS.BRAND.LIST, 'brand_name');
export const getUnits = () => fetchOptions(ENDPOINTS.UNIT.LIST, 'unit_name');