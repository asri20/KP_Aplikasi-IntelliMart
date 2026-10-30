/**
 * Application Constants
 * Global constants untuk seluruh aplikasi
 */

export const APP_NAME = 'InteliMart';
export const APP_TAGLINE = 'POS Modern untuk UMKM Indonesia';

/**
 * Storage keys untuk localStorage
 */
export const STORAGE_KEYS = Object.freeze({
  THEME: 'intelimart_theme',
  AUTH_TOKEN: 'intelimart_auth_token',
  TENANT_ID: 'intelimart_tenant_id',
  USER_DATA: 'intelimart_user_data',
});

/**
 * Breakpoints untuk responsive (sesuai Tailwind)
 */
export const BREAKPOINTS = Object.freeze({
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
});

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});
