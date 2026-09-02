import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Layout from "../components/layout/Layout";
import Login from "../pages/Login";
import SelectStore from "../pages/SelectStore";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Variants from "../pages/Variants";
import Stock from "../pages/Stock";
import StorePrices from "../pages/StorePrices";
import POS from "../pages/POS";
import Customers from "../pages/Customers";
import Suppliers from "../pages/Suppliers";
import Finance from "../pages/Finance";
import AllInsights from "../pages/AllInsights";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/select-store" element={<SelectStore />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="products" element={<Products />} />
        <Route path="variants" element={<Variants />} />
        <Route path="stock" element={<Stock />} />
        <Route path="store-prices" element={<StorePrices />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="finance" element={<Finance />} />
        <Route path="insights" element={<AllInsights />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
