import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../../styles/AppLayout.css';

const navigationItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '▦',
    description: 'Ringkasan toko',
  },
  {
    path: '/pos',
    label: 'POS / Penjualan',
    icon: '🛒',
    description: 'Transaksi penjualan',
  },
  {
    path: '/analisis-penjualan',
    label: 'Analisis Penjualan',
    icon: '▥',
    description: 'Analisis pelanggan dan produk',
  },
];

export default function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-brand">
          <div className="app-brand-logo">IM</div>

          <div className="app-brand-text">
            <h2>INTELLIMART</h2>
            <span>Management System</span>
          </div>
        </div>

        <div className="app-sidebar-divider" />

        <div className="app-menu-heading">MENU UTAMA</div>

        <nav className="app-navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `app-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="app-nav-icon">{item.icon}</span>

              <span className="app-nav-text">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-footer-indicator" />
          <span>IntelliMart POS System</span>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
