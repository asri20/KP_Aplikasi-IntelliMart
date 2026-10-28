import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useStore } from "../hooks/useStore";

export default function SelectStore() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { stores, activeStore, isLoadingStores, loadStores, setActiveStore } = useStore();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
    else loadStores();
  }, [isAuthenticated]);

  const handleSelect = async (store) => {
    await setActiveStore(store);
    navigate("/dashboard", { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const ROLE_LABEL = { owner: "Pemilik", manager: "Manajer", cashier: "Kasir" };
  const ROLE_COLOR = { owner: "#f59e0b", manager: "#6366f1", cashier: "#22c55e" };

  return (
    <div className="select-store-root">
      <div className="login-bg">
        <div className="login-bg__blob login-bg__blob--1" />
        <div className="login-bg__blob login-bg__blob--2" />
        <div className="login-bg__grid" />
      </div>

      <div className="select-store-card">
        <div className="login-logo" style={{ marginBottom: "0.5rem" }}>
          <div className="login-logo__icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#0ea5e9" />
              <path d="M7 14h4l3-6 3 12 3-6h1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="login-logo__name">IntelliMart</div>
          </div>
        </div>

        <div className="ss-user-badge">
          <div className="ss-avatar">{user?.avatar}</div>
          <div>
            <div className="ss-name">{user?.name}</div>
            <span
              className="ss-role-badge"
              style={{ background: ROLE_COLOR[user?.role] + "22", color: ROLE_COLOR[user?.role] }}
            >
              {ROLE_LABEL[user?.role]}
            </span>
          </div>
        </div>

        <h2 className="ss-title">Pilih Toko</h2>
        <p className="ss-sub">Pilih toko yang ingin Anda kelola</p>

        {isLoadingStores ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            <div className="im-spinner" style={{ margin: "0 auto 0.75rem" }} />
            Memuat daftar toko...
          </div>
        ) : (
          <div className="ss-list">
            {stores.map((store) => (
              <button
                key={store.id}
                className={`ss-item ${activeStore?.id === store.id ? "ss-item--active" : ""}`}
                onClick={() => handleSelect(store)}
              >
                <div className="ss-item__avatar">{store.name[0]}</div>
                <div className="ss-item__info">
                  <div className="ss-item__name">{store.name}</div>
                  <div className="ss-item__addr">{store.address}</div>
                  <div className="ss-item__phone">{store.phone}</div>
                </div>
                <div className="ss-item__arrow">→</div>
              </button>
            ))}
          </div>
        )}

        <button className="ss-logout" onClick={handleLogout}>
          ← Keluar
        </button>
      </div>
    </div>
  );
}
