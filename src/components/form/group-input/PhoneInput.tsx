import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { COUNTRIES } from "../../../hooks/countries";
import { HiChevronDown, HiMagnifyingGlass } from "react-icons/hi2";

interface PhoneInputProps {
  country: string; // ISO code (e.g. "DE")
  value: string; // Input value (e.g. "+49 123...")
  onChange: (data: { country: string; number: string }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  country,
  value,
  onChange,
  placeholder,
  className = "",
  required = false,
}) => {
  const { t } = useTranslation("common");

  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- REFS ---
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- MEMOIZED DATA ---
  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === country),
    [country],
  );

  const filteredCountries = useMemo(() => {
    if (!searchTerm) return COUNTRIES;
    const lower = searchTerm.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.code.toLowerCase().includes(lower) ||
        c.dial_code.includes(lower),
    );
  }, [searchTerm]);

  // --- EFFECTS ---

  // 1. Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Auto-focus search input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- HANDLERS ---

  const handleSelectCountry = (code: string) => {
    const countryData = COUNTRIES.find((c) => c.code === code);

    // Smart Update: Set Country AND the dial code prefix
    onChange({
      country: code,
      number: countryData?.dial_code || "",
    });

    setIsOpen(false);
    setSearchTerm("");
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      country, // Keep current country
      number: e.target.value,
    });
  };

  return (
    <div className="relative w-full group" ref={containerRef}>
      {/* MAIN WRAPPER 
        This simulates the "Input" look (border, rounded) but contains two distinct interactive parts.
      */}
      <div
        className={`flex items-center w-full rounded-lg border border-gray-300 bg-transparent shadow-theme-xs dark:border-gray-700 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all ${className}`}
      >
        {/* LEFT SIDE: Custom Trigger Button */}
        <div className="relative h-full border-r border-gray-200 dark:border-gray-700 w-[150px] shrink-0">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="h-11 w-full flex items-center justify-between px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors rounded-l-lg"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {selectedCountry
                ? `${selectedCountry.name} (${selectedCountry.code})`
                : t("phone_input.select_placeholder")}
            </span>
            <HiChevronDown
              className={`size-3 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* RIGHT SIDE: Phone Number Input */}
        <input
          type="tel"
          value={value}
          onChange={handlePhoneNumberChange}
          // Use prop if provided, otherwise use translation
          placeholder={placeholder || t("phone_input.number_placeholder")}
          required={required}
          className="h-11 flex-1 border-none bg-transparent py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:ring-0 dark:text-white dark:placeholder-gray-500"
        />
      </div>

      {/* DROPDOWN MENU (Absolute) 
      
      */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-[300px] rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Sticky Search Bar */}
          <div className="border-b border-gray-100 dark:border-gray-800 p-2 bg-white dark:bg-gray-900 sticky top-0 z-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiMagnifyingGlass className="size-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                autoComplete="off"
                className="w-full rounded-lg bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all dark:bg-gray-800 dark:text-gray-200 dark:focus:bg-gray-900"
                placeholder={t("phone_input.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Scrollable List */}
          <ul className="max-h-64 overflow-y-auto custom-scrollbar">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <li
                  key={c.code}
                  onClick={() => handleSelectCountry(c.code)}
                  className={`cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 flex justify-between items-center
                  ${
                    c.code === country
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="truncate mr-2">
                    {c.name}{" "}
                    <span className="text-xs opacity-70">({c.code})</span>
                  </span>
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                    {c.dial_code}
                  </span>
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                {t("phone_input.no_results")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;