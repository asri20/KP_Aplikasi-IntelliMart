export const ENDPOINTS = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },

  USER: {
    LIST: '/users',
    CREATE: '/users',
    CHANGE_PASSWORD: '/users/change-password',
    STATUS: (id) => `/users/${id}/status`,
  },

  STORE: {
    LIST: '/stores',
    CREATE: '/stores',
    ASSIGN_MANAGER: '/stores/assign-manager',
  },

  PRODUCT: {
    LIST: '/products',
    DETAIL: (id) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
  },

  STOCK: {
    LIST: '/stocks',
    DETAIL: (storeId, variantId) =>
      `/stocks/${storeId}/${variantId}`,
    CREATE: '/stocks',
    UPDATE: (storeId, variantId) =>
      `/stocks/${storeId}/${variantId}`,
    DELETE: (storeId, variantId) =>
      `/stocks/${storeId}/${variantId}`,
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
});