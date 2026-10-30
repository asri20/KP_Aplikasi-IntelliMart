
import axios from 'axios';

import { env } from '@core/config/env';
import useAuthStore from '@core/auth/authStore';

export const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Tambahkan token login ke setiap request API jika tersedia.
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export function createRequest(config) {
  return axiosClient.request(config);
}
