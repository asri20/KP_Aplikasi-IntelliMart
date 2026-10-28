import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useAuthStore } from "./store/authStore";
import { useStoreStore } from "./store/storeStore";

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const loadStores = useStoreStore((s) => s.loadStores);

  useEffect(() => {
    initialize().then(() => loadStores());
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
