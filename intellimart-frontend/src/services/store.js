import { apiRequest } from "./api";

function normalizeStore(store) {
  return {
    id: store.id,
    name: store.store_name,
    address: store.location || "-",
    phone: store.phone || "-",
    email: store.email || "-",
    manager: store.manager_name || "Not Assigned",
    managerId: store.manager_id,
    active: Boolean(Number(store.is_active)),
  };
}

export async function getStores() {
  const data = await apiRequest("/stores");
  return (data.data || []).map(normalizeStore);
}

export async function addStore({ name, address, phone }) {
  const data = await apiRequest("/stores", {
    method: "POST",
    body: JSON.stringify({
      store_name: name.trim(),
      location: address.trim(),
      phone: phone.trim() || null,
    }),
  });

  return normalizeStore(data.data);
}
