/**
 * @fileoverview UserProfiles Page
 * The central hub for user account management.
 * Orchestrates personal meta-data, account details, and secure session termination.
 */

import { useNavigate } from "react-router"; // Removed useState, useEffect imports
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import CustomAlert from "../components/common/CustomAlert";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../hooks/useAlert";

export default function UserProfiles() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { alert, setAlert } = useAlert(); 

  /**
   * Secure Sign-Out:
   * Clears global auth context and redirects user to the authentication entry point.
   */
  const handleSignOut = () => {
    logout();
    navigate("/signin");
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

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSignOut}
              aria-label="Sign out of your account"
              className="group cursor-pointer relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ease-out
                w-full sm:w-auto
                border border-red-100 bg-red-50 text-red-600
                dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400
                hover:bg-red-500 hover:border-red-500 hover:text-white 
                dark:hover:bg-red-600 dark:hover:border-red-600 dark:hover:text-white
                hover:shadow-lg hover:shadow-red-500/20 dark:hover:shadow-red-900/30
                hover:-translate-y-0.5 active:translate-y-0"
            >
              <HiOutlineArrowRightOnRectangle className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
              <span className="font-semibold tracking-wide text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}