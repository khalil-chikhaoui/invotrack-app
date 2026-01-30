/**
 * @fileoverview UserMetaCard Component
 * Handles the visual identity of the user profile, including:
 * 1. Avatar asset management (Upload via multipart/form-data & Delete).
 * 2. Real-time profile state synchronization with AuthContext.
 * 3. Context-aware role display based on the active businessId.
 */

import { useState, useRef } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../hooks/useModal";
import ConfirmModal from "../common/ConfirmModal";
import { authApi } from "../../apis/auth";
import { HiOutlineCamera, HiOutlineTrash } from "react-icons/hi2";

export default function UserMetaCard({
  setAlert,
}: {
  setAlert: (alert: any) => void;
}) {
  const { user, login, token } = useAuth();
  const { businessId } = useParams();

  // Modal state for the 'Delete Photo' action
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  /**
   * Triggers the hidden file input.
   * Guarded against concurrent uploads/deletions.
   */
  const handleAvatarClick = () => {
    if (!uploading && !deleting) fileInputRef.current?.click();
  };

  /**
   * Processes the selected file, validates type, and performs the upload.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (!file.type.startsWith("image/")) {
      setAlert({
        type: "error",
        title: "Invalid File",
        message: "Please select an image file.",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const data = await authApi.uploadAvatar(formData);
      // Sync the new image across the app by re-calling login (updates localStorage/state)
      login(token!, data.user || { ...user, profileImage: data.profileImage });

      setAlert({
        type: "success",
        title: "Photo Updated",
        message: "Your profile picture was uploaded successfully.",
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Upload Failed",
        message: error.message || "Failed to upload image.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /**
   * Removes the profile picture asset from the server.
   */
  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const data = await authApi.deleteAvatar();
      login(token!, data.user);
      setAlert({
        type: "info",
        title: "Photo Removed",
        message: "Profile picture has been deleted.",
      });
      closeDeleteModal();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Delete Failed",
        message: error.message || "Failed to remove image.",
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
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* --- AVATAR CONTAINER --- */}
            <div
              onClick={handleAvatarClick}
              className={`relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 cursor-pointer group transition-all ${
                uploading || deleting
                  ? "opacity-60"
                  : "hover:ring-4 hover:ring-brand-500/20"
              }`}
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Default User Icon */
                <svg
                  className="fill-gray-400 dark:fill-gray-500"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}

              {/* Interaction Overlay (Camera & Trash icons) */}
              <div
                className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity bg-black/50 ${uploading || deleting ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                {uploading || deleting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <HiOutlineCamera className="w-5 h-5 text-white cursor-pointer hover:scale-110 transition-transform" />
                    {user.profileImage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal();
                        }}
                        className="group/delete"
                        type="button"
                      >
                        <HiOutlineTrash className="w-5 h-5 text-white transition-colors hover:scale-110" />
                      </button>
                    )}
                  </>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
              />
            </div>

            {/* --- USER IDENTITY TEXT --- */}
            <div>
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user.name}
              </h4>
              {activeMembership && (
                <p className="text-sm font-medium text-brand-500 dark:text-brand-400">
                  {activeMembership.title} @ {activeMembership.businessId?.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Remove Profile Picture?"
        description="This will permanently delete your custom avatar and return it to the default icon."
        confirmText="Remove Picture"
        variant="danger"
        isLoading={deleting}
      />
    </>
  );
}
