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

  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    CHANGE_PASSWORD: '/user/change-password',
  },

  // Tenant (placeholder untuk iterasi 3)
  TENANT: {
    LIST: '/tenants',
    DETAIL: (id) => `/tenants/${id}`,
    CREATE: '/tenants',
    UPDATE: (id) => `/tenants/${id}`,
    DELETE: (id) => `/tenants/${id}`,
  },

  // Outlets (placeholder untuk iterasi 3)
  OUTLET: {
    LIST: '/outlets',
    DETAIL: (id) => `/outlets/${id}`,
    CREATE: '/outlets',
    UPDATE: (id) => `/outlets/${id}`,
    DELETE: (id) => `/outlets/${id}`,
  },
});

