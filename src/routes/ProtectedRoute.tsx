import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { PermissionAction } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: PermissionAction | PermissionAction[];
}

export const ProtectedRoute = ({ children, permission }: ProtectedRouteProps) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};
