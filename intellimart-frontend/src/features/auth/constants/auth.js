/**
 * Auth constants
 */

export const AUTH_ROUTES = Object.freeze({
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
});

export const PROTECTED_ROUTES = Object.freeze({
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
});

export const AUTH_STORAGE_KEYS = Object.freeze({
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
});

export const AUTH_ERRORS = Object.freeze({
  INVALID_CREDENTIALS: 'Email atau password salah',
  EMAIL_ALREADY_EXISTS: 'Email sudah terdaftar',
  USER_NOT_FOUND: 'User tidak ditemukan',
  TOKEN_EXPIRED: 'Sesi telah berakhir, silakan login kembali',
  NETWORK_ERROR: 'Koneksi bermasalah, coba lagi',
  INVALID_TOKEN: 'Token tidak valid',
  WEAK_PASSWORD: 'Password terlalu lemah',
});

export const PASSWORD_RULES = Object.freeze({
  MIN_LENGTH: 6,
  MAX_LENGTH: 100,
  DESCRIPTION: 'Minimal 6 karakter',
});
