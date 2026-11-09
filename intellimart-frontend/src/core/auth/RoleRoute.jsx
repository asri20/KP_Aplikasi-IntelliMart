import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@features/auth/hooks';

import { getHomeByRole, getUserRole } from './roles';

/**
 * Hanya mengizinkan role tertentu. Belum login atau sesi tanpa role valid -> /login,
 * role tidak sesuai -> dashboard milik role user tersebut.
 */
function RoleRoute({ allowedRoles, children }) {
  const { isAuthenticated, isLoading, user, clearAuth } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const currentRole = getUserRole(user);

  // Jika sesi lama di localStorage tidak punya role yang valid, bersihkan sesi agar kembali ke /login
  if (!currentRole) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to={getHomeByRole(user)} replace />;
  }

  return children;
}

RoleRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};

export default RoleRoute;
