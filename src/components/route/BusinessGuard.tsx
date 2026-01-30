/**
 * @fileoverview BusinessGuard (Route Middleware)
 * Protects business-specific sub-routes (/b/:businessId/*).
 * Features:
 * 1. URL-Based Authorization: Extracts businessId from the route parameters.
 * 2. Membership Verification: Cross-references the user's membership array with the URL ID.
 * 3. Fallback Navigation: Silently redirects unauthorized users to the business selection hub.
 * 4. Loading State Handling: Prevents "Flash of Unauthenticated Content" (FOUC) during auth verification.
 */

import { Navigate, Outlet, useParams } from "react-router";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../common/LoadingState";

const BusinessGuard = () => {
  const { businessId } = useParams();
  const { user, loading } = useAuth();

  /**
   * While the Auth session is being initialized, we return null.
   * This prevents the Guard from incorrectly redirecting the user before
   * their memberships are loaded.
   */
if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingState
          message="Verifying business access..." 
          minHeight="100vh" 
        />
      </div>
    );
  }
  /**
   * Authorization Logic:
   * Checks if any entry in the user's membership list matches the current URL ID.
   * Note: We use optional chaining and .some() for a high-performance check.
   */
  const isMember = user?.memberships.some(
    (m) => m.businessId._id === businessId,
  );

  if (!isMember) {
    // Audit log for security monitoring
    console.warn(
      `[Security] Unauthorized access attempt to Business ID: ${businessId}. Redirecting user.`,
    );

    /**
     * Redirect to the selection hub.
     */
    return <Navigate to="/select-business" replace />;
  }

  // User is authorized. Render the requested nested route (Dashboard, Invoices, etc.)
  return <Outlet />;
};

export default BusinessGuard;
