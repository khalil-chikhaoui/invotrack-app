/**
 * @fileoverview RadioSm Component
 * A compact, high-density radio button designed for data-rich interfaces.
 * Features:
 * 1. Compact Footprint: Uses a 16px (h-4 w-4) circle for minimal visual weight.
 * 2. Accessible Design: Utilizes 'sr-only' for the native input to maintain keyboard
 * and screen reader compatibility while displaying a custom UI.
 * 3. Dynamic State: Clear distinction between selected and unselected states via brand colors.
 * 4. Theme Integrated: Optimized for Dark Mode with specific background-matching for the inner dot.
 */

import React from "react";

interface RadioProps {
  id: string; // Unique ID for the radio button
  name: string; // Group name to ensure exclusive selection
  value: string; // The value represented by this specific option
  checked: boolean; // Current selection status
  label: string; // Textual content displayed next to the control
  onChange: (value: string) => void; // Dispatches the value change to parent state
  className?: string; // Additional layout classes
}

const RadioSm: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
}) => {
  return (
    <label
      htmlFor={id}
      className={`group flex items-center cursor-pointer select-none text-xs font-medium transition-colors
        ${
          checked
            ? "text-gray-900 dark:text-white"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        } 
        ${className}`}
    >
      <span className="relative flex items-center">
        {/* Native input remains functionally active for A11y */}
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="sr-only"
        />

        {/* Custom Visual UI: The Outer Ring */}
        <span
          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200
            ${
              checked
                ? "border-brand-500 bg-brand-500"
                : "border-gray-300 bg-transparent dark:border-gray-700 group-hover:border-brand-400"
            }`}
        >
          {/* Custom Visual UI: The Inner Indicator */}
          <span
            className={`h-1.5 w-1.5 rounded-full transition-transform duration-200 
              ${checked ? "bg-white scale-100" : "bg-transparent scale-0"}
            `}
          />
        </span>
      </span>

      <span className="leading-none">{label}</span>
    </label>
  );
};

export default RadioSm;
