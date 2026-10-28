import { useAuth } from "../../hooks/useAuth";

export default function RoleGuard({ module, fallback = null, children }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(module)) return fallback;
  return children;
}
