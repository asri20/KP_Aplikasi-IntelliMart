import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

const unwrap = (res) => res?.data?.data ?? [];

export async function getDashboardStores() {
  const res = await axiosClient.get(ENDPOINTS.DASHBOARD.STORES);
  return unwrap(res);
}

export async function getDashboardSummary(storeId) {
  if (!storeId) return null;
  const res = await axiosClient.get(ENDPOINTS.DASHBOARD.SUMMARY(storeId));
  return res?.data?.data ?? null;
}

export async function getLowStock(storeId) {
  if (!storeId) return [];
  const res = await axiosClient.get(ENDPOINTS.DASHBOARD.LOW_STOCK(storeId));
  return unwrap(res);
}

export async function getRecentTransactions(storeId, limit = 5) {
  if (!storeId) return [];
  const res = await axiosClient.get(ENDPOINTS.DASHBOARD.RECENT_TRANSACTIONS(storeId, limit));
  return unwrap(res);
}

export async function getTopProducts(storeId, limit = 5) {
  if (!storeId) return [];
  const res = await axiosClient.get(ENDPOINTS.ANALYTICS.TOP_PRODUCTS(storeId, limit));
  return unwrap(res);
}

export async function getSalesTrend(storeId, days = 7) {
  if (!storeId) return [];
  const res = await axiosClient.get(ENDPOINTS.ANALYTICS.SALES_TREND(storeId, days));
  return unwrap(res);
}

export async function getProductCatalog(storeId, search = '') {
  if (!storeId) return [];
  const res = await axiosClient.get(ENDPOINTS.ANALYTICS.PRODUCT_CATALOG(storeId, search));
  return unwrap(res);
}

