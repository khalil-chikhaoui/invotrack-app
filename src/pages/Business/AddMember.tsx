import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import CustomAlert from "../../components/common/CustomAlert";
import PermissionDenied from "../../components/common/PermissionDenied";
import { PaperPlaneIcon } from "../../icons";
import { businessApi } from "../../apis/business";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";
import { scrollToTopAppLayout } from "../../layout/AppLayout";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export default function AddMember() {
  const { t } = useTranslation("members");
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { canManageSettings } = usePermissions();

  // --- UI & Submission State ---
  const [loading, setLoading] = useState(false);
  const { alert, setAlert } = useAlert();

  // --- Form Data State ---
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "Viewer",
    title: "",
  });

  const triggerAlert = (data: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }) => {
    setAlert(data);
    scrollToTopAppLayout();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setLoading(true);
    setAlert(null);

    try {
      await businessApi.inviteMember(businessId, formData);

      triggerAlert({
        type: "success",
        title: t("messages.success_title"),
        message: t("messages.invitation_sent", { email: formData.email }),
      });

      setTimeout(() => {
        navigate(`/business/${businessId}/members`);
      }, 1800);
    } catch (error: any) {
      const errorCode = error.message;
      const translatedError = t(
        `errors.${errorCode}` as any,
        t("errors.INVITATION_FAILED"),
      );

      triggerAlert({
        type: "error",
        title: t("messages.error_title"),
        message: translatedError,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canManageSettings) {
    return (
      <PermissionDenied
        title={t("permissions.restricted_title")}
        description={t("permissions.restricted_desc")}
        actionText={t("actions.back")}
      />
    );
  }

  return (
    <>
      <PageMeta
        title={t("invite.title") + " | Invotrack"}
        description={t("invite.subtitle")}
      />

      <div className="w-full md:p-0 mt-4">
        {/* Navigation Control */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-[10px] font-semibold text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors uppercase tracking-widest"
        >
          <HiOutlineArrowLeft className="size-4" />
          {t("actions.back")}
        </button>
        <PageBreadcrumb pageTitle={t("invite.title")} />
        {/* Global Feedback Alert */}
        <CustomAlert data={alert} onClose={() => setAlert(null)} />

        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-300">
            {t("invite.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {/* Full Name */}
            <div className="sm:col-span-1">
              <Label>
                {t("invite.name_label")}{" "}
                <span className="text-error-500 dark:text-error-400">*</span>
              </Label>
              <Input
                type="text"
                placeholder={t("invite.name_placeholder")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Email Address */}
            <div className="sm:col-span-1">
              <Label>
                {t("invite.email_label")}{" "}
                <span className="text-error-500 dark:text-error-400">*</span>
              </Label>
              <Input
                type="email"
                placeholder={t("invite.email_placeholder")}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {/* Work Title */}
            <div className="sm:col-span-1">
              <Label>{t("invite.title_label")}</Label>
              <Input
                type="text"
                placeholder={t("invite.title_placeholder")}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Role Selection */}
            <div className="sm:col-span-1">
              <Label>
                {t("invite.role_label")}{" "}
                <span className="text-error-500 dark:text-error-400">*</span>
              </Label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="h-11 w-full appearance-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-white/90 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                >
                  <option value="Viewer">{t("roles.Viewer")}</option>
                  {/* FUTURE DEV <option value="Deliver">{t("roles.Deliver")}</option>*/}
                  <option value="Manager">{t("roles.Manager")}</option>
                  <option value="Admin">{t("roles.Admin")}</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 13.3333L5 8.33333L6.16667 7.16667L10 11L13.8333 7.16667L15 8.33333L10 13.3333Z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              className="text-[10px] uppercase font-semibold tracking-widest px-6"
              onClick={() => navigate(-1)}
            >
              {t("invite.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2  text-[10px] uppercase font-semibold tracking-widest px-6"
            >
              {loading ? t("invite.sending") : t("invite.submit")}
              <PaperPlaneIcon className="fill-current size-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
