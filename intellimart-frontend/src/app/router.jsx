import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@features/auth/pages';
import LandingPage from '@features/landing/pages/LandingPage';
import ManagerDashboardPage from '@features/manager/pages/ManagerDashboardPage';
import ManagerProductsPage from '@features/manager/pages/ManagerProductsPage';
import ManagerInventoryPage from '@features/manager/pages/ManagerInventoryPage';
import ManagerSalesPage from '@features/manager/pages/ManagerSalesPage';
import ManagerReportsPage from '@features/manager/pages/ManagerReportsPage';
import ManagerStaffPage from '@features/manager/pages/ManagerStaffPage';

import { RoleRoute, PublicRoute, ROLES } from '@core/auth';
import CashierDashboardPage from '@features/cashier/pages/CashierDashboardPage';
import CustomerDashboardPage from '@features/customer/pages/CustomerDashboardPage';
import {
  DashboardPage,
  TokoSayaPage,
  ProdukPage,
  InventoryPage,
  ManajemenManagerPage,
  StoreDetailPage,
  KategoriPage,
  PenjualanPage,
  LaporanPage,
} from '@features/owner/pages';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes (redirect if authenticated) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* ==================== OWNER ROUTES ==================== */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.OWNER]}>
              <DashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/toko-saya"
          element={
            <RoleRoute allowedRoles={[ROLES.OWNER]}>
              <TokoSayaPage />
            </RoleRoute>
          }
        />
        <Route
          path="/toko-saya/:storeId"
          element={
            <RoleRoute allowedRoles={[ROLES.OWNER]}>
              <StoreDetailPage />
            </RoleRoute>
          }
        />
        <Route
          path="/produk"
          element={
            <RoleRoute allowedRoles={[ROLES.OWNER]}>
              <ProdukPage />
            </RoleRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <RoleRoute allowedRoles={[ROLES.OWNER]}>
              <InventoryPage />
            </RoleRoute>
          }
        />
        <Route
          path="/kategori"
          element={
            <RoleRoute allowedRoles={[ROLES.OWNER]}>
              <KategoriPage />
            </RoleRoute>
          }
        />
        <Route
          path="/penjualan"
          element={
            <RoleRoute allowedRoles={[ROLES.OWNER]}>
              <PenjualanPage />
            </RoleRoute>
          }
        />
        <Route
          path="/manajemen-manager"
          element={
            <RoleRoute allowedRoles={[ROLES.OWNER]}>
              <ManajemenManagerPage />
            </RoleRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <RoleRoute allowedRoles={[ROLES.OWNER]}>
              <LaporanPage />
            </RoleRoute>
          }
        />

        {/* ==================== MANAGER ROUTES ==================== */}
        <Route
          path="/manager/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <ManagerDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/manager/products"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <ManagerProductsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/manager/inventory"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <ManagerInventoryPage />
            </RoleRoute>
          }
        />
        <Route
          path="/manager/sales"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <ManagerSalesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/manager/reports"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <ManagerReportsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/manager/staff"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <ManagerStaffPage />
            </RoleRoute>
          }
        />

        {/* ==================== CASHIER & CUSTOMER ROUTES ==================== */}
        <Route
          path="/cashier/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.CASHIER]}>
              <CashierDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
              <CustomerDashboardPage />
            </RoleRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                  404
                </h1>
                <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
                  Halaman tidak ditemukan
                </p>
                <a
                  href="/"
                  className="text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
