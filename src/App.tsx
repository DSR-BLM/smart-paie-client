import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import EmployesPage from "./pages/employes/EmployesPage";
import PaiePage from "./pages/paie/PaiePage";
import ConfigPage from "./pages/config/ConfigPage";
import ExportsPage from "./pages/exports/ExportsPage";

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={
        isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />

      {/* Protected - App Layout */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/employes" element={
          <ProtectedRoute roles={["SUPER_ADMIN","ADMIN_ENTREPRISE","COMPTABLE"]}>
            <EmployesPage />
          </ProtectedRoute>
        } />

        <Route path="/paie" element={
          <ProtectedRoute roles={["SUPER_ADMIN","ADMIN_ENTREPRISE","COMPTABLE"]}>
            <PaiePage />
          </ProtectedRoute>
        } />

        <Route path="/exports" element={<ExportsPage />} />

        <Route path="/config" element={
          <ProtectedRoute roles={["SUPER_ADMIN"]}>
            <ConfigPage />
          </ProtectedRoute>
        } />

        <Route path="/entreprises" element={
          <ProtectedRoute roles={["SUPER_ADMIN"]}>
            {/* Page entreprises — simple placeholder */}
            <div className="card">
              <h1 className="text-2xl font-bold mb-4">Gestion des Entreprises</h1>
              <p className="text-gray-500">Multi-tenant : créez et gérez les entreprises clientes.</p>
            </div>
          </ProtectedRoute>
        } />
      </Route>

      {/* Redirections */}
      <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
