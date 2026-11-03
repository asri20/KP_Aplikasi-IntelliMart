
import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

const getResponseData = (response) => {
  const body = response.data;

  if (body?.success === false) {
    throw new Error(body.message || 'Permintaan gagal.');
  }

  return body?.data ?? body;
};

export async function getInventoryStores() {
  const response = await axiosClient.get(ENDPOINTS.STORES.LIST);
  const data = getResponseData(response);

  return Array.isArray(data) ? data : [];
}

export async function getInventoryVariants() {
  const response = await axiosClient.get(ENDPOINTS.VARIANT.LIST);
  const data = getResponseData(response);

  return Array.isArray(data) ? data : [];
}

export async function getInventoryStocks(params = {}) {
  const response = await axiosClient.get(ENDPOINTS.STOCK.LIST, {
    params,
  });

  const data = getResponseData(response);

  return Array.isArray(data) ? data : [];
}

export async function getInventoryMovements(params = {}) {
  const response = await axiosClient.get(ENDPOINTS.STOCK_MOVEMENT.LIST, {
    params,
  });

  const data = getResponseData(response);

  return Array.isArray(data) ? data : [];
}

export async function createInventoryMovement(payload) {
  const response = await axiosClient.post(
    ENDPOINTS.STOCK_MOVEMENT.CREATE,
    payload
  );

  return getResponseData(response);
}
