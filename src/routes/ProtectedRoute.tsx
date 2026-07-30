import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/feedback/PageLoader';
import { UserRole, Permission } from '../types/auth';

export interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader message="Verifying security credentials..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'super_admin') {
    return <Navigate to="/auth/unauthorized" replace />;
  }

  if (
    requiredPermission &&
    !user.permissions.includes(requiredPermission) &&
    user.role !== 'super_admin'
  ) {
    return <Navigate to="/auth/unauthorized" replace />;
  }

  return children;
};
