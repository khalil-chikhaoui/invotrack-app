import { useEffect } from "react";
import { useTranslation } from "react-i18next"; // <--- Import Hook
import { HiGlobeAlt } from "react-icons/hi2";
import { HiChevronDown } from "react-icons/hi2";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

export default function LanguageSelector({
  value,
  onChange,
  className = "",
  label 
}: LanguageSelectorProps) { 
  
  const { t } = useTranslation("common"); // <--- Load "common" namespace

  // Helper: "en-US" -> "en" (Ensures binding works)
  const safeValue = value ? value.split("-")[0] : "";
  
  // Detect browser language on mount if value is empty
  useEffect(() => {
    if (!value) {
      const browserLang = navigator.language.split("-")[0];
      const supported = ["en", "fr", "de"];
      onChange(supported.includes(browserLang) ? browserLang : "en");
    }
  }, [value, onChange]);

  return (
    <div className={`w-full ${className}`}>
      {/* If label prop is passed, use it. If not, use the translated default. */}
      {(label || label === "") ? (
        label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )
      ) : (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t("languages.label")}
        </label>
      )}
      
      <div className="relative group">
        
        {/* Left Icon (Globe) */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiGlobeAlt className="h-5 w-5 transition-colors duration-300 text-gray-500 dark:text-gray-400 group-focus-within:text-brand-500" />
        </div>
        
        <select
          value={safeValue} // Use sanitized value
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full h-11 pl-10 pr-10 bg-transparebt border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all cursor-pointer"
        >
          <option value="en">{t("languages.en")}</option>
          <option value="fr">{t("languages.fr")}</option>
          <option value="de">{t("languages.de")}</option>
        </select>

        {/* Right Icon (Chevron) */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <HiChevronDown className="h-4 w-4 transition-colors duration-300 text-gray-500 dark:text-gray-400 group-focus-within:text-brand-500" />
        </div>
      </div>
    </div>
  );
}