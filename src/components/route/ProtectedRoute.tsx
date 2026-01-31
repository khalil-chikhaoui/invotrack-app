/**
 * @fileoverview ProtectedRoute (Authentication Middleware)
 */

import { Navigate, Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next"; // <--- Import Hook
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/common/LoadingState";

const ProtectedRoute = () => {
  const { t } = useTranslation("common"); // <--- Load namespace
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return ( 
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <LoadingState 
          message={t("auth_guards.establishing_session")} 
          minHeight="100vh" 
        />
      </div>
    );
  }

  return token ? (
    <Outlet />
  ) : (
    <Navigate to="/signin" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;