import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from './useAuth';

/**
 * Redirect authenticated users from public pages
 * @param {string} redirectTo - Path to redirect to (default: /dashboard)
 */
export function useAuthRedirect(redirectTo = '/dashboard') {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);
}
