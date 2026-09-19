
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import OwnerDashboard from "./pages/OwnerDashboard";
import SplashScreen from "./pages/SplashScreen";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/splash" replace />} />
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/success" element={<RegisterSuccess />} />

      <Route element={<ProtectedRoute role="OWNER" />}>
        <Route path="/dashboard/owner" element={<OwnerDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  );
}
