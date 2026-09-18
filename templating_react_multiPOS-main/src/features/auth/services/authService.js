import { axiosClient } from '@shared/lib/api/axiosClient';
import { ENDPOINTS } from '@shared/lib/api/endpoints';
import { validateResponse } from '@shared/lib/api/validator';

import { authResponseSchema } from '../schemas/authSchema';

/**
 * Delay helper for mock API
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Login with email and password
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<import('../schemas/authSchema').AuthResponse>}
 */
export async function login(credentials) {
  // Mock API delay
  await delay(1000);

  // Mock response - In production, this would be:
  // const response = await axiosClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
  const mockResponse = {
    user: {
      id: '1',
      name: 'John Doe',
      email: credentials.email,
      role: 'admin',
    },
    token: `mock_jwt_token_${Date.now()}`,
    refreshToken: `mock_refresh_token_${Date.now()}`,
  };

  // Simulate error for testing
  if (credentials.email === 'error@test.com') {
    throw new Error('Email atau password salah');
  }

  // Validate response
  const validation = validateResponse(authResponseSchema, mockResponse);

  if (!validation.success) {
    throw new Error('Invalid response from server');
  }

  return validation.data;
}

/**
 * Register new user
 * @param {Object} userData - Registration data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<import('../schemas/authSchema').AuthResponse>}
 */
export async function register(userData) {
  // Mock API delay
  await delay(1200);

  // Simulate email already exists error
  if (userData.email === 'existing@test.com') {
    throw new Error('Email sudah terdaftar');
  }

  // Mock response
  const mockResponse = {
    user: {
      id: '2',
      name: userData.name,
      email: userData.email,
      role: 'cashier',
    },
    token: `mock_jwt_token_${Date.now()}`,
    refreshToken: `mock_refresh_token_${Date.now()}`,
  };

  // Validate response
  const validation = validateResponse(authResponseSchema, mockResponse);

  if (!validation.success) {
    throw new Error('Invalid response from server');
  }

  return validation.data;
}

/**
 * Request password reset
 * @returns {Promise<{message: string}>}
 */
export async function forgotPassword() {
  // Mock API delay
  await delay(800);

  // Mock response
  return {
    message: 'Link reset password telah dikirim ke email Anda',
  };
}

/**
 * Reset password with token
 * @param {Object} data - Reset data
 * @param {string} data.token - Reset token from email
 * @param {string} data.password - New password
 * @returns {Promise<{message: string}>}
 */
export async function resetPassword(data) {
  // Mock API delay
  await delay(1000);

  // Simulate invalid token
  if (data.token === 'invalid_token') {
    throw new Error('Token tidak valid atau sudah kadaluarsa');
  }

  // Mock response
  return {
    message: 'Password berhasil direset',
  };
}

/**
 * Refresh access token
 * @returns {Promise<{token: string, refreshToken: string}>}
 */
export async function refreshAccessToken() {
  // Mock API delay
  await delay(500);

  // Mock response
  return {
    token: `mock_jwt_token_refreshed_${Date.now()}`,
    refreshToken: `mock_refresh_token_new_${Date.now()}`,
  };
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logout() {
  // Mock API delay
  await delay(300);

  // In production: await axiosClient.post(ENDPOINTS.AUTH.LOGOUT);
  // Even if logout fails on server, clear local state
  return;
}

/**
 * Get current user profile
 * @returns {Promise<Object>}
 */
export async function getCurrentUser() {
  const response = await axiosClient.get(ENDPOINTS.AUTH.ME);
  return response.data;
}
