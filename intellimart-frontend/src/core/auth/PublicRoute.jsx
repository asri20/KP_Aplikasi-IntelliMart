import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@features/auth/hooks';

import { getHomeByRole, getUserRole } from './roles';

function PublicRoute({ children, redirectTo }) {
  const { isAuthenticated, user, clearAuth } = useAuth();

  if (isAuthenticated) {
    const currentRole = getUserRole(user);

    // Jika sesi lama tidak memiliki role yang valid, hapus sesi dan tampilkan halaman login
    if (!currentRole) {
      clearAuth();
      return children;
    }

    const destination = redirectTo || getHomeByRole(user);
    return <Navigate to={destination} replace />;
  }

  return children;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default PublicRoute;
