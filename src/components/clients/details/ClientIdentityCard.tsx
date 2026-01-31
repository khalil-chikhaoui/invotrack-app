import { useRef, useState } from "react";
import { useTranslation } from "react-i18next"; // <--- Hook
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
      setAlert({ type: "error", title: t("errors.UPLOAD_FAILED"), message: error.message });
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
      setAlert({ type: "error", title: t("errors.REMOVAL_FAILED"), message: error.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl p-6 mb-8  overflow-hidden relative text-start">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <HiOutlineBuildingOffice2 className="size-32 text-gray-400" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <div
          onClick={() => !isArchived && !uploading && !deleting && canManage && fileInputRef.current?.click()}
          className={`relative w-28 h-28 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden  flex-shrink-0 group transition-all ${canManage && !isArchived && !uploading && !deleting ? "cursor-pointer hover:ring-4 hover:ring-brand-500/10" : ""}`}
        >
          {client.logo ? (
            <img src={client.logo} className="w-full h-full object-cover" alt="Client Logo" />
          ) : client.clientType === "Business" ? (
            <HiOutlineBuildingOffice2 className="size-12 text-gray-400" />
          ) : (
            <HiOutlineUser className="size-12 text-gray-400" />
          )}

          {canManage && !isArchived && (
            <div className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/30 transition-all duration-200 backdrop-blur-[1px] ${uploading || deleting ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              {uploading || deleting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineCamera className="w-6 h-6 text-white cursor-pointer hover:scale-110 transition-transform" />
                  {client.logo && (
                    <button onClick={(e) => { e.stopPropagation(); openDeleteModal(); }} type="button" className="hover:scale-110 transition-transform">
                      <HiOutlineTrash className="w-6 h-6 text-white" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />
        </div>

        <div className="text-center md:text-start flex-1 w-full">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Badge color={client.clientType === "Business" ? "info" : "light"} className="font-semibold text-[10px] tracking-widest px-3 uppercase">
              {client.clientType === "Business" ? t("identity_card.type_business") : t("identity_card.type_individual")}
            </Badge>
            {isArchived && (
              <Badge color="warning" className="font-semibold text-[9px] tracking-widest uppercase">
                {t("identity_card.archived")}
              </Badge>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 mb-2">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight leading-none">
              {client.name}
            </h2>

            {canManage && !isArchived && (
              <div className="flex justify-center md:justify-end">
                <Button size="sm" className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap" onClick={onEdit}>
                  <HiOutlinePencilSquare className="size-4" /> {t("identity_card.edit")}
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-y-2 mt-4 gap-x-6 text-gray-500 dark:text-gray-400">
            {client.email && (
              <div className="flex items-center gap-2 text-xs text-brand-500 font-semibold uppercase tracking-tighter">
                <HiOutlineEnvelope className="size-4" /> {client.email}
              </div>
            )}
            {client.phone && client.phone.number && (
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tighter">
                <HiOutlinePhone className="size-4" /> {client.phone.number}
              </div>
            )}
            {client.taxId && (
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tighter">
                <HiOutlineIdentification className="size-4" /> {client.taxId}
              </div>
            )}
          </div>
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