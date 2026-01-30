/**
 * @fileoverview PublicRoute (Guest Guard)
 */

import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/common/LoadingState"; // Integrated Loader

export default function PublicRoute() {
  const { token, loading } = useAuth();

  /**
   * The Initialization Gate:
   * Prevents rendering guest content before the Auth handshake is complete.
   */
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <LoadingState 
          message="Syncing session..." 
          minHeight="100vh" 
        />
      </div>
    );
  }

  /**
   * Redirect Logic:
   * Already authenticated users are bounced to the internal dashboard.
   */
  if (token) {
    return <Navigate to="/" replace />;
  }

  /**
   * Render Guest Content (Sign In / Register)
   */
  return <Outlet />;
}