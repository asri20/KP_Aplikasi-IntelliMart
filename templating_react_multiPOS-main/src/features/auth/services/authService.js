import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';
import { validateResponse } from '@shared/lib/api/validator';

import { authResponseSchema } from '../schemas/authSchema';

/**
 * Delay helper untuk fungsi mock API.
 */
const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Login menggunakan email dan password.
 */
export async function login(credentials) {
  try {
    const response = await axiosClient.post(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    const data = response.data;

    console.log('Respons asli backend:', data);

    if (!data?.success || !data?.user || !data?.token) {
      throw new Error(
        data?.message || 'Respons login dari backend tidak lengkap'
      );
    }

    // Normalisasi data user dari backend.
    const normalizedResponse = {
      user: {
        id: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
        role: String(
          data.user.role_name || data.user.role || ''
        ).toLowerCase(),
      },
      token: data.token,
      ...(data.refreshToken
        ? { refreshToken: data.refreshToken }
        : {}),
    };

    console.log('User setelah normalisasi:', normalizedResponse.user);

    // Validasi respons berdasarkan schema frontend.
    const validation = validateResponse(
      authResponseSchema,
      normalizedResponse
    );

    if (!validation.success) {
      console.error('Validasi schema gagal:', validation);
      throw new Error(
        'Format respons login dari backend tidak sesuai. Periksa authSchema.js.'
      );
    }

    return validation.data;
  } catch (err) {
    console.error(
      'Detail error login:',
      err.response?.data || err.message || err
    );

    if (err.response) {
      throw new Error(
        err.response.data?.message ||
          err.response.data?.error ||
          'Login gagal. Periksa email dan password.'
      );
    }

    throw err;
  }
}

/**
 * Registrasi Owner baru melalui backend IntelliMart.
 */
export async function register(userData) {
  try {
    const response = await axiosClient.post(
      ENDPOINTS.AUTH.REGISTER,
      {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      }
    );

    const result = response.data;

    console.log('Respons register backend:', result);

    if (!result?.success || !result?.data) {
      throw new Error(result?.message || 'Registrasi gagal');
    }

    return {
      message: result.message || 'Registrasi berhasil',
      user: {
        id: String(result.data.id),
        name: result.data.name,
        email: result.data.email,
        role: String(
          result.data.role_name || ''
        ).toLowerCase(),
        roleId: result.data.role_id,
        isActive: result.data.is_active,
      },
    };
  } catch (err) {
    console.error(
      'Register error:',
      err.response?.data || err.message || err
    );

    if (err.response) {
      throw new Error(
        err.response.data?.message ||
          err.response.data?.error ||
          'Registrasi gagal. Silakan coba lagi.'
      );
    }

    throw err;
  }
}

/**
 * Request password reset.
 * Masih menggunakan mock API.
 */
export async function forgotPassword() {
  await delay(800);

  return {
    message: 'Link reset password telah dikirim ke email Anda',
  };
}

/**
 * Reset password dengan token.
 * Masih menggunakan mock API.
 */
export async function resetPassword(data) {
  await delay(1000);

  if (data.token === 'invalid_token') {
    throw new Error('Token tidak valid atau sudah kadaluarsa');
  }

  return {
    message: 'Password berhasil direset',
  };
}

/**
 * Refresh access token.
 * Masih menggunakan mock API.
 */
export async function refreshAccessToken() {
  await delay(500);

  return {
    token: `mock_jwt_token_refreshed_${Date.now()}`,
    refreshToken: `mock_refresh_token_new_${Date.now()}`,
  };
}

/**
 * Logout.
 * Saat ini hanya simulasi di frontend.
 */
export async function logout() {
  await delay(300);
}

/**
 * Mendapatkan profil user saat ini dari backend.
 */
export async function getCurrentUser() {
  const response = await axiosClient.get(ENDPOINTS.AUTH.ME);
  return response.data;
}