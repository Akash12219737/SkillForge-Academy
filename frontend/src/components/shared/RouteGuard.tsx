import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface GuardProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'INSTRUCTOR' | 'ADMIN')[];
}

export const RouteGuard: React.FC<GuardProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // If auth is loading, we render a global loading block
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If not authenticated, redirect to home page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If roles are specified and user role is not allowed, redirect to home page
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
