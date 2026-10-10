import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";

import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductFormPage from "./pages/ProductFormPage";
import CategoriesPage from "./pages/CategoriesPage";
import IncomingStockPage from "./pages/IncomingStockPage";
import OutgoingStockPage from "./pages/OutgoingStockPage";
import MovementsHistoryPage from "./pages/MovementsHistoryPage";
import StocktakingPage from "./pages/StocktakingPage";
import LowStockPage from "./pages/LowStockPage";
import SuppliersPage from "./pages/SuppliersPage";
import RecipientsPage from "./pages/RecipientsPage";
import ReportsPage from "./pages/ReportsPage";
import ProductLedgerPage from "./pages/ProductLedgerPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import BackupsPage from "./pages/BackupsPage";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/edit/:id" element={<ProductFormPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="movements/in" element={<IncomingStockPage />} />
              <Route path="movements/out" element={<OutgoingStockPage />} />
              <Route path="movements" element={<MovementsHistoryPage />} />
              <Route path="stocktaking" element={<StocktakingPage />} />
              <Route path="low-stock" element={<LowStockPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="recipients" element={<RecipientsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/ledger/:productId" element={<ProductLedgerPage />} />

              {/* Admin Only */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="backups"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <BackupsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
