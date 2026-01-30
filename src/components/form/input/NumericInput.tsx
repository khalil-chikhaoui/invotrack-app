import React, { FC, useState, useEffect } from "react";

interface NumericInputProps {
  value: string | number;
  onChange: (value: string) => void;
  variant?: "currency" | "quantity";
  id?: string;
  name?: string;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
}

const NumericInput: FC<NumericInputProps> = ({
  value,
  onChange,
  variant = "quantity",
  id,
  name,
  disabled = false,
  success = false,
  error = false,
  hint,
  required = false,
  autoFocus = false,
  className = "",
  placeholder,
}) => {
  const [displayValue, setDisplayValue] = useState(value?.toString() || "");

  useEffect(() => {
    const propValStr = value?.toString() || "";
    // Only update local state if the ACTUAL numerical value is different
    if (Number(propValStr) !== Number(displayValue) || (propValStr === "" && displayValue !== "")) {
      setDisplayValue(propValStr);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    inputValue = inputValue.replace(/,/g, ".");

    if (/^\d*(\.\d*)?$/.test(inputValue)) {
      setDisplayValue(inputValue);
      onChange(inputValue);
    }
  };

  const defaultPlaceholder = variant === "currency" ? "00.00" : "10";
  const finalPlaceholder = placeholder || defaultPlaceholder;

  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 transition-all ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else if (success) {
    inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="decimal"
        // 👇 FIXED: Added dot (.) to the allowed pattern so forms don't complain
        pattern="[0-9.]*" 
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        placeholder={finalPlaceholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        onFocus={(e) => e.target.select()}
        autoComplete="off"
        className={inputClasses}
      />
      
      {hint && (
        <p className={`mt-1.5 text-xs ${error ? "text-error-500" : success ? "text-success-500" : "text-gray-500"}`}>
          {hint}
        </p>
      )}
    </div>
  );
};

export default NumericInput;