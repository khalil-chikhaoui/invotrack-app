import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { HiGlobeAlt, HiChevronDown, HiCheck } from "react-icons/hi2";

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
  label,
}: LanguageSelectorProps) {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper: "en-US" -> "en"
  const safeValue = value ? value.split("-")[0] : "en";

  const languages = [
    { code: "en", label: t("languages.en"), flag: "🇺🇸" },
    { code: "fr", label: t("languages.fr"), flag: "🇫🇷" },
    { code: "de", label: t("languages.de"), flag: "🇩🇪" },
  ];

  const selectedLanguage = languages.find((l) => l.code === safeValue);

  // Detect browser language on mount if value is empty
  useEffect(() => {
    if (!value) {
      const browserLang = navigator.language.split("-")[0];
      const supported = ["en", "fr", "de"];
      onChange(supported.includes(browserLang) ? browserLang : "en");
    }
  }, [value, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label == "" ? null : (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {/* The Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-full h-11 pl-10 pr-10 text-left cursor-pointer transition-all duration-200 
            bg-white dark:bg-white/[0.03] border rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20
            ${
              isOpen
                ? "border-brand-500 ring-2 ring-brand-500/20"
                : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
            }
          `}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiGlobeAlt
              className={`h-5 w-5 transition-colors ${
                isOpen
                  ? "text-brand-500"
                  : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500"
              }`}
            />
          </div>

          <span className="block truncate text-sm font-medium text-gray-700 dark:text-gray-200">
            {selectedLanguage?.label || "Select Language"}
          </span>

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <HiChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-brand-500" : ""
              }`}
            />
          </div>
        </button>

        {/* The Custom Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="py-1 max-h-60 overflow-auto scrollbar-none">
              {languages.map((lang) => {
                const isSelected = safeValue === lang.code;
                return (
                  <li key={lang.code}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(lang.code);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors cursor-pointer
                        ${
                          isSelected
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span>{lang.label}</span>
                      </div>

                      {isSelected && (
                        <HiCheck className="h-4 w-4 text-brand-500" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
