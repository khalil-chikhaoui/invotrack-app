/**
 * @fileoverview Reusable Select Component
 * A stylized wrapper around the native HTML select element.
 * Features:
 * 1. Controlled State: Manages local selection while notifying parent via callbacks.
 * 2. Visual Placeholders: Handles grayed-out placeholder state for better UX.
 * 3. Theme-Aware: Integrated styling for Dark/Light modes and brand-specific focus rings.
 * 4. High Density: Standard 'h-11' height to match the rest of the form suite.
 */

import { useState, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  // Sync internal state if the prop changes (e.g. after API fetch)
  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value);
  };

  return (
    <div className="relative w-full">
      <select
        className={`h-11 w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm shadow-theme-xs transition-all focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-500 ${
          selectedValue
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-500"
        } ${className}`}
        value={selectedValue}
        onChange={handleChange}
      >
        <option value="" disabled className="dark:bg-gray-900">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom Chevron Arrow - Since appearance-none hides the default one */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};

export default Select;
