/**
 * @fileoverview RecordNotFound Component
 * A standardized UI for handling missing data, 404s, or empty states within business contexts.
 */

import { useNavigate } from "react-router";
import Button from "../ui/button/Button";
import { HiOutlineDocumentSearch, HiOutlineArrowLeft } from "react-icons/hi";

interface RecordNotFoundProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function RecordNotFound({
  title = "Record Not Found",
  description = "The requested resource could not be located. It may have been deleted or archived.",
  actionText = "Return to Directory",
  onAction,
}: RecordNotFoundProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate(-1); // Default: Go back
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-300">
      {/* Icon Container */}
      <div
        className="w-20 h-20 bg-gray-50 dark:bg-white/[0.03] rounded-3xl flex items-center justify-center mb-6 border 
      border-gray-100 dark:border-white/[0.05]"
      >
        <HiOutlineDocumentSearch className="size-10 text-gray-600 dark:text-gray-400" />
      </div>

      {/* Text Content */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
        {title}
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      <Button
        onClick={handleAction}
        variant="outline"
        className="flex items-center gap-2 px-6 h-11 uppercase tracking-widest text-[10px] font-semibold border-gray-200 
        dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
      >
        <HiOutlineArrowLeft className="size-4" />
        {actionText}
      </Button>
    </div>
  );
}
