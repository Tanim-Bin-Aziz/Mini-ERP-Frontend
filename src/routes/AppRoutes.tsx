import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { SalesPage } from '@/pages/sales/SalesPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { NotFoundPage, ForbiddenPage } from '@/pages/StatusPages';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute permission="dashboard:read">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute permission="product:read">
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute permission="customer:read">
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute permission="sale:read">
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute permission="role:manage">
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
