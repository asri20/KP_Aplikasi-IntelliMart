import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AUTH_STORAGE_KEYS } from '@features/auth/constants/auth';

/**
 * Auth store using Zustand with persistence
 * Observer Pattern for state management
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      /**
       * Set authenticated user
       * @param {Object} data - Auth data
       * @param {Object} data.user - User object
       * @param {string} data.token - Access token
       * @param {string} [data.refreshToken] - Refresh token
       */
      setAuth: (data) => {
        set({
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken || null,
          isAuthenticated: true,
        });
      },

      /**
       * Update user data
       * @param {Object} userData - Updated user data
       */
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      /**
       * Set new token (for refresh)
       * @param {string} token - New access token
       */
      setToken: (token) => {
        set({ token });
      },

      /**
       * Clear auth state (logout)
       */
      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        // Clear from localStorage
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      },

      /**
       * Set loading state
       * @param {boolean} isLoading - Loading state
       */
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      /**
       * Get current token
       * @returns {string|null}
       */
      getToken: () => get().token,

      /**
       * Get current user
       * @returns {Object|null}
       */
      getUser: () => get().user,

      /**
       * Check if user has specific role
       * @param {string} role - Role to check
       * @returns {boolean}
       */
      hasRole: (role) => {
        const user = get().user;
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      // Only persist specific fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
