import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, error, login, logout, clearError } =
    useAuthStore();

  const hasPermission = (module) => {
    if (!user) return false;
    const perms = {
      owner: ["dashboard", "products", "pos", "customers", "suppliers", "finance", "ai", "users"],
      manager: ["dashboard", "products", "customers", "suppliers", "finance", "ai"],
      cashier: ["pos", "products"],
    };
    return (perms[user.role] || []).includes(module);
  };

  return { user, token, isAuthenticated, isLoading, error, login, logout, clearError, hasPermission };
};