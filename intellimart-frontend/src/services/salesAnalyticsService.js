import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getData = async (url) => {
  const response = await api.get(url);

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || 'Gagal mengambil data dari server'
    );
  }

  return response.data.data;
};

export const getCustomerAnalytics = () => getData('/sales-analytics/customers');

export const getBestSellingProducts = () =>
  getData('/sales-analytics/best-selling-products');

export const getUpsellingRecommendations = (variantId, storeId = 1) =>
  getData(
    `/recommendations/upsell?variant_id=${variantId}&store_id=${storeId}`
  );

export const getCrossSellingRecommendations = (limit = 10) =>
  getData(`/recommendations/cross-sell?limit=${limit}`);
