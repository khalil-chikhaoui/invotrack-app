import { useTranslation } from "react-i18next";
import { HiGlobeAlt, HiChevronDown } from "react-icons/hi2";

interface LanguageInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export default function LanguageInput({
  value,
  onChange,
  label,
  className = "",
}: LanguageInputProps) {
  const { t } = useTranslation("common");

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative group">
        {/* Left Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <HiGlobeAlt className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
        </div>

        {/* Select Input */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent pl-11 pr-10 text-sm text-gray-800 shadow-theme-xs outline-none transition-all focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 cursor-pointer"
        >
          <option value="en" className="dark:bg-gray-900">{t("languages.en")}</option>
          <option value="fr" className="dark:bg-gray-900">{t("languages.fr")}</option>
          <option value="de" className="dark:bg-gray-900">{t("languages.de")}</option>
        </select>

        {/* Right Chevron */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <HiChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 group-focus-within:text-brand-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}