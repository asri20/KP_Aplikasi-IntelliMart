import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductStocks = async (storeId = 1) => {
  const response = await api.get('/stocks', {
    params: { store_id: storeId },
  });

  return response.data;
};

export const getPaymentMethods = async () => {
  const response = await api.get('/transactions/payment-methods');
  return response.data;
};

export const getPOSCustomers = async (saleType) => {
  const response = await api.get('/transactions/customers', {
    params: {
      sale_type: saleType,
    },
  });

  return response.data;
};

/**
 * @param {Record<string, any>} payload
 */

export const checkoutTransaction = async (payload) => {
  const response = await api.post('/transactions/checkout', payload);
  return response.data;
};

export const getTransactionHistory = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

/**
 * @param {string | number} transactionId
 */
export const getTransactionDetail = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data;
};
