import useAuthStore from '@core/auth/authStore';

/**
 * Custom hook for authentication
 * Provides auth state and methods
 * @returns {Object} Auth state and methods
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const setAuth = useAuthStore((state) => state.setAuth);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const getToken = useAuthStore((state) => state.getToken);
  const getUser = useAuthStore((state) => state.getUser);
  const hasRole = useAuthStore((state) => state.hasRole);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,

    // Methods
    setAuth,
    updateUser,
    clearAuth,
    setLoading,
    getToken,
    getUser,
    hasRole,
  };
}
