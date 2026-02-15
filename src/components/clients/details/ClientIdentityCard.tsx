import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineBuildingOffice2,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlinePencilSquare,
  HiOutlineCamera,
  HiOutlineTrash,
} from "react-icons/hi2";
import Badge from "../../ui/badge/Badge";
import { ClientData, clientApi } from "../../../apis/clients";
import Button from "../../ui/button/Button";
import { useModal } from "../../../hooks/useModal";
import ConfirmModal from "../../common/ConfirmModal";
import ClipboardButton from "../../common/ClipboardButton";

interface ClientIdentityCardProps {
  client: ClientData;
  canManage: boolean;
  isArchived: boolean;
  onEdit: () => void;
  refresh: () => void;
  setAlert: (a: any) => void;
}

export default function ClientIdentityCard({
  client,
  canManage,
  isArchived,
  onEdit,
  refresh,
  setAlert,
}: ClientIdentityCardProps) {
  const { t } = useTranslation("client_details");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const handleUploadClick = () => {
    if (!uploading && !deleting && canManage && !isArchived) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !client?._id) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      await clientApi.uploadLogo(client._id, fd);
      setAlert({
        type: "success",
        title: "Success",
        message: t("messages.LOGO_UPDATED"),
      });
      refresh();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: t("errors.UPLOAD_FAILED"),
        message: error.message,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmDeleteLogo = async () => {
    if (!client?._id) return;
    setDeleting(true);
    try {
      await clientApi.deleteLogo(client._id);
      setAlert({
        type: "info",
        title: "Removed",
        message: t("messages.LOGO_REMOVED"),
      });
      refresh();
      closeDeleteModal();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: t("errors.REMOVAL_FAILED"),
        message: error.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl p-6 mb-8 overflow-hidden relative text-start">
      {/* Background Icon Decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <HiOutlineBuildingOffice2 className="size-32 text-gray-400" />
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
        {/* --- LEFT: LOGO --- */}
        <div className="flex-shrink-0">
          <div className="relative w-28 h-28 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            {uploading ? (
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            ) : client.logo ? (
              <img
                src={client.logo}
                className="w-full h-full object-cover"
                alt="Client Logo"
              />
            ) : client.clientType === "Business" ? (
              <HiOutlineBuildingOffice2 className="size-12 text-gray-400" />
            ) : (
              <HiOutlineUser className="size-12 text-gray-400" />
            )}
          </div>
        </div>

        {/* --- RIGHT: INFO & ACTIONS --- */}
        <div className="text-center md:text-start flex-1 w-full pt-1">
          {/* Badges Row */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <Badge
              size="sm"
              variant="light"
              color={client.clientType === "Business" ? "warning" : "info"}
              className="font-bold text-[10px] tracking-widest px-2 py-0.5 uppercase"
            >
              {t(
                `identity_card.type_${client.clientType.toLowerCase()}`,
                client.clientType
              )}
            </Badge>

            {isArchived && (
              <Badge
                size="sm"
                color="error"
                className="font-bold text-[9px] tracking-widest px-1.5 py-0 uppercase"
              >
                {t("identity_card.archived")}
              </Badge>
            )}
          </div>

          {/* Name + Edit Button Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-none break-all">
                {client.name}
              </h2>
              <ClipboardButton text={client.name} />
            </div>

            {canManage && !isArchived && (
              <Button
                size="sm"
                variant="primary"
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 shadow-lg shadow-brand-500/20"
                onClick={onEdit}
              >
                <HiOutlinePencilSquare className="size-4" />
                {t("identity_card.edit")}
              </Button>
            )}
          </div>

          {/* --- CONTACT DETAILS --- */}
          <div className="flex flex-wrap justify-center md:justify-start gap-y-3 mt-4 gap-x-6 text-gray-500 dark:text-gray-400">
            {client.email && (
              <div className="flex items-center gap-1 group transition-all">
                <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 font-semibold  ">
                  <HiOutlineEnvelope className="size-4" /> {client.email}
                </div>
                <ClipboardButton text={client.email} />
              </div>
            )}
            
            {client.phone && client.phone.number && (
              <div className="flex items-center gap-1 group transition-all">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase ">
                  <HiOutlinePhone className="size-4" /> {client.phone.number}
                </div>
                <ClipboardButton text={client.phone.number} />
              </div>
            )}
            
            {client.taxId && (
              <div className="flex items-center gap-1 group transition-all">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase ">
                  <HiOutlineIdentification className="size-4" /> {client.taxId}
                </div>
                <ClipboardButton text={client.taxId} />
              </div>
            )}
          </div>

          {/* --- LOGO ACTIONS ROW --- */}
          {canManage && !isArchived && (
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
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
                className="gap-2 h-8 text-[10px] font-bold uppercase tracking-widest"
                onClick={handleUploadClick}
                disabled={uploading || deleting}
              >
                <HiOutlineCamera className="size-3.5" />
                {t("identity_card.change_logo", {
                  defaultValue: "Change Logo",
                })}
              </Button>

              {client.logo && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
                  onClick={openDeleteModal}
                  disabled={uploading || deleting}
                >
                  <HiOutlineTrash className="size-3.5" />
                  {t("identity_card.remove_logo", { defaultValue: "Remove" })}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDeleteLogo}
        title={t("identity_card.modals.remove_logo_title")}
        description={t("identity_card.modals.remove_logo_desc")}
        confirmText={t("identity_card.modals.confirm_remove")}
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}