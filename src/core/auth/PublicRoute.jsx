import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@features/auth/hooks';

function PublicRoute({ children, redirectTo }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    const role = (
      user?.role ||
      user?.role_name ||
      ''
    )
      .toString()
      .trim()
      .toLowerCase();

    const destination =
      redirectTo ||
      (role === 'manager' ? '/manager/dashboard' : '/dashboard');

    return <Navigate to={destination} replace />;
  }

  return children;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default PublicRoute;
