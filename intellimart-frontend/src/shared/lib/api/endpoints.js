/**
 * API Endpoints
 * Centralized endpoint definitions (Gabungan Versi Lama & Baru)
 */

export const ENDPOINTS = Object.freeze({
  // Landing (Baru)
  LANDING: {
    FEATURES: '/landing/features',
    PRICING: '/landing/pricing',
    CONTACT: '/landing/contact',
  },

  // Auth (Diperbarui)
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },

  // User (Diperbarui)
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    CHANGE_PASSWORD: '/user/change-password',
  },

  // Users / tim (owner & manager)
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    CREATE_CASHIER: '/users/cashier',
    STATUS: (id) => `/users/${id}/status`,
  },

  // Stores / Store (Digabung agar mendukung STORES maupun STORE)
  STORES: {
    LIST: '/stores',
    CREATE: '/stores',
    ASSIGN_MANAGER: '/stores/assign-manager',
  },
  STORE: {
    LIST: '/stores',
    CREATE: '/stores',
    ASSIGN_MANAGER: '/stores/assign-manager',
  },

  // Produk, Stok, dll (Dari file lamamu yang dipertahankan)
  PRODUCT: {
    LIST: '/products',
    DETAIL: (id) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
  },

  STOCK: {
    LIST: '/stocks',
    DETAIL: (storeId, variantId) => `/stocks/${storeId}/${variantId}`,
    CREATE: '/stocks',
    UPDATE: (storeId, variantId) => `/stocks/${storeId}/${variantId}`,
    DELETE: (storeId, variantId) => `/stocks/${storeId}/${variantId}`,
  },

  CATEGORY: {
    LIST: '/categories',
  },

  BRAND: {
    LIST: '/brands',
  },

  UNIT: {
    LIST: '/units',
  },

  VARIANT: {
    LIST: '/variants',
  },

  STOCK_MOVEMENT: {
    LIST: '/stock-movements',
    CREATE: '/stock-movements',
  },

  // Tenant (Placeholder untuk iterasi 3)
  TENANT: {
    LIST: '/tenants',
    DETAIL: (id) => `/tenants/${id}`,
    CREATE: '/tenants',
    UPDATE: (id) => `/tenants/${id}`,
    DELETE: (id) => `/tenants/${id}`,
  },

  // Outlets (Placeholder untuk iterasi 3)
  OUTLET: {
    LIST: '/outlets',
    DETAIL: (id) => `/outlets/${id}`,
    CREATE: '/outlets',
    UPDATE: (id) => `/outlets/${id}`,
    DELETE: (id) => `/outlets/${id}`,
  },

  // Dashboard & Analytics (Modul 10)
  DASHBOARD: {
    STORES: '/dashboard/stores',
    SUMMARY: (storeId) => `/dashboard/summary?store_id=${storeId}`,
    LOW_STOCK: (storeId) => `/dashboard/low-stock?store_id=${storeId}`,
    RECENT_TRANSACTIONS: (storeId, limit = 5) => `/dashboard/recent-transactions?store_id=${storeId}&limit=${limit}`,
  },

  ANALYTICS: {
    TOP_PRODUCTS: (storeId, limit = 10) => `/analytics/top-products?store_id=${storeId}&limit=${limit}`,
    PROFIT: (storeId, start = '', end = '') => `/analytics/profit?store_id=${storeId}${start ? '&start_date=' + start : ''}${end ? '&end_date=' + end : ''}`,
    SALES_TREND: (storeId, days = 30) => `/analytics/sales-trend?store_id=${storeId}&days=${days}`,
    PRODUCT_CATALOG: (storeId, search = '') => `/analytics/product-catalog?store_id=${storeId}${search ? '&search=' + encodeURIComponent(search) : ''}`,
    CUSTOMER_SEGMENTS: '/analytics/customer-segments',
  },
});