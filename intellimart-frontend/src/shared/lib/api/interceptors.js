import useAuthStore from '@core/auth/authStore';

import { axiosClient } from './axiosClient';

/**
 * Request Interceptor
 * Attach auth token to every request
 */
axiosClient.interceptors.request.use(
  (config) => {
    // Attach auth token
    const token = useAuthStore.getState().getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle common response errors and token refresh
 */
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Network error (no response)
    if (!error.response) {
      return Promise.reject({
        message: 'Koneksi bermasalah. Periksa internet Anda.',
        code: 'NETWORK_ERROR',
      });
    }

    const { status } = error.response;

    // Handle 401 Unauthorized - Try to refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        // No refresh token, logout user
        useAuthStore.getState().clearAuth();
        window.location.href = '/login?session=expired';
        return Promise.reject(error);
      }

      try {
        // Try to refresh token
        const response = await axiosClient.post('/auth/refresh', {
          refreshToken,
        });

        const { token: newToken } = response.data;

        // Update token in store
        useAuthStore.getState().setToken(newToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().clearAuth();
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const { data } = error.response;

    return Promise.reject({
      message: data?.message || 'Terjadi kesalahan. Silakan coba lagi.',
      code: data?.code || `HTTP_${status}`,
      status,
      details: data?.details,
    });
  }
);

