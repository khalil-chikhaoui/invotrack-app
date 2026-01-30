import { useRef, useState } from "react";
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
    if (!file || !item?._id) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      await itemApi.uploadImage(item._id, fd);
      setAlert({
        type: "success",
        title: "Image Updated",
        message: "Item visuals synchronized.",
      });
      refresh();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Upload Failed",
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
        title: "Asset Removed",
        message: "Item image cleared.",
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

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl p-6 mb-8 shadow-sm relative overflow-hidden text-start">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <HiOutlineCube className="size-32 text-gray-400" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        {/* Logo/Avatar with Interaction Overlay */}
        <div
          onClick={() =>
            !item.isArchived &&
            !uploading &&
            !deleting &&
            canManage &&
            fileInputRef.current?.click()
          }
          className={`
            relative w-28 h-28 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 
            overflow-hidden shadow-inner flex-shrink-0 group transition-all
            ${canManage && !item.isArchived && !uploading && !deleting ? "cursor-pointer hover:ring-4 hover:ring-brand-500/10" : ""}
          `}
        >
          {item.image ? (
            <img
              src={item.image}
              className="w-full h-full object-cover"
              alt={item.name}
            />
          ) : (
            <HiOutlineCube className="size-12 text-gray-400" />
          )}

          {/* Interaction Overlay - Hidden if Locked */}
          {canManage && !item.isArchived && (
            <div
              className={`
              absolute inset-0 flex items-center justify-center gap-3 bg-black/30 transition-all duration-200 backdrop-blur-[1px]
              ${uploading || deleting ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            `}
            >
              {uploading || deleting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineCamera className="w-6 h-6 text-white hover:scale-110 transition-transform" />
                  {item.image && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal();
                      }}
                      type="button"
                      className="hover:scale-110 transition-transform"
                    >
                      <HiOutlineTrash className="w-6 h-6 text-white" />
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
            accept="image/*"
          />
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Badge
              color={item.itemType === "Product" ? "info" : "light"}
              className="font-semibold text-[10px] tracking-widest px-3 uppercase"
            >
              {item.itemType}
            </Badge>
            {item.isArchived && (
              <Badge
                color="warning"
                className="font-semibold text-[9px] tracking-widest uppercase"
              >
                Archived
              </Badge>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 mb-2">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight leading-none">
              {item.name}
            </h2>
            {canManage && !item.isArchived && (
              <Button
                size="sm"
                onClick={onEdit}
                className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
              >
                <HiOutlinePencilSquare className="size-4" /> Edit Details
              </Button>
            )}
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-y-2 mt-4 gap-x-6 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tight">
              <HiOutlineHashtag className="size-4 text-brand-500" /> SKU:{" "}
              {item.sku || "N/A"}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tight">
              <HiOutlineTag className="size-4 text-brand-500" />{" "}
              {formatMoney(
                item.price,
                business?.currency,
                business?.currencyFormat,
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDeleteImage}
        title="Remove Item Image?"
        description="Permanently delete the visual asset for this item."
        confirmText="Remove Image"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
