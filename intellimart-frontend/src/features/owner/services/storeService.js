import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

/** Bentuk DB (snake_case) -> bentuk UI */
const mapStore = (s) => ({
  id: s.id,
  name: s.store_name,
  location: s.location,
  phone: s.phone ?? '',
  managerId: s.manager_id ?? null,
  manager: s.manager_name ?? null,
  isActive: Number(s.is_active) === 1,
  totalProduk: Number(s.total_products ?? 0),
  totalTransaksi: Number(s.total_transactions ?? 0),
});

export async function getStores() {
  const { data } = await axiosClient.get(ENDPOINTS.STORES.LIST);
  return data.data.map(mapStore);
}

export async function createStore({ name, location, phone }) {
  const { data } = await axiosClient.post(ENDPOINTS.STORES.CREATE, {
    store_name: name,
    location,
    phone: phone || null,
  });
  return data.data;
}

export async function assignManager({ storeId, managerId }) {
  const { data } = await axiosClient.put(ENDPOINTS.STORES.ASSIGN_MANAGER, {
    store_id: storeId,
    manager_id: managerId,
  });
  return data;
}
