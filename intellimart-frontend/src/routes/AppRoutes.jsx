import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SalesPOS from '../pages/SalesPOS';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Modul 2 - Sales POS */}
      <Route path="/pos" element={<SalesPOS />} />

      {/* Root dan halaman yang tidak ditemukan diarahkan ke Sales POS */}
      <Route path="*" element={<Navigate to="/pos" replace />} />
    </Routes>
  );
}
