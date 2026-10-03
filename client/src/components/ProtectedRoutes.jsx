import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const CitizenRoute = () => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/citizen/login" replace />;
};

export const AdminRoute = () => {
  const { isLoggedIn, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isLoggedIn && role === 'admin' ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace />
  );
};
