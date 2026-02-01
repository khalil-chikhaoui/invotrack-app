/**
 * @fileoverview PublicRoute (Guest Guard)
 */

import { Navigate, Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/common/LoadingState";

export default function PublicRoute() {
  const { t } = useTranslation("common");
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <LoadingState
          message={t("auth_guards.syncing_session")}
          minHeight="100vh"
        />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
