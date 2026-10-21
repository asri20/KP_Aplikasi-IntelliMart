
import useAuthStore from '@core/auth/authStore';
import { axiosClient } from './axiosClient';

axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject({
        message: 'Koneksi bermasalah. Periksa internet Anda.',
        code: 'NETWORK_ERROR',
      });
    }

    const { status, data } = error.response;
    const requestUrl = originalRequest?.url || '';

    // Login gagal bukan berarti sesi pengguna kedaluwarsa.
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    if (status === 401 && isAuthRequest) {
      return Promise.reject({
        message: data?.message || 'Email atau password salah.',
        code: data?.code || 'AUTH_FAILED',
        status,
      });
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login?session=expired';
        return Promise.reject(error);
      }

      try {
        const response = await axiosClient.post('/auth/refresh', {
          refreshToken,
        });

        const newToken = response.data.token;

        if (!newToken) {
          throw new Error('Token baru tidak ditemukan.');
        }

        useAuthStore.getState().setToken(newToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject({
      message: data?.message || 'Terjadi kesalahan. Silakan coba lagi.',
      code: data?.code || `HTTP_${status}`,
      status,
      details: data?.details,
    });
  }
);
