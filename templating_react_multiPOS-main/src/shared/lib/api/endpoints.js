
/**
 * API Endpoints
 * Centralized endpoint definitions
 */

export const ENDPOINTS = Object.freeze({
  // Landing
  LANDING: {
    FEATURES: '/landing/features',
    PRICING: '/landing/pricing',
    CONTACT: '/landing/contact',
  },

  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },

  // User profile
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    CHANGE_PASSWORD: '/users/change-password',
  },

  // Owner: account management
  OWNER_USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE_STATUS: (id) => `/users/${id}/status`,
  },

  // Tenant
  TENANT: {
    LIST: '/tenants',
    DETAIL: (id) => `/tenants/${id}`,
    CREATE: '/tenants',
    UPDATE: (id) => `/tenants/${id}`,
    DELETE: (id) => `/tenants/${id}`,
  },

  // Outlets
  OUTLET: {
    LIST: '/outlets',
    DETAIL: (id) => `/outlets/${id}`,
    CREATE: '/outlets',
    UPDATE: (id) => `/outlets/${id}`,
    DELETE: (id) => `/outlets/${id}`,
  },

  
  // // Stores
  // STORES: {
  //   LIST: '/stores',
  //   CREATE: '/stores',
  //   ASSIGN_MANAGER: '/stores/assign-manager',
  // },

});
