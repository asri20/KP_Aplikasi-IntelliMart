import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from '@features/auth/pages';
import LandingPage from '@features/landing/pages/LandingPage';

import { ProtectedRoute, PublicRoute } from '@core/auth';
import { DashboardPage, TokoSayaPage, ProdukPage } from '@features/owner/pages';

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

        {/* Protected Routes */}
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
