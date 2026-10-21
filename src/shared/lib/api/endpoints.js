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
});