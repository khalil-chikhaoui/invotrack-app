import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineCube,
  HiOutlineHashtag,
  HiOutlineTag,
  HiOutlineCamera,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";
import Badge from "../../ui/badge/Badge";
import { formatMoney } from "../../../hooks/formatMoney";
import { ItemData, itemApi } from "../../../apis/items";
import { BusinessData } from "../../../apis/business";
import Button from "../../ui/button/Button";
import ConfirmModal from "../../common/ConfirmModal";
import { useModal } from "../../../hooks/useModal";
import ClipboardButton from "../../common/ClipboardButton";

interface ItemIdentityCardProps {
  item: ItemData;
  business: BusinessData | null;
  canManage: boolean;
  onEdit: () => void;
  refresh: () => void;
  setAlert: (a: any) => void;
}

export default function ItemIdentityCard({
  item,
  business,
  canManage,
  onEdit,
  refresh,
  setAlert,
}: ItemIdentityCardProps) {
  const { t } = useTranslation("item_details");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const handleUploadClick = () => {
    if (!uploading && !deleting && canManage && !item.isArchived) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !item?._id) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      await itemApi.uploadImage(item._id, fd);
      setAlert({
        type: "success",
        title: t("messages.IMAGE_UPDATED"),
        message: t("messages.IMAGE_UPDATED_DESC"),
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

  const handleConfirmDeleteImage = async () => {
    if (!item?._id) return;
    setDeleting(true);
    try {
      await itemApi.deleteImage(item._id);
      setAlert({
        type: "info",
        title: t("messages.ASSET_REMOVED"),
        message: t("messages.ASSET_REMOVED_DESC"),
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
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl p-6 mb-8 shadow-sm relative overflow-hidden text-start">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <HiOutlineCube className="size-32 text-gray-400" />
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
        
        {/* --- LEFT: IMAGE --- */}
        <div className="flex-shrink-0">
          <div className="relative w-28 h-28 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner">
            {uploading ? (
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            ) : item.image ? (
              <img
                src={item.image}
                className="w-full h-full object-cover"
                alt={item.name}
              />
            ) : (
              <HiOutlineCube className="size-12 text-gray-400" />
            )}
          </div>
        </div>

        {/* --- RIGHT: INFO & ACTIONS --- */}
        <div className="flex-1 w-full pt-1 text-center md:text-start">
          
          {/* Badges Row */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <Badge
              color={item.itemType === "Product" ? "info" : "warning"}
              className="font-semibold text-[10px] tracking-widest px-3 uppercase"
            >
              {t(
                `identity_card.type_${item.itemType.toLowerCase()}` as any,
                item.itemType,
              )}
            </Badge>
            {item.isArchived && (
              <Badge
                color="warning"
                className="font-semibold text-[9px] tracking-widest uppercase"
              >
                {t("identity_card.archived")}
              </Badge>
            )}
          </div>

          {/* Name + Main Edit Button */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                {item.name}
              </h2>
              <ClipboardButton text={item.name} />
            </div>

            {canManage && !item.isArchived && (
              <Button
                size="sm"
                variant="primary"
                onClick={onEdit}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 shadow-lg shadow-brand-500/20"
              >
                <HiOutlinePencilSquare className="size-4" />
                {t("identity_card.edit")}
              </Button>
            )}
          </div>

          {/* Details Grid */}
          <div className="flex flex-wrap justify-center md:justify-start gap-y-3 mt-4 gap-x-6 text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 pt-2">
            {/* SKU Section with Clipboard */}
            <div className="flex items-center gap-1 group">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tight">
                <HiOutlineHashtag className="size-4 text-brand-500" />{" "}
                {t("identity_card.sku")}: {item.sku || "N/A"}
              </div>
              {item.sku && <ClipboardButton text={item.sku} label="SKU" />}
            </div>

            {/* Price (Static) */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tight">
              <HiOutlineTag className="size-4 text-brand-500" />{" "}
              {formatMoney(
                item.price,
                business?.currency,
                business?.currencyFormat,
              )}
            </div>
          </div>

          {/* --- IMAGE ACTIONS ROW --- */}
          {canManage && !item.isArchived && (
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 h-8 text-[10px] font-bold uppercase tracking-widest"
                onClick={handleUploadClick}
                disabled={uploading || deleting}
              >
                <HiOutlineCamera className="size-3.5" />
                {t("identity_card.change_image", { defaultValue: "Change Image" })}
              </Button>

              {item.image && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
                  onClick={openDeleteModal}
                  disabled={uploading || deleting}
                >
                  <HiOutlineTrash className="size-3.5" />
                  {t("identity_card.remove_image", { defaultValue: "Remove" })}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDeleteImage}
        title={t("identity_card.modals.remove_logo_title")}
        description={t("identity_card.modals.remove_logo_desc")}
        confirmText={t("identity_card.modals.confirm_remove")}
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}