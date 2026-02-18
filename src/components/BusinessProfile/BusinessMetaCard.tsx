/**
 * @fileoverview BusinessMetaCard Component
 */

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import {
  HiOutlineCamera,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

import { BusinessData, businessApi } from "../../apis/business";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";

import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Label from "../form/Label";
import LanguageInput from "../form/LanguageInput";
import ConfirmModal from "../common/ConfirmModal";

export default function BusinessMetaCard({
  business,
  refresh,
  setAlert,
}: {
  business: BusinessData;
  refresh: () => void;
  setAlert: (alert: any) => void;
}) {
  const { t } = useTranslation("business");
  const { businessId } = useParams();
  const { user, login, token } = useAuth();
  const { isAdmin } = usePermissions();

  // --- Modals ---
  const {
    isOpen: isEditOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();

  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [langUpdating, setLangUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Form Data ---
  const [formData, setFormData] = useState({
    name: business.name,
    legalName: business.legalName || "",
    description: business.description || "",
  });

  useEffect(() => {
    setFormData({
      name: business.name,
      legalName: business.legalName || "",
      description: business.description || "",
    });
  }, [business]);

  // --- Helpers ---
  const updateGlobalUserLogo = (newLogo: string) => {
    if (!user) return;
    const updatedMemberships = user.memberships.map((m: any) => {
      if (m.businessId._id === businessId) {
        return { ...m, businessId: { ...m.businessId, logo: newLogo } };
      }
      return m;
    });
    login(token!, { ...user, memberships: updatedMemberships });
  };

  // --- Handlers ---
  const handleUploadClick = () => {
    if (!uploading && !deleting && isAdmin) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;

    if (!file.type.startsWith("image/")) {
      setAlert({
        type: "error",
        title: "Error",
        message: t("errors.UPLOAD_INVALID_TYPE", {
          defaultValue: "Invalid file type",
        }),
      });
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      const data: any = await businessApi.uploadLogo(businessId, fd);
      updateGlobalUserLogo(data.logo);
      setAlert({
        type: "success",
        title: t("messages.BRANDING_UPDATED"),
        message: t("messages.LOGO_UPLOADED"),
      });
      refresh();
    } catch (error: any) {
      const errorCode = error.message;
      setAlert({
        type: "error",
        title: t("errors.SYNC_FAILED"),
        message: t(
          `errors.${errorCode}` as any,
          t("errors.LOGO_UPLOAD_FAILED"),
        ),
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmDeleteLogo = async () => {
    if (!businessId) return;
    setDeleting(true);
    try {
      await businessApi.deleteLogo(businessId);
      updateGlobalUserLogo("");
      setAlert({
        type: "info",
        title: t("messages.ASSET_PURGED"),
        message: t("messages.LOGO_REMOVED"),
      });
      refresh();
      closeDeleteModal();
    } catch (error: any) {
      const errorCode = error.message;
      setAlert({
        type: "error",
        title: t("errors.REMOVAL_FAILED"),
        message: t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")),
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleLanguageUpdate = async (newLang: string) => {
    if (!businessId) return;
    setLangUpdating(true);
    try {
      await businessApi.updateBusiness(businessId, { language: newLang });
      setAlert({
        type: "success",
        title: t("messages.SETTINGS_SAVED"),
        message: t("messages.LANGUAGE_UPDATED"),
      });
      refresh();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: t("errors.UPDATE_FAILED"),
        message: error.message,
      });
    } finally {
      setLangUpdating(false);
    }
  };

  const handleSaveText = async () => {
    setLoading(true);
    try {
      await businessApi.updateBusiness(business._id, formData);
      setAlert({
        type: "success",
        title: t("messages.SETTINGS_SAVED"),
        message: t("messages.BUSINESS_UPDATED"),
      });
      refresh();
      closeEditModal();
    } catch (error: any) {
      const errorCode = error.message;
      setAlert({
        type: "error",
        title: t("errors.UPDATE_FAILED"),
        message: t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* LOGO DISPLAY */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg shadow-gray-200/50 dark:shadow-black/20 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              {uploading ? (
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              ) : business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold text-gray-300 dark:text-gray-500 uppercase">
                  {business.name?.charAt(0)}
                </span>
              )}
            </div>
          </div>

          {/* INFO & ACTIONS */}
          <div className="flex-1 w-full flex flex-col items-center sm:items-start text-center sm:text-left pt-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {business.name}
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded dark:bg-green-500/20 dark:text-green-400 uppercase tracking-wide">
                {business.status || "Active"}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
              {business.legalName || business.name}
            </p>

            {isAdmin && (
              <div className="mt-3 flex flex-col w-full sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUploadClick}
                    disabled={uploading || deleting}
                    className="gap-2 h-9 flex-1 sm:flex-none"
                  >
                    <HiOutlineCamera className="size-4" />
                    {t("meta_card.upload_btn")}
                  </Button>
                  {business.logo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openDeleteModal}
                      disabled={uploading || deleting}
                      className="gap-2 h-9 flex-1 sm:flex-none text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                    >
                      <HiOutlineTrash className="size-4" />
                      {t("meta_card.remove_btn")}
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openEditModal}
                    disabled={uploading || deleting}
                    className="gap-2 h-9 w-full sm:w-auto bg-gray-50 dark:bg-gray-800"
                  >
                    <HiOutlinePencilSquare className="size-4" />
                    {t("meta_card.edit_btn")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- LANGUAGE ROW --- */}
        <div className="pt-5 border-t border-gray-100 dark:border-white/5">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="w-full md:max-w-xs shrink-0">
              <LanguageInput
                label={t("settings.general.form.language_label")}
                value={business.language || "en"}
                onChange={handleLanguageUpdate}
                
              />
            </div>
            {/* Helper text  */}
            <div className="pb-3">
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 ">
                {t("settings.general.form.language_helper")}
              </p>
              {langUpdating && (
                <span className="text-[10px] font-semibold text-brand-500 animate-pulse uppercase block mt-1">
                  {t("settings.general.form.synchronizing")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDeleteLogo}
        title={t("modals.remove_logo_title")}
        description={t("modals.remove_logo_desc")}
        confirmText={t("modals.confirm_remove")}
        variant="danger"
        isLoading={deleting}
      />

      <Modal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        className="max-w-[600px] m-4"
      >
        <div className="p-6 lg:p-8 bg-white dark:bg-gray-900 rounded-2xl text-start">
          <h4 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("settings.general.cards.edit_identity_title")}
          </h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveText();
            }}
            className="space-y-5"
          >
            <div>
              <Label>{t("settings.general.form.name_label")}</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>{t("settings.general.form.legal_name_label")}</Label>
              <Input
                value={formData.legalName}
                onChange={(e) =>
                  setFormData({ ...formData, legalName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>{t("settings.general.form.desc_label")}</Label>
              <TextArea
                value={formData.description}
                onChange={(val) =>
                  setFormData({ ...formData, description: val })
                }
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={closeEditModal}>
                {t("settings.general.form.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? t("settings.general.form.synchronizing")
                  : t("settings.general.form.save")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}