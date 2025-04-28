import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Correct path assuming context is in src/contexts
import { Spinner } from '../common/Spinner';

const ProtectedRoutes: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Show a loading spinner while checking auth state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="h-12 w-12 text-sky-600 dark:text-sky-400" />
      </div>
    );
  }

  // If loading is finished and no user, redirect to login
  if (!currentUser) {
    console.log('ProtectedRoutes: No user found, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render the child route components
  console.log('ProtectedRoutes: User found, rendering Outlet');
  return <Outlet />;
};

export default ProtectedRoutes;
