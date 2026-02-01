import React, { useEffect } from "react";
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
  // 1. Use "business" namespace
  const { t } = useTranslation("business");

  const { user, logout, refreshUser } = useAuth();
  const { businessId: currentUrlId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex justify-center p-6 md:pt-9 relative">
      <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/20 mb-4">
            <HiOutlineOfficeBuilding className="text-white size-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            {/* 2. Dynamic Welcome Message */}
            <Trans
              i18nKey="select.welcome"
              t={t}
              values={{ name: user.name?.split(" ")[0] }}
              components={{ 1: <span className="text-brand-500" /> }}
            />
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
            {t("select.subtitle")}
          </p>
        </div>

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.memberships.map((membership: Membership) => {
            if (!membership.businessId) return null;
            const business = membership.businessId;
            const isActive = currentUrlId === business._id;

            return (
              <button
                type="button"
                key={business._id}
                onClick={() => handleSelect(business._id)}
                className={`group relative flex flex-col p-6 rounded-3xl transition-all duration-300 text-left overflow-hidden border ${
                  isActive
                    ? "bg-white dark:bg-slate-800 border-brand-500 ring-4 ring-brand-500/10"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:shadow-xl hover:shadow-brand-500/5"
                }`}
              >
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 overflow-hidden shadow-inner">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xl font-black text-brand-500 uppercase">
                        {business.name?.charAt(0)}
                      </div>
                    )}
                  </div>

                  {isActive ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-semibold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                      {t("select.active")}
                    </span>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 group-hover:bg-brand-500 text-slate-500 group-hover:text-white transition-colors duration-300">
                      <HiArrowRight className="size-4" />
                    </div>
                  )}
                </div>

                <div className="relative z-10">
                  <h3 className="font-semibold text-xl text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors tracking-tight">
                    {business.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {membership.role}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="text-xs font-medium text-slate-400">
                      {membership.title || t("select.default_title")}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Add New Business Card */}
          <button
            type="button"
            onClick={() => navigate("/create-business")}
            className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
              <HiPlus className="size-6" />
            </div>
            <span className="font-semibold text-sm text-slate-500 dark:text-slate-400 group-hover:text-brand-600 uppercase tracking-widest">
              {t("select.create_new")}
            </span>
          </button>
        </div>

        {/* Action Footer */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 font-semibold text-xs border border-brand-200 dark:border-brand-800/50">
              {user.name?.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-tighter">
                {user.email}
              </p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                {t("select.authorized_user")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-300 uppercase tracking-widest transition-all"
          >
            <HiOutlineLogout className="size-4" />
            {t("select.sign_out")}
          </button>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
