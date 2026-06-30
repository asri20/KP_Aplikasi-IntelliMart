import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useStore } from "../../hooks/useStore";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeStore } = useStore();

  if (isLoading) {
    return (
      <div className="im-loading-screen">
        <div className="im-spinner" />
        <span>Memuat sesi...</span>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!activeStore) return <Navigate to="/select-store" replace />;

  return children;
}
