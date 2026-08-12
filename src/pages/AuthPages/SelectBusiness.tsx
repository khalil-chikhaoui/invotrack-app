import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation, Trans } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import {
  HiArrowRight,
  HiOutlineLogout,
  HiOutlineOfficeBuilding,
  HiPlus,
} from "react-icons/hi";

interface Business {
  _id: string;
  name: string;
  logo?: string;
}

interface Membership {
  businessId: Business;
  role: string;
  title?: string;
}

export default function SelectBusiness() {
  const { t } = useTranslation("business");
  const { user, logout, refreshUser } = useAuth();
  const { businessId: currentUrlId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user && user.memberships && user.memberships.length === 0) {
      navigate("/create-business");
    }
  }, [user, navigate]);

  const handleSelect = (id: string) => {
    navigate(`/business/${id}`);
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate("/signin");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative overflow-hidden flex flex-col items-center justify-center p-6 transition-colors duration-500">
      <div className="w-full max-w-5xl z-10 relative">
        {/* --- Header Section --- */}
        <div className="flex flex-col items-center text-center mb-10 space-y-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl  border border-gray-100 dark:border-gray-700/50 mb-2">
            <HiOutlineOfficeBuilding className="size-8 text-brand-500" />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-white tracking-tight">
            <Trans
              i18nKey="select.welcome"
              t={t}
              values={{ name: user.name?.split(" ")[0] }}
              components={{
                1: <span className="text-brand-500" />,
              }}
            />
          </h1>

          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 font-medium max-w-lg leading-relaxed">
            {t("select.subtitle")}
          </p>
        </div>

        {/* --- Grid Layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {user.memberships.map((membership: Membership) => {
            if (!membership.businessId) return null;
            const business = membership.businessId;
            const isActive = currentUrlId === business._id;
            const isHovered = hoveredId === business._id;

            return (
              <button
                type="button"
                key={business._id}
                onClick={() => handleSelect(business._id)}
                onMouseEnter={() => setHoveredId(business._id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  group relative flex flex-col p-5 h-48 rounded-[1.5rem] text-left transition-all duration-300 ease-out
                  border
                  ${
                    isActive
                      ? "bg-white dark:bg-gray-800 border-brand-500 ring-4 ring-brand-500/10 dark:ring-brand-500/20"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                  }
                `}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-auto">
                  <div
                    className={`
                    w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors duration-300 flex items-center justify-center
                    ${isActive ? "border-brand-500" : "border-gray-100 dark:border-gray-700 group-hover:border-brand-200 dark:group-hover:border-brand-500/30"}
                    bg-gray-50 dark:bg-gray-900
                  `}
                  >
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-500 dark:text-gray-400 group-hover:text-brand-500 transition-colors">
                        {business.name?.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <div
                    className={`
                    w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                    ${isHovered ? "bg-brand-500 text-white rotate-0" : "bg-gray-50 dark:bg-gray-700 text-gray-500 -rotate-45"}
                  `}
                  >
                    <HiArrowRight className="size-4" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="relative z-10 mt-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-0.5 truncate pr-4">
                    {business.name}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                      {membership.role}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {membership.title || t("select.default_title")}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* --- "Create New" Card --- */}
          <button
            type="button"
            onClick={() => navigate("/create-business")}
            // REDUCED HEIGHT: Changed h-64 to h-48 to match cards
            className="group relative flex flex-col items-center justify-center h-48 p-5 rounded-[1.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500/50 bg-transparent hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-500 group-hover:text-white text-gray-500 flex items-center justify-center mb-3 transition-all duration-300">
              <HiPlus className="size-6" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400">
              {t("select.create_new")}
            </span>
            <span className="text-xs text-gray-500 mt-1 text-center max-w-[80%]">
              Start a new organization
            </span>
          </button>
        </div>

        {/* --- Footer Profile Bar --- */}
        <div className="mt-12 flex justify-center w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
          <div
            className="
    flex items-center gap-2 p-1.5 pr-4 
    bg-white dark:bg-gray-900 
    border border-gray-100 dark:border-gray-800
     
    /* MOBILE: Full width and slightly squarer corners */
    w-full rounded-2xl
    /* DESKTOP: Back to auto-width and pill shape */
    sm:w-auto sm:rounded-full
  "
          >
            <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user.name?.charAt(0)}
            </div>

            {/* Using flex-1 to push the signout button to the right on mobile */}
            <div className="flex flex-col px-1 overflow-hidden flex-1 sm:flex-none">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-tight truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-gray-500 font-medium truncate">
                {user.email}
              </span>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0"
              title={t("select.sign_out")}
            >
              <HiOutlineLogout className="size-4" />
              <span className="hidden sm:inline">{t("select.sign_out")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- Floating Theme Toggler --- */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
