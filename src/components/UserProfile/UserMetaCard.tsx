/**
 * @fileoverview UserMetaCard Component
 * Displays user profile info and handles avatar management via explicit buttons.
 */

import { useState, useRef } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../hooks/useModal";
import ConfirmModal from "../common/ConfirmModal";
import { authApi } from "../../apis/auth";
import { 
  HiOutlineCamera, 
  HiOutlineTrash, 
  HiOutlineUser 
} from "react-icons/hi2";
import Button from "../ui/button/Button";


export default function UserMetaCard({
  setAlert,
}: {
  setAlert: (alert: any) => void;
}) {
  const { t } = useTranslation("user");
  const { user, login, token } = useAuth();
  const { businessId } = useParams();

  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleUploadClick = () => {
    if (!uploading && !deleting) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setAlert({
        type: "error",
        title: "Error",
        message: t("errors.UPLOAD_INVALID_TYPE"),
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const data = await authApi.uploadAvatar(formData);
      login(token!, data.user || { ...user, profileImage: data.profileImage });

      setAlert({
        type: "success",
        title: t("messages.photo_updated_title"),
        message: t("messages.photo_updated_body"),
      });
    } catch (error: any) {
      const errorCode = error.message;
      setAlert({
        type: "error",
        title: "Error",
        message: t(`errors.${errorCode}` as any, t("errors.UPLOAD_FAILED")),
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const data = await authApi.deleteAvatar();
      login(token!, data.user);

      setAlert({
        type: "info",
        title: t("messages.photo_removed_title"),
        message: t("messages.photo_removed_body"),
      });
      closeDeleteModal();
    } catch (error: any) {
      const errorCode = error.message;
      setAlert({
        type: "error",
        title: "Error",
        message: t(`errors.${errorCode}` as any, t("errors.DELETE_FAILED")),
      });
    } finally {
      setDeleting(false);
    }
  };

  const activeMembership = user.memberships?.find(
    (m: any) => m.businessId?._id === businessId,
  );

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 ">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* --- AVATAR DISPLAY (Static & Clean) --- */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg shadow-gray-200/50 dark:shadow-black/20 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {uploading ? (
                 <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              ) : user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <HiOutlineUser className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            {/* Status Indicator (Optional) */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full" title="Active"></div>
          </div>

          {/* --- USER INFO & ACTIONS --- */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left pt-2">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {user.name}
            </h4>
            
            <div className="mt-1 flex flex-col sm:flex-row items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
               <span>{user.email}</span>
               {activeMembership && (
                 <>
                  <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                  <span className="font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                    {activeMembership.title}
                  </span>
                 </>
               )}
            </div>

            {/* --- ACTION BUTTONS ROW --- */}
            <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
              />

              {/* Upload Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUploadClick}
                disabled={uploading || deleting}
                className="gap-2 h-9"
              >
                <HiOutlineCamera className="size-4" />
                {t("meta_card.upload_btn", { defaultValue: "Change Photo" })}
              </Button>

              {/* Delete Button (Only if image exists) */}
              {user.profileImage && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={openDeleteModal}
                  disabled={uploading || deleting}
                  className="gap-2 h-9 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-500/20"
                >
                  <HiOutlineTrash className="size-4" />
                  {t("meta_card.remove_btn", { defaultValue: "Remove" })}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("meta_card.modal.title")}
        description={t("meta_card.modal.description")}
        confirmText={t("meta_card.modal.confirm_button")}
        variant="danger"
        isLoading={deleting}
      />
    </>
  );
}