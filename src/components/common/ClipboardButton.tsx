import { useState } from "react";
import { useTranslation } from "react-i18next"; // 1. Import hook
import { HiOutlineDocumentDuplicate, HiOutlineCheck } from "react-icons/hi2";

interface ClipboardButtonProps {
  text: string | undefined | null;
  label?: string; 
  className?: string;
}

export default function ClipboardButton({ text, label, className = "" }: ClipboardButtonProps) {
  const { t } = useTranslation("common"); 
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  if (!text) return null;

  return (
    <div className="relative flex items-center group/tooltip">
      <button
        type="button"
        onClick={handleCopy}
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-300
          ${copied 
            ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400" 
            : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400"
          }
          ${className}
        `}
      >
        {copied ? (
          <HiOutlineCheck className="size-3.5 animate-in zoom-in duration-300" />
        ) : (
          <HiOutlineDocumentDuplicate className="size-3.5" />
        )}

        {/* --- Toggle Text Label --- 
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {copied ? t("clipboard.copied") : label || t("clipboard.copy")}
        </span>*/}
      </button>

      {/* --- Theme Aware Tooltip --- */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 
                      invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100
                      transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0
                      pointer-events-none z-50 whitespace-nowrap
                      text-[9px] font-bold   rounded-md shadow-xl
                    
                      bg-white text-gray-900 border border-gray-200/50
                    
                      dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700/50">
        {copied 
          ? t("clipboard.done") 
          : t("clipboard.copy_text", { text: text.length > 20 ? `${text.substring(0, 20)}...` : text })
        }
      </div>
    </div>
  );
}