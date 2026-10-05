import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Mengambil data produk
 */
export const getProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
    throw error;
  }
};

/**
 * Mengambil data stok produk berdasarkan toko
 */
export const getProductStocks = async (storeId = 1) => {
  try {
    const response = await api.get('/stocks', {
      params: {
        store_id: storeId,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data stok produk:', error);
    throw error;
  }
};

/**
 * @typedef {Object} CheckoutItem
 * @property {number} product_id
 * @property {number} price_code_id
 * @property {number} qty
 * @property {number} price
 */

/**
 * @typedef {Object} CheckoutPayload
 * @property {number} cashier_id
 * @property {number} store_id
 * @property {string} sale_type
 * @property {string} status
 * @property {string} discount_type
 * @property {number} discount_value
 * @property {CheckoutItem[]} items
 */

/**
 * @property {number} product_id
 * @property {number} price_code_id
 * @property {number} qty
 * @property {number} price
 */

/**
 * @property {number} cashier_id
 * @property {number} store_id
 * @property {string} sale_type
 * @property {string} status
 * @property {string} discount_type
 * @property {number} discount_value
 * @property {CheckoutItem[]} items
 */

/**
 * @typedef {Object} CheckoutResponse
 * @property {boolean} success
 * @property {string} message
 * @property {number} transaction_id
 * @property {number} subtotal
 * @property {number} discount_amount
 * @property {number} total_price
 */

/**
 * Checkout transaksi penjualan
 * @param {CheckoutPayload} payload
 * @returns {Promise<CheckoutResponse>}
 */
export const checkoutTransaction = async (payload) => {
  try {
    const response = await api.post('/transactions/checkout', payload);

    return response.data;
  } catch (error) {
    console.error('Gagal checkout transaksi:', error);
    throw error;
  }
};
