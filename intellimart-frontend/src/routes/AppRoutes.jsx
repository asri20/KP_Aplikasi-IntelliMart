import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from '../components/layout/AppLayout';

import SalesPOS from '../pages/SalesPOS';
import SalesAnalytics from '../pages/SalesAnalytics';
import Dashboard from '../pages/Dashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/pos" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/pos" element={<SalesPOS />} />

        <Route path="/analisis-penjualan" element={<SalesAnalytics />} />

        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Route>
    </Routes>
  );
}
