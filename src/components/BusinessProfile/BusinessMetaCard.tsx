/**
 * @fileoverview BusinessMetaCard Component
 * Manages core visual branding and high-level identity for the organization.
 * Features:
 * 1. Asset Management: Integrated business logo upload and deletion via multipart/form-data.
 * 2. Identity Sync: Updates organization metadata (Name, Legal Name, Description).
 * 3. Global Context Sync: Synchronizes updated logos with AuthContext to reflect changes in sidebars/navbars.
 * 4. Permission Guarding: Restricts editing and asset management strictly to Admin roles.
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { BusinessData, businessApi } from "../../apis/business";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Label from "../form/Label";
import ConfirmModal from "../common/ConfirmModal";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router";
import { HiOutlineCamera, HiOutlineTrash } from "react-icons/hi2";
import { usePermissions } from "../../hooks/usePermissions";

export default function BusinessMetaCard({
  business,
  refresh,
  setAlert,
}: {
  business: BusinessData;
  refresh: () => void;
  setAlert: (alert: any) => void;
}) {
  // --- Modal Logic ---
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

  // --- UI States ---
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, login, token } = useAuth();
  const { businessId } = useParams();

  const { isAdmin } = usePermissions();

  // --- Form State Management ---
  const [formData, setFormData] = useState({
    name: business.name,
    legalName: business.legalName || "",
    description: business.description || "",
  });

  // Keep form in sync with incoming prop changes (from refresh() calls)
  useEffect(() => {
    setFormData({
      name: business.name,
      legalName: business.legalName || "",
      description: business.description || "",
    });
  }, [business]);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      const data: any = await businessApi.uploadLogo(businessId, fd);
      updateGlobalUserLogo(data.logo);
      setAlert({
        type: "success",
        title: "Branding Updated",
        message: "Business logo has been synchronized.",
      });
      refresh();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Sync Failed",
        message: error.message || "Failed to upload logo.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
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
        title: "Asset Purged",
        message: "Business logo has been removed.",
      });
      refresh();
      closeDeleteModal();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Removal Failed",
        message: error.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await businessApi.updateBusiness(business._id, formData);
      setAlert({
        type: "success",
        title: "Registry Updated",
        message: "Core identity details saved.",
      });
      refresh();
      closeEditModal();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Update Failed",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 text-start">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* --- Visual Identity Container --- */}
        <div
          onClick={() => isAdmin && !uploading && fileInputRef.current?.click()}
          className={`relative w-24 h-24 overflow-hidden border border-gray-200 rounded-xl dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-gray-800 flex-shrink-0 transition-all ${isAdmin ? "cursor-pointer group hover:ring-4 hover:ring-brand-500/10" : ""}`}
        >
          {business.logo ? (
            <img
              src={business.logo}
              alt="Organization Logo"
              className="object-cover w-full h-full"
            />
          ) : (
            /* Monogram Fallback */
            <span className="text-3xl font-semibold text-gray-300 dark:text-gray-500 uppercase">
              {business.name?.charAt(0)}
            </span>
          )}

          {/* Asset Interaction Overlay (Admin only) */}
          {isAdmin && (
            <div
              className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/30 transition-all duration-200 backdrop-blur-[1px] ${uploading || deleting ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              {uploading || deleting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineCamera className="w-5 h-5 text-white cursor-pointer hover:scale-110 transition-transform" />
                  {business.logo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents triggering file picker
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
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/jpg"
          />
        </div>

        {/* --- Identity Information --- */}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {business.name}
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-600 rounded-full dark:bg-green-500/10 uppercase tracking-widest">
              {business.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {business.legalName || business.name}
          </p>
          <div className="max-w-3xl border-l-4 border-brand-500 pl-4 py-1 italic text-gray-600 dark:text-gray-300">
            "
            {business.description ||
              "No description set for this organization."}
            "
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={openEditModal}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 uppercase font-semibold text-[10px] tracking-widest"
          >
            Edit Identity
          </button>
        )}
      </div>

      {/* --- CONFIRMATION MODALS --- */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDeleteLogo}
        title="Remove Business Logo?"
        description="This action will permanently delete the custom branding asset and revert to a monogram."
        confirmText="Remove Logo"
        variant="danger"
        isLoading={deleting}
      />

      {/* --- EDIT MODAL --- */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        className="max-w-[700px] m-4"
      >
        <div className="p-6 lg:p-11 bg-white dark:bg-gray-900 rounded-3xl text-start">
          <h4 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white/90 uppercase tracking-tight">
            Edit Organizational Branding
          </h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-4"
          >
            <div>
              <Label>Business Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Legal Name</Label>
              <Input
                value={formData.legalName}
                onChange={(e) =>
                  setFormData({ ...formData, legalName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Description / Bio</Label>
              <TextArea
                value={formData.description}
                onChange={(val) =>
                  setFormData({ ...formData, description: val })
                }
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditModal}
                className="text-[10px] font-semibold uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="text-[10px] font-semibold uppercase tracking-widest"
              >
                {loading ? "Synchronizing..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
