
import axios from 'axios';

import { env } from '@core/config/env';
import useAuthStore from '@core/auth/authStore';

/**
 * Axios client instance dengan default config
 */
export const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Tambahkan JWT ke setiap request jika token tersedia.
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Helper untuk create request dengan custom config
 */
export function createRequest(config) {
  return axiosClient.request(config);
}
