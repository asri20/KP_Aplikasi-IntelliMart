import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useStore } from "../../hooks/useStore";
import RoleGuard from "../common/RoleGuard";

const NAV_ITEMS = [
  {
    module: "dashboard",
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    module: "pos",
    to: "/pos",
    label: "POS / Kasir",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="4" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8h2M5 11h2M9 8h4M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 2h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    module: "products",
    to: "/products",
    label: "Produk & Stok",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 5l6-3 6 3v8l-6 3-6-3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 2v13M3 5l6 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    module: "customers",
    to: "/customers",
    label: "Pelanggan",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    module: "suppliers",
    to: "/suppliers",
    label: "Supplier",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="7" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 7V5a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6" cy="13" r="1" fill="currentColor" />
        <circle cx="12" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    module: "finance",
    to: "/finance",
    label: "Keuangan",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 7h16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 11h3M11 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    module: "ai",
    to: "/insights",
    label: "AI Insights",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1v2M9 15v2M1 9h2M15 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      </svg>
    ),
    badge: "AI",
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { activeStore } = useStore();
  const navigate = useNavigate();

  const ROLE_LABEL = { owner: "Pemilik", manager: "Manajer", cashier: "Kasir" };
  const ROLE_COLOR = { owner: "#f59e0b", manager: "#6366f1", cashier: "#22c55e" };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#0ea5e9" />
            <path d="M7 14h4l3-6 3 12 3-6h1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsed && <span className="sidebar__logo-text">IntelliMart</span>}
        <button className="sidebar__collapse-btn" onClick={onToggle}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Store info */}
      {!collapsed && activeStore && (
        <div className="sidebar__store">
          <div className="sidebar__store-dot" />
          <div className="sidebar__store-name">{activeStore.name}</div>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <RoleGuard key={item.to} module={item.module}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="sidebar__link-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar__badge">{item.badge}</span>
                  )}
                </>
              )}
            </NavLink>
          </RoleGuard>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar__user">
        <div className="sidebar__user-avatar">{user?.avatar}</div>
        {!collapsed && (
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.name}</div>
            <span
              className="sidebar__user-role"
              style={{ color: ROLE_COLOR[user?.role] }}
            >
              {ROLE_LABEL[user?.role]}
            </span>
          </div>
        )}
        <button
          className="sidebar__logout-btn"
          onClick={handleLogout}
          title="Keluar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
