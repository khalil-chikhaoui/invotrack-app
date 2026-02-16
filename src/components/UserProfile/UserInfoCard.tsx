/**
 * @fileoverview UserInfoCard Component
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { authApi } from "../../apis/auth";

export default function UserInfoCard({
  setAlert,
}: {
  setAlert: (alert: any) => void;
}) {
  const { t } = useTranslation("user");
  const { user, login, token } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const nameParts = user.name ? user.name.split(" ") : ["", ""];
  const [formData, setFormData] = useState({
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      };
      const data = await authApi.updateProfile(payload);

      login(token!, data.user);

      setAlert({
        type: "success",
        title: t("messages.details_saved_title"),
        message: t("messages.details_saved_body"),
      });
      closeModal();
    } catch (error: any) {
      const errorCode = error.message;
      const translatedError = t(
        `errors.${errorCode}` as any,
        t("errors.UPDATE_FAILED"),
      );

      setAlert({
        type: "error",
        title: t("status.error", { defaultValue: "Error" }),
        message: translatedError,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 ">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            {t("info_card.title")}
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 xl:gap-7">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                {t("info_card.full_name")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.name}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                {t("info_card.email")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 lg:inline-flex"
        >
          {t("info_card.edit_button")}
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-11">
          <h4 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white/90">
            {t("info_card.modal.title")}
          </h4>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <Label>{t("info_card.modal.first_name")}</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="e.g. John"
                />
              </div>
              <div>
                <Label>{t("info_card.modal.last_name")}</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="e.g. Doe"
                />
              </div>

              <div className="lg:col-span-2">
                <Label>{t("info_card.modal.email_label")}</Label>
                <Input
                  value={user.email}
                  disabled
                  className="opacity-70 cursor-not-allowed bg-gray-50 dark:bg-white/[0.03]"
                />
                <p className="mt-2 text-xs text-gray-400">
                  {t("info_card.modal.email_help")}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button type="button" variant="outline" onClick={closeModal}>
                {t("info_card.modal.close")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? t("info_card.modal.saving")
                  : t("info_card.modal.save")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
