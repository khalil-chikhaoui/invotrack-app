/**
 * @fileoverview Radio Component
 * A customizable, theme-aware radio button for exclusive selection within a group.
 * Features:
 * 1. Semantic Accessibility: Uses 'sr-only' for the native input while providing a custom visual UI.
 * 2. Visual Feedback: Clear 'checked' state with a brand-colored background and inner circle.
 * 3. State Management: Fully supports disabled states with 'cursor-not-allowed' and desaturated colors.
 * 4. Responsive & Theme-Aware: Adapts borders and background colors for Dark Mode.
 */

import type React from "react";

interface RadioProps {
  id: string; // Unique ID for the radio button
  name: string; // Radio group name for native form behavior
  value: string; // The specific value this radio represents
  checked: boolean; // Current selection status
  label: string; // Textual content for the user
  onChange: (value: string) => void; // State update dispatcher
  className?: string; // Additional layout overrides
  disabled?: boolean; // Interaction lockout
}

const Radio: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`relative flex items-center gap-3 text-sm font-medium select-none transition-colors
        ${
          disabled
            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            : "text-gray-700 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
        } 
        ${className}`}
    >
      {/* Native input is visually hidden but remains accessible to screen readers 
        and keyboard navigation (Tab/Space).
      */}
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={() => !disabled && onChange(value)}
        className="sr-only"
        disabled={disabled}
      />

      {/* Outer Circle Ring */}
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.25px] transition-all duration-200
          ${
            checked
              ? "border-brand-500 bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
              : "bg-transparent border-gray-300 dark:border-gray-700"
          } 
          ${
            disabled
              ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-none"
              : ""
          }`}
      >
        {/* Inner Selection Dot */}
        <span
          className={`h-2 w-2 rounded-full bg-white transition-transform duration-200 
            ${checked ? "scale-100" : "scale-0"}
          `}
        />
      </span>

      {/* Label Text */}
      <span className="leading-none">{label}</span>
    </label>
  );
};

export default Radio;
