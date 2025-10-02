import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to splash page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;