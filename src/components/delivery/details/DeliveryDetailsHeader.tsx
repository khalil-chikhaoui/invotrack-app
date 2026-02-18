import { useTranslation } from "react-i18next";
import { HiArrowLeft, HiOutlinePrinter, HiOutlineTrash } from "react-icons/hi2";
import { useNavigate } from "react-router";

interface DeliveryDetailsHeaderProps {
  onReprint: () => void;
  onDelete: () => void;
}

export default function DeliveryDetailsHeader({
  onReprint,
  onDelete,
}: DeliveryDetailsHeaderProps) {
  const { t } = useTranslation("delivery");
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
      {/* Return Button  */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-semibold uppercase text-gray-600 hover:text-brand-500 dark:text-gray-400 hover:dark:text-brand-400 transition-colors tracking-widest cursor-pointer"
      >
        <HiArrowLeft className="size-4" /> {t("back") || "Back"}
      </button>

      <div className="flex gap-3 ml-auto">
        {/* Action Group  */}
        <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-lg p-1 gap-1">
          
          {/* Reprint Button */}
          <button
            onClick={onReprint}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-semibold uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <HiOutlinePrinter className="size-4" />
            {t("actions.reprint") || "Reprint"}
          </button>

          <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1"></div>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-semibold uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <HiOutlineTrash className="size-4" />
            {t("actions.delete") || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}