import React, { useState, useMemo, type FC } from "react";
import { HiOutlineMapPin } from "react-icons/hi2";
import { COUNTRIES } from "../../../hooks/countries";

interface CountryInputProps {
  value: string;
  onChange: (country: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  hint?: string;
  required?: boolean;
  autoFocus?: boolean;
}

const CountryInput: FC<CountryInputProps> = ({
  value,
  onChange,
  id,
  name,
  placeholder = "Search country...",
  className = "",
  hint,
  required = false,
  autoFocus = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter countries based on current value
  const filteredCountries = useMemo(() => {
    const searchTerm = value.toLowerCase();
    return COUNTRIES.filter(
      (c) => c !== "---" && c.toLowerCase().includes(searchTerm)
    );
  }, [value]);

  const handleSelect = (country: string) => {
    onChange(country);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (!showSuggestions) setShowSuggestions(true);
  };

  return (
    <div className="relative w-full group">
      {/* Icon Prefix */}
      <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-gray-400 transition-colors pointer-events-none group-focus-within:text-brand-500 dark:text-gray-400 dark:group-focus-within:text-brand-400">
        <HiOutlineMapPin className="size-5" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={(e) => {
          setShowSuggestions(true);
          e.target.select();
        }}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
        className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 transition-all ${className}`}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setShowSuggestions(false)}
          />

          {/* List */}
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-900 dark:border-gray-700 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <div
                  key={c}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(c)}
                  className={`
                      px-4 py-2.5 text-sm cursor-pointer flex items-center border-b last:border-0 border-gray-50 dark:border-gray-800 transition-colors
                      ${
                        c === value
                          ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }
                    `}
                >
                  <span className="font-medium">{c}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm italic text-center text-gray-400 dark:text-gray-500">
                No countries found
              </div>
            )}
          </div>
        </>
      )}

      {/* Helper Text */}
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

export default CountryInput;