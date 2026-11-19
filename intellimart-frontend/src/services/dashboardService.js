import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getData = async (url, params = {}) => {
  const response = await api.get(url, { params });

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || 'Gagal mengambil data Dashboard.'
    );
  }

  return response.data.data;
};

export const getDashboardSummary = (storeId = 1) =>
  getData('/dashboard/summary', { store_id: storeId });

export const getDashboardSalesTrend = (storeId = 1, fromDate, toDate) =>
  getData('/dashboard/sales-trend', {
    store_id: storeId,
    from_date: fromDate,
    to_date: toDate,
  });

export const getDashboardTopProducts = (storeId = 1, limit = 10) =>
  getData('/dashboard/top-products', {
    store_id: storeId,
    limit,
  });

export const getDashboardLowStock = (storeId = 1) =>
  getData('/dashboard/low-stock', {
    store_id: storeId,
  });

export const getDashboardRecentTransactions = (storeId = 1, limit = 10) =>
  getData('/dashboard/recent-transactions', {
    store_id: storeId,
    limit,
  });

export const getDashboardProfit = (storeId = 1, fromDate, toDate) =>
  getData('/dashboard/profit', {
    store_id: storeId,
    from_date: fromDate,
    to_date: toDate,
  });
