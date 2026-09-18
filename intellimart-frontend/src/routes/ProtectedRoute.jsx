import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSession } from "../services/auth";

export default function ProtectedRoute({ role }) {
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && session.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
