import { useTranslation } from "react-i18next"; // <--- Hook
import {
  HiOutlineArrowLeft,
  HiOutlineArrowPathRoundedSquare,
} from "react-icons/hi2";
import Button from "../../ui/button/Button";

interface ClientHeaderProps {
  handleSmartBack: () => void;
  canGoBack: boolean;
  isArchived: boolean;
  canManage: boolean;
  onRestore: () => void;
}

export default function ClientHeader({
  handleSmartBack,
  canGoBack,
  isArchived,
  canManage,
  onRestore,
}: ClientHeaderProps) {
  const { t } = useTranslation("client_details");

  return (
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={handleSmartBack}
        className="flex items-center mt-4 gap-2 text-[10px] font-semibold uppercase text-gray-600 hover:text-brand-500 dark:text-gray-400 hover:dark:text-brand-400 transition-colors tracking-widest cursor-pointer"
      >
        <HiOutlineArrowLeft className="size-4" />
        {canGoBack ? t("header.back") : t("header.directory")}
      </button>
      {isArchived && canManage && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest 
          border-amber-200 text-amber-600 hover:bg-amber-50"
          onClick={onRestore}
        >
          <HiOutlineArrowPathRoundedSquare className="size-4" /> {t("header.restore")}
        </Button>
      )}
    </div>
  );
}