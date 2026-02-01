/**
 * @fileoverview BusinessGuard (Route Middleware)
 */

import { Navigate, Outlet, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/common/LoadingState";

const BusinessGuard = () => {
  const { t } = useTranslation("common");
  const { businessId } = useParams();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingState
          message={t("auth_guards.verifying_access")}
          minHeight="100vh"
        />
      </div>
    );
  }

  const isMember = user?.memberships.some(
    (m) => m.businessId._id === businessId,
  );

  if (!isMember) {
    console.warn(
      `[Security] Unauthorized access attempt to Business ID: ${businessId}. Redirecting user.`,
    );
    return <Navigate to="/select-business" replace />;
  }

  return <Outlet />;
};

export default BusinessGuard;
