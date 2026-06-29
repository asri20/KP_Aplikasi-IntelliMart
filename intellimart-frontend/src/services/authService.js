import { mockUsers } from "./mock/mockData";
import { fakeApi, fakeApiError } from "./mock/fakeApi";

export const authService = {
  async login(email, password) {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return fakeApiError("Email atau password salah", 700);
    }
    const { password: _, ...safeUser } = user;
    const token = `mock-jwt-token-${safeUser.id}-${Date.now()}`;
    return fakeApi({ user: safeUser, token }, 800);
  },

  async getSession() {
    const token = localStorage.getItem("im_token");
    const user = localStorage.getItem("im_user");
    if (!token || !user) return fakeApi(null, 200);
    return fakeApi({ token, user: JSON.parse(user) }, 200);
  },

  async logout() {
    return fakeApi({ success: true }, 300);
  },
};