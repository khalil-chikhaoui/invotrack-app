/**
 * @fileoverview UserProfiles Page
 * The central hub for user account management.
 */

import { useState } from "react"; // Added useState
import { useNavigate } from "react-router";
import { HiOutlineArrowRightOnRectangle, HiOutlineKey } from "react-icons/hi2"; // Added Key Icon

import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import CustomAlert from "../components/common/CustomAlert";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../hooks/useAlert";
import { authApi } from "../apis/auth"; // Import API
import { scrollToTopAppLayout } from "../layout/AppLayout";

export default function UserProfiles() {
  const { logout, user } = useAuth(); // Destructure 'user' to get the email
  const navigate = useNavigate();
  const { alert, setAlert } = useAlert();
  const [loadingReset, setLoadingReset] = useState(false); // State for the button

  /**
   * Secure Sign-Out
   */
  const handleSignOut = () => {
    logout();
    navigate("/signin");
  };

  /**
   * Trigger Password Reset Email
   * Uses the logged-in user's email to send the reset link.
   */
  const handleSendPasswordReset = async () => {
    if (!user?.email) {
      setAlert({
        type: "error",
        title: "Error",
        message: "Could not find your email address.",
      });
      return;
    }

    setLoadingReset(true);

    try {
      // Reuse the existing public forgot-password endpoint
      await authApi.forgotPassword(user.email);

      setAlert({
        type: "success",
        title: "Email Sent",
        message: `A password reset link has been sent to ${user.email}. Please check your inbox.`,
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Request Failed",
        message: error.message || "Unable to send reset link.",
      });
    } finally {
      setLoadingReset(false);
      scrollToTopAppLayout()
    }
  };

  return (
    <>
      <PageMeta
        title="My Profile | Invotrack"
        description="Manage your personal account settings."
      />

      <PageBreadcrumb pageTitle="My Profile" />

      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-10">
        <div className="space-y-3">
          <UserMetaCard setAlert={setAlert} />
          <UserInfoCard setAlert={setAlert} />

          {/* Action Buttons Area */}
          <div className="flex flex-col sm:flex-row justify-end pt-6 gap-3 ">
            {/* 1. Change Password Button */}
            <button
              onClick={handleSendPasswordReset}
              disabled={loadingReset}
              className="group cursor-pointer relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ease-out
                w-full sm:w-auto
                border border-gray-200 bg-white text-gray-700
                dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300
                hover:border-brand-500 hover:text-brand-600 dark:hover:border-brand-500 dark:hover:text-brand-400
                
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiOutlineKey
                className={`w-4 h-4 ${loadingReset ? "animate-pulse" : ""}`}
              />
              <span className="font-medium text-sm">
                {loadingReset ? "Sending Link..." : "Change Password"}
              </span>
            </button>

            {/* 2. Sign Out Button */}
            <button
              onClick={handleSignOut}
              aria-label="Sign out of your account"
              className="group cursor-pointer relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ease-out
                w-full sm:w-auto
                border border-red-100 bg-red-50 text-red-600
                dark:border-red-600/20 dark:bg-red-600/10 dark:text-red-400
                hover:bg-red-600 hover:border-red-600 hover:text-white 
                dark:hover:bg-red-800 dark:hover:border-red-600 dark:hover:text-white
                
                "
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
