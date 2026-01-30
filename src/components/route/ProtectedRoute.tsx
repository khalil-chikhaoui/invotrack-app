/**
 * @fileoverview ProtectedRoute (Authentication Middleware)
 */

import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/common/LoadingState"; // Integrated Loader

const ProtectedRoute = () => {
  const { token, loading } = useAuth();
  const location = useLocation();

  /**
   * The Loading Gate:
   * Provides a full-screen branded transition while the AuthContext
   * validates the session.
   */
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <LoadingState 
          message="Establishing Session..." 
          minHeight="100vh" 
        />
      </div>
    );
  }

  /**
   * Access Control Logic:
   * Redirects unauthenticated users to /signin while preserving their intent.
   */
  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/signin" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;