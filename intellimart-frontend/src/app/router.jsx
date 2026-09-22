import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from '@features/auth/pages';
import LandingPage from '@features/landing/pages/LandingPage';
import { PurchaseOrderPage } from '@features/purchase-order/pages';
import MainLayout from '@shared/components/layouts/MainLayout.jsx';

import { ProtectedRoute, PublicRoute } from '@core/auth';

// Placeholder Dashboard
const DashboardPage = () => {
  const handleLogout = () => {
    // Clear auth and redirect
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Dashboard</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">Welcome to the dashboard! (Placeholder for Iterasi 3)</p>
      <button onClick={handleLogout} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
        Logout
      </button>
    </div>
  );
};

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

        {/* Protected Routes (Dibungkus MainLayout & ProtectedRoute) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/purchase-order" element={<PurchaseOrderPage />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">404</h1>
                <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">Halaman tidak ditemukan</p>
                <a href="/" className="text-brand-600 dark:text-brand-400 hover:underline">
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