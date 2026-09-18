import { apiRequest } from "./api";

const SESSION_KEY = "intellimart_session";

function roleFromId(roleId) {
  switch (Number(roleId)) {
    case 1: return "OWNER";
    case 2: return "MANAGER";
    case 3: return "CASHIER";
    case 4: return "CUSTOMER";
    default: return null;
  }
}

export async function registerOwner({ fullName, email, password }) {
  try {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: fullName.trim(),
        email: email.trim(),
        password,
        phone: null,
      }),
    });

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: error.data?.message || error.message || "Registrasi gagal.",
    };
  }
}

export async function login({ identity, password }) {
  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: identity.trim(),
        password,
      }),
    });

    const role =
      data.user?.role_name
        ? String(data.user.role_name).toUpperCase()
        : roleFromId(data.user?.role_id);

    const session = {
      token: data.token,
      userId: data.user.id,
      fullName: data.user.name,
      email: data.user.email,
      role,
      roleId: Number(data.user.role_id),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { ok: true, session };
  } catch (error) {
    return {
      ok: false,
      message: error.data?.message || error.message || "Login gagal.",
    };
  }
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // Local session tetap dibersihkan walaupun request logout gagal.
  } finally {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("token");
  }
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("token");
}
