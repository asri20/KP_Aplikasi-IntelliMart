
import { Navigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks';

function PublicRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // Jika belum login, izinkan membuka Login dan Register.
  if (!isAuthenticated) {
    return children;
  }

  // Jika sudah login, arahkan sesuai role.
  const role = String(user?.role || '').toLowerCase();

  if (role === 'manager') {
    return <Navigate to="/manager/dashboard" replace />;
  }

  if (role === 'cashier') {
    return <Navigate to="/kasir/dashboard" replace />;
  }

  if (role === 'owner') {
    return <Navigate to="/dashboard" replace />;
  }

  // Role tidak dikenal: jangan paksa masuk dashboard Owner.
  return children;
}

export default PublicRoute;
