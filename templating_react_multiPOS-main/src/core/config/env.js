/**
 * Environment Configuration
 * Centralized environment variables access
 */

/**
 * @typedef {Object} EnvConfig
 * @property {string} apiBaseUrl - API base URL
 * @property {number} apiTimeout - API timeout in ms
 * @property {string} appName - Application name
 * @property {string} appVersion - Application version
 * @property {boolean} enableMockApi - Enable mock API
 * @property {boolean} enableDevTools - Enable dev tools
 * @property {boolean} isDevelopment - Is development mode
 * @property {boolean} isProduction - Is production mode
 */

/** @type {EnvConfig} */
export const env = Object.freeze({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  appName: import.meta.env.VITE_APP_NAME || 'InteliMart',
  appVersion: import.meta.env.VITE_APP_VERSION || '0.1.0',
  enableMockApi: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
  enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
});
