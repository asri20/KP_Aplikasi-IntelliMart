import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@features/auth/hooks';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.redirectTo='/login'] - Redirect path
 */
function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while checking auth (or you can show a loading spinner)
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default ProtectedRoute;
