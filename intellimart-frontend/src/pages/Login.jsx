import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useStore } from "../hooks/useStore";

const DEMO_ACCOUNTS = [
  { label: "Owner", email: "owner@demo.com", badge: "owner" },
  { label: "Manager", email: "manager@demo.com", badge: "manager" },
  { label: "Kasir", email: "kasir@demo.com", badge: "cashier" },
];

const BADGE_COLOR = {
  owner: "#f59e0b",
  manager: "#6366f1",
  cashier: "#22c55e",
};

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const { activeStore } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(activeStore ? "/dashboard" : "/select-store", { replace: true });
    }
  }, [isAuthenticated, activeStore, navigate]);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await login(email, password);
    if (result.success) {
      showToast("Login berhasil! Selamat datang 🎉", "success");
      setTimeout(() => navigate("/select-store", { replace: true }), 600);
    } else {
      showToast(result.error || "Login gagal");
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword("123456");
  };

  return (
    <div className="login-root">
      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg__blob login-bg__blob--1" />
        <div className="login-bg__blob login-bg__blob--2" />
        <div className="login-bg__grid" />
      </div>

      {/* Toast */}
      {toast && (
        <div className={`im-toast im-toast--${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo__icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#0ea5e9" />
              <path d="M7 14h4l3-6 3 12 3-6h1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="login-logo__name">IntelliMart</div>
            <div className="login-logo__tagline">Multi-Store POS + AI System</div>
          </div>
        </div>

        <h1 className="login-title">Selamat Datang</h1>
        <p className="login-sub">Masuk ke akun toko Anda</p>

        {/* Demo accounts */}
        <div className="demo-accounts">
          <div className="demo-accounts__label">Akun Demo:</div>
          <div className="demo-accounts__list">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                className="demo-pill"
                style={{ "--badge": BADGE_COLOR[acc.badge] }}
                onClick={() => fillDemo(acc)}
                type="button"
              >
                <span className="demo-pill__dot" />
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Email</label>
            <div className="login-input-wrap">
              <svg className="login-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4l6 5 6-5M2 4h12v9H2V4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="email"
                className="login-input"
                placeholder="email@demo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <svg className="login-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type={showPass ? "text" : "password"}
                className="login-input"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className={`login-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner" />
                Memverifikasi...
              </>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        <div className="login-hint">
          Password semua akun demo: <strong>123456</strong>
        </div>
      </div>
    </div>
  );
}
