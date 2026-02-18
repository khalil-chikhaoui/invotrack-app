/**
 * @fileoverview BusinessLegalCard Component
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BusinessData, businessApi } from "../../apis/business";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { usePermissions } from "../../hooks/usePermissions";

export default function BusinessLegalCard({
  business,
  refresh,
  setAlert,
}: {
  business: BusinessData;
  refresh: () => void;
  setAlert: (alert: any) => void;
}) {
  const { t } = useTranslation("business");
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const { isAdmin } = usePermissions();

  const [formData, setFormData] = useState({
    taxId: business.taxId || "",
    registrationNumber: business.registrationNumber || "",
    email: business.email || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await businessApi.updateBusiness(business._id, formData);
      setAlert({
        type: "success",
        title: t("messages.SETTINGS_SAVED"),
        message: t("messages.REGISTRY_UPDATED"),
      });
      refresh();
      closeModal();
    } catch (error: any) {
      const errorCode = error.message;
      setAlert({
        type: "error",
        title: t("errors.SYNC_FAILED"),
        message: t(`errors.${errorCode}` as any, t("errors.UPDATE_FAILED")),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 text-start">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white  tracking-wide">
          {t("settings.general.cards.legal_title")}
        </h4>
        {isAdmin && (
          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700  hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300  tracking-widest transition-all"
          >
            {t("settings.general.form.edit")}
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-800">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            {t("settings.general.cards.tax_label")}
          </span>
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {business.taxId || t("settings.general.cards.unset")}
          </span>
        </div>

        <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-800">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            {t("settings.general.cards.reg_label")}
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {business.registrationNumber ||
              t("settings.general.cards.not_registered")}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            {t("settings.general.cards.billing_email_label")}
          </span>
          <span className="text-sm font-semibold text-brand-500 dark:text-brand-300 hover:underline cursor-pointer">
            {business.email}
          </span>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="p-6 lg:p-11 bg-white dark:bg-gray-900 rounded-3xl text-start">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
            {t("settings.general.cards.legal_update_title")}
          </h4>
          <p className="text-xs font-medium text-gray-500 mb-8 uppercase tracking-widest">
            {t("settings.general.cards.legal_subtitle")}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-4"
          >
            <div>
              <Label>{t("settings.general.cards.tax_label")}</Label>
              <Input
                placeholder={t("create.form.tax_placeholder")}
                value={formData.taxId}
                onChange={(e) =>
                  setFormData({ ...formData, taxId: e.target.value })
                }
              />
            </div>

            <div>
              <Label>{t("settings.general.cards.reg_label")}</Label>
              <Input
                placeholder="Official business ID"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationNumber: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>{t("settings.general.cards.billing_email_label")}</Label>
              <Input
                type="email"
                placeholder={t("create.form.email_placeholder")}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <p className="mt-2 text-[10px] text-gray-600 dark:text-gray-300 font-medium italic">
                {t("settings.general.cards.billing_help")}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-10">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="text-[10px] font-semibold uppercase tracking-widest"
              >
                {t("settings.general.form.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="text-[10px] font-semibold uppercase tracking-widest"
              >
                {loading
                  ? t("settings.general.form.synchronizing")
                  : t("settings.general.form.apply_updates")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
