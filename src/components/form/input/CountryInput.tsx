import React, { useState, useMemo, useEffect, type FC } from "react";
import { HiOutlineMapPin } from "react-icons/hi2";
import { COUNTRIES, CountryData } from "../../../hooks/countries";

interface CountryInputProps {
  value: string; // Expects ISO Code (e.g. "DE", "US")
  onChange: (country: CountryData) => void; // Returns full object (code, name, dial_code)
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
  // Find the selected country object based on the code passed in (value)
  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === value),
    [value]
  );

  // Local state for what the user actively sees/types
  const [displayValue, setDisplayValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync the display text whenever the external value (code) changes
  useEffect(() => {
    if (selectedCountry) {
      setDisplayValue(selectedCountry.name);
    }
  }, [selectedCountry]);

  // Filter countries based on user input (searches Name OR Code)
  const filteredCountries = useMemo(() => {
    if (!displayValue) return COUNTRIES;
    const searchTerm = displayValue.toLowerCase();
    
    return COUNTRIES.filter(
      (c) => 
        c.name.toLowerCase().includes(searchTerm) || 
        c.code.toLowerCase().includes(searchTerm)
    );
  }, [displayValue]);

  const handleSelect = (country: CountryData) => {
    setDisplayValue(country.name); // Show the name
    onChange(country); // Send full object to parent
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
    if (!showSuggestions) setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Small delay to allow click event on suggestion to fire first
    setTimeout(() => {
      // If user leaves field and text doesn't match a valid country, revert to last valid selection
      if (selectedCountry && displayValue !== selectedCountry.name) {
        setDisplayValue(selectedCountry.name);
      }
      setShowSuggestions(false);
    }, 200);
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
        value={displayValue}
        onChange={handleInputChange}
        onFocus={(e) => {
          setShowSuggestions(true);
          e.target.select();
        }}
        onBlur={handleBlur}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
        className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 transition-all ${className}`}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <>
          {/* List */}
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-900 dark:border-gray-700 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <div
                  key={c.code}
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                  onClick={() => handleSelect(c)}
                  className={`
                      px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between border-b last:border-0 border-gray-50 dark:border-gray-800 transition-colors
                      ${
                        c.code === value
                          ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }
                    `}
                >
                  <span className="font-medium">{c.name}</span>
                  {/* Optional: Show ISO code lightly on the right */}
                  <span className="text-xs text-gray-400 font-mono opacity-50">{c.code}</span>
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