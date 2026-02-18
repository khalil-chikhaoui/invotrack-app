import type React from "react";
import { useState, useEffect, useRef } from "react";
import { HiMagnifyingGlass, HiChevronDown, HiCheck, HiXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

interface Option {
  value: string;
  text: string;
}

interface MultiSelectProps {
  options: Option[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  onSearch?: (term: string) => void;
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  onSearch,
  disabled = false,
  placeholder = "Select options",
  loading = false,
}) => {
  const { t } = useTranslation("delivery");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (onSearch) {
      const delayDebounceFn = setTimeout(() => onSearch(searchTerm), 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, onSearch]);

  const handleSelect = (optionValue: string) => {
    const newSelected = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newSelected);
  };

  const removeOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation(); 
    onChange?.(value.filter((v) => v !== optionValue));
  };

  return (
    <div className="w-full text-start" ref={dropdownRef}>
      <div className="relative z-20 w-full">
        {/* --- MAIN TRIGGER WITH CHIPS --- */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`flex min-h-[48px] w-full cursor-pointer items-center justify-between rounded-xl border bg-white dark:bg-gray-900 py-1.5 pl-3 pr-3 transition-all 
            ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:border-brand-400 border-gray-200 dark:border-gray-800"}
            ${isOpen ? "ring-4 ring-brand-500/10 border-brand-500" : ""}
          `}
        >
          <div className="flex flex-wrap items-center gap-2 flex-1 overflow-hidden">
            <HiMagnifyingGlass className="size-5 text-gray-400 shrink-0" />
            
            {value.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {value.map((val) => {
                  
                  const label = options.find((o) => o.value === val)?.text || val;
                  return (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-bold animate-in zoom-in duration-200"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={(e) => removeOption(e, val)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <HiXMark className="size-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500 truncate">
                {placeholder}
              </span>
            )}
          </div>
          
          <div className="ml-2 flex items-center gap-1">
             {loading && (
               <div className="size-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-1" />
             )}
             <HiChevronDown className={`size-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* --- DROPDOWN --- */}
        {isOpen && (
          <div className="absolute left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950 animate-in slide-in-from-top-2 duration-200">
            <div className="p-2 space-y-1 border-b border-gray-100 dark:border-gray-800">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full rounded-lg border-none bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20"
                placeholder={t("form.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
              {options.length > 0 ? (
                options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors
                        ${isSelected 
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" 
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"}
                      `}
                    >
                      <span className="truncate">{option.text}</span>
                      {isSelected && <HiCheck className="size-4 text-brand-500" />}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {loading ? t("form.searching") : t("form.no_results")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;