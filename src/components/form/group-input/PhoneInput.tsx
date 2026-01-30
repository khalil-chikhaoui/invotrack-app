import React from "react";
import { PHONE_CODE_COUNTRIES } from "../../../hooks/phoneCode";

interface CountryCode {
  code: string;
  label: string;
  name?: string;
}

interface PhoneInputProps {
  countries?: CountryCode[];
  country: string;      // Controlled ISO code (e.g. "US")
  value: string;        // Controlled input value (e.g. "+1 555...")
  onChange: (data: { country: string; number: string }) => void;
  placeholder?: string;
  selectPosition?: "start" | "end";
  className?: string;   // Allow passing styles (e.g. border-red-500)
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countries = PHONE_CODE_COUNTRIES,
  country,
  value,
  onChange,
  placeholder = "+1 (555) 000-0000",
  selectPosition = "start",
  className = "",
}) => {
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    const selectedCountryData = countries.find((c) => c.code === newCountry);
    const newDialCode = selectedCountryData?.label || "";

    // When country changes, update country AND reset number to dial code
    onChange({
      country: newCountry,
      number: newDialCode
    });
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      country,
      number: e.target.value
    });
  };

  const Chevron = () => (
    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
      <svg className="size-3.5 fill-none stroke-current" viewBox="0 0 20 20">
        <path
          d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  return (
    <div className={`relative flex w-full ${className}`}>
      {/* Country Selector */}
      <div
        className={`absolute z-10 h-full ${
          selectPosition === "end" ? "right-0" : "left-0"
        }`}
      >
        <select
          value={country}
          onChange={handleCountryChange}
          className={`h-full appearance-none bg-transparent py-2.5 pl-3.5 pr-8 text-sm font-semibold text-gray-700 outline-none dark:text-gray-300 cursor-pointer
            ${selectPosition === "start" ? "border-r border-gray-200 dark:border-gray-700" : "border-l border-gray-200 dark:border-gray-700"}
          `}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code} className="dark:bg-gray-900">
              {c.code}
            </option>
          ))}
        </select>
        <Chevron />
      </div>

      {/* Phone Number Input */}
      <input
        type="tel"
        value={value}
        onChange={handlePhoneNumberChange}
        placeholder={placeholder}
        className={`h-11 w-full rounded-xl border border-gray-300 bg-transparent py-3 text-sm text-gray-800 shadow-sm transition-all
          placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white
          ${selectPosition === "start" ? "pl-[84px] pr-4" : "pr-[84px] pl-4"}
          ${className.includes("border-error") ? "border-error-500 focus:border-error-500 focus:ring-error-500/20" : ""}
        `}
      />
    </div>
  );
};

export default PhoneInput;