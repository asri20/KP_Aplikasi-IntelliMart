import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@features/auth/hooks';

/**
 * Public Route Component
 * Redirects authenticated users to dashboard
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.redirectTo='/dashboard'] - Redirect path
 */
function PublicRoute({ children, redirectTo = '/dashboard' }) {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default PublicRoute;
