import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@features/auth/pages';

import LandingPage from '@features/landing/pages/LandingPage';

import { ProtectedRoute, PublicRoute } from '@core/auth';

import { DashboardPage, TokoSayaPage, ProdukPage } from '@features/owner/pages';

import ManagerDashboardPage from '@features/manager/pages/ManagerDashboardPage';
import ManagerInventoryPage from '@features/manager/pages/ManagerInventoryPage';
import ManagerProductsPage from '@features/manager/pages/ManagerProductsPage';
import ManagerReportsPage from '@features/manager/pages/ManagerReportsPage';
import ManagerSalesPage from '@features/manager/pages/ManagerSalesPage';
import ManagerStaffPage from '@features/manager/pages/ManagerStaffPage';
import KelolaAkunPage from '@features/owner/pages/KelolaAkunPage';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes */}
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

        {/* ==================== OWNER ==================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/toko-saya"
          element={
            <ProtectedRoute>
              <TokoSayaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/produk"
          element={
            <ProtectedRoute>
              <ProdukPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kelola-akun"
          element={
            <ProtectedRoute>
              <KelolaAkunPage />
            </ProtectedRoute>
          }
        />

        {/* ==================== MANAGER ==================== */}

        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute>
              <ManagerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/products"
          element={
            <ProtectedRoute>
              <ManagerProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/inventory"
          element={
            <ProtectedRoute>
              <ManagerInventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/sales"
          element={
            <ProtectedRoute>
              <ManagerSalesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/reports"
          element={
            <ProtectedRoute>
              <ManagerReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/staff"
          element={
            <ProtectedRoute>
              <ManagerStaffPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center">
              <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
