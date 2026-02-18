import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CURRENCIES } from "../../hooks/currencies";

interface CurrencySelectProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function CurrencySelect({
  value,
  onChange,
  className = "",
}: CurrencySelectProps) {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCurrency = useMemo(
    () => CURRENCIES.find((c) => c.code === value),
    [value],
  );

  // 2. Filter list based on search term
  const filteredCurrencies = useMemo(() => {
    if (!searchTerm) return CURRENCIES;
    const lower = searchTerm.toLowerCase();
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(lower) ||
        c.name.toLowerCase().includes(lower) ||
        c.symbol.toLowerCase().includes(lower),
    );
  }, [searchTerm]);

  // 3. Handle clicking outside to close
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

  // 4. iOS Optimized Focus Logic
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between h-11 w-full cursor-pointer rounded-lg border bg-white dark:bg-gray-900 px-4 py-2.5 text-sm shadow-theme-xs transition-all 
        ${
          isOpen
            ? "border-brand-500 ring-4 ring-brand-500/10"
            : "border-gray-300 dark:border-gray-700"
        }
        ${
          selectedCurrency
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        <span className="truncate">
          {selectedCurrency
            ? `${selectedCurrency.code} - ${selectedCurrency.name} (${selectedCurrency.symbol})`
            : t("currency_select.placeholder")}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* DROPDOWN CONTENT */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden animate-fadeIn">
          {/* Search Input Sticky at Top */}
          <div className="border-b border-gray-100 dark:border-gray-800 p-2 bg-white dark:bg-gray-900 sticky top-0 z-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className="w-full rounded-lg bg-gray-50 py-2 pl-9 pr-4 text-base sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none dark:bg-gray-800 dark:text-gray-200"
                placeholder={t("currency_select.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Scrollable List */}
          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((c) => (
                <li
                  key={c.code}
                  onClick={() => handleSelect(c.code)}
                  className={`cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 flex justify-between items-center
                  ${
                    c.code === value
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span>
                    {c.code} - {c.name}
                  </span>
                  <span className="opacity-50">{c.symbol}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {t("currency_select.no_results")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}