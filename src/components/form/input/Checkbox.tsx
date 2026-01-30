/**
 * @fileoverview Checkbox Component
 * A customizable, theme-aware checkbox input with accessible labeling.
 * Features:
 * 1. Semantic Feedback: Visual checkmark using SVG overlays.
 * 2. State Management: Supports Checked, Unchecked, and Disabled states.
 * 3. Accessibility: Uses label wrapping for a larger click target and group hover effects.
 * 4. Theme Support: Dark mode border adjustments and brand-colored active states.
 */

import type React from "react";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-center space-x-3 group cursor-pointer transition-opacity ${
        disabled ? "cursor-not-allowed opacity-60" : "active:opacity-90"
      }`}
    >
      <div className="relative flex items-center justify-center w-5 h-5">
        {/* Native Hidden Checkbox for Functionality */}
        <input
          id={id}
          type="checkbox"
          className={`w-5 h-5 appearance-none cursor-pointer rounded-md border transition-all 
          duration-200 focus:ring-2 focus:ring-brand-500/20 outline-none
          ${
            checked
              ? "bg-brand-500 border-transparent"
              : "bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700 group-hover:border-brand-400"
          } 
          ${disabled ? "cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""} 
          ${className}`}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />

        {/* Custom SVG Checkmark (Visible when checked) */}
        {checked && !disabled && (
          <svg
            className="absolute pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* Disabled State Iconography */}
        {disabled && (
          <svg
            className="absolute pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="#E4E7EC"
              strokeWidth="2.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Conditional Label Rendering */}
      {label && (
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 select-none">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
