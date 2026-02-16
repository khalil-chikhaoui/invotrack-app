/**
 * @fileoverview UserProfiles Page
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowRightOnRectangle, HiOutlineKey } from "react-icons/hi2";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserMetaCard from "../../components/UserProfile/UserMetaCard";
import UserInfoCard from "../../components/UserProfile/UserInfoCard";
import LanguageSelector from "../../components/common/LanguageSelector";
import PageMeta from "../../components/common/PageMeta";
import CustomAlert from "../../components/common/CustomAlert";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../hooks/useAlert";
import { authApi } from "../../apis/auth";
import { scrollToTopAppLayout } from "../../layout/AppLayout";

export default function UserProfiles() {
  const { t, i18n } = useTranslation("user");
  const { logout, user, setUser } = useAuth();
  const navigate = useNavigate();
  const { alert, setAlert } = useAlert();
  const [loadingReset, setLoadingReset] = useState(false);

  const triggerAlert = (data: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }) => {
    setAlert(data);
    scrollToTopAppLayout();
  };

  const handleSignOut = () => {
    logout();
    navigate("/signin");
  };

  const handleLanguageChange = async (lang: string) => {
    // 1. Visual update
    i18n.changeLanguage(lang);

    // 2. Persist to backend
    if (user && user.language !== lang) {
      try {
        await authApi.updateProfile({ language: lang });
        setUser({ ...user, language: lang });

        triggerAlert({
          type: "success",
          title: t("messages.language_updated_title", { lng: lang }),
          message: t("messages.language_updated_body", { lng: lang }),
        });
      } catch (err) {
        console.error("Failed to persist language preference", err);
      }
    }
  };

  // --- 3. PASSWORD RESET LOGIC ---
  const handleSendPasswordReset = async () => {
    if (!user?.email) {
      triggerAlert({
        type: "error",
        title: t("status.error", { defaultValue: "Error" }),
        message: t("errors.AUTH_USER_NOT_FOUND"),
      });
      return;
    }

    setLoadingReset(true);

    try {
      await authApi.forgotPassword(user.email);

      triggerAlert({
        type: "success",
        title: t("messages.email_sent_title"),
        message: t("messages.email_sent_body", { email: user.email }),
      });
    } catch (error: any) {
      const errorCode = error.message;
      const translatedError = t(
        `errors.${errorCode}` as any,
        t("errors.RESET_LINK_FAILED"),
      );

      triggerAlert({
        type: "error",
        title: t("status.error", { defaultValue: "Error" }),
        message: translatedError,
      });
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <>
      <PageMeta title={t("meta.title")} description={t("meta.description")} />

      <PageBreadcrumb pageTitle={t("breadcrumb")} />

      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="rounded-2xl border border-gray-200  p-5 dark:border-gray-800  lg:p-6 mb-10">
        <div className="space-y-3">
          <UserMetaCard setAlert={triggerAlert} />
          <UserInfoCard setAlert={triggerAlert} />

          {/* --- Language Preferences --- */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6  mt-3">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              {t("preferences.title")}
            </h4>
            <div className="max-w-xs">
              <LanguageSelector
                value={i18n.language ? i18n.language.split("-")[0] : "en"}
                onChange={handleLanguageChange}
                label={t("preferences.language_label")}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end pt-6 gap-3 ">
            <button
              onClick={handleSendPasswordReset}
              disabled={loadingReset}
              className="group cursor-pointer relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ease-out w-full sm:w-auto border border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:border-brand-500 hover:text-brand-600 dark:hover:border-brand-500 dark:hover:text-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiOutlineKey
                className={`w-4 h-4 ${loadingReset ? "animate-pulse" : ""}`}
              />
              <span className="font-medium text-sm">
                {loadingReset
                  ? t("actions.sending_link")
                  : t("actions.change_password")}
              </span>
            </button>

            <button
              onClick={handleSignOut}
              className="group cursor-pointer relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ease-out w-full sm:w-auto border border-red-100 bg-red-50 text-red-600 dark:border-red-600/20 dark:bg-red-600/10 dark:text-red-400 hover:bg-red-600 hover:border-red-600 hover:text-white dark:hover:bg-red-800 dark:hover:border-red-600 dark:hover:text-white"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              <span className="font-medium text-sm">
                {t("actions.sign_out")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
