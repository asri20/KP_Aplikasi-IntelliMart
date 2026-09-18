import axios from 'axios';

import { env } from '@core/config/env';

/**
 * Axios client instance dengan default config
 * Factory pattern untuk reusable HTTP client
 */
// eslint-disable-next-line import/no-named-as-default-member
export const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Helper untuk create request dengan custom config
 * @param {Object} config - Axios config
 * @returns {Promise} Axios promise
 */
export function createRequest(config) {
  return axiosClient.request(config);
}
