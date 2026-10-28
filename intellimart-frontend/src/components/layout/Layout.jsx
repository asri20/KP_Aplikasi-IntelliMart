import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/pos": "Point of Sale",
  "/products": "Produk & Stok",
  "/customers": "Pelanggan",
  "/suppliers": "Supplier",
  "/finance": "Keuangan",
  "/insights": "AI Insights",
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "IntelliMart";

  return (
    <div className={`app-layout ${collapsed ? "app-layout--collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="app-main">
        <Topbar title={title} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
