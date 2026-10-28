import { create } from "zustand";
import { authService } from "../services/authService";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const session = await authService.getSession();
      if (session) {
        set({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
        });
      }
    } catch {
      // no session
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(email, password);
      localStorage.setItem("im_token", token);
      localStorage.setItem("im_user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    localStorage.removeItem("im_token");
    localStorage.removeItem("im_user");
    localStorage.removeItem("im_activeStore");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));