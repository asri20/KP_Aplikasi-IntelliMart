import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';

/**
 * Login user
 */
export async function login(credentials) {
  const response = await axiosClient.post(
    ENDPOINTS.AUTH.LOGIN,
    {
      email: credentials.email,
      password: credentials.password,
    }
  );

  return response.data;
}

/**
 * Register Owner
 */
export async function register(data) {
  const response = await axiosClient.post(
    ENDPOINTS.AUTH.REGISTER,
    {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || null,
    }
  );

  return response.data;
}

/**
 * Logout user
 */
export async function logout() {
  const response = await axiosClient.post(
    ENDPOINTS.AUTH.LOGOUT
  );

  return response.data;
}

/**
 * Forgot password
 *
 * Backend IntelliMart saat ini belum menyediakan
 * endpoint /auth/forgot-password.
 */
export async function forgotPassword() {
  throw new Error(
    'Fitur lupa password belum tersedia di backend IntelliMart.'
  );
}

/**
 * Reset password
 *
 * Backend IntelliMart saat ini belum menyediakan
 * endpoint /auth/reset-password.
 */
export async function resetPassword() {
  throw new Error(
    'Fitur reset password belum tersedia di backend IntelliMart.'
  );
}