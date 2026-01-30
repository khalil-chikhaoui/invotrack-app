/**
 * @fileoverview Switch (Toggle) Component
 * A customizable, accessible binary toggle for the Invotrack UI.
 * Features:
 * 1. Semantic Accessibility: Uses a hidden checkbox to maintain native form behavior.
 * 2. Visual Themes: Supports 'blue' (brand) and 'gray' color variants.
 * 3. Smooth Transitions: High-performance CSS transforms for the knob movement.
 * 4. State Management: Fully supports disabled states with desaturated colors.
 */

import React, { useState, useEffect } from "react";

interface SwitchProps {
  label: string;
  checked?: boolean; // Controlled state support
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "gray";
  id?: string;
}

const Switch: React.FC<SwitchProps> = ({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  color = "blue",
  id,
}) => {
  // Support both controlled and uncontrolled usage
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;

    const nextState = !isChecked;
    if (checked === undefined) {
      setInternalChecked(nextState);
    }

    onChange?.(nextState);
  };

  /**
   * Color Orchestration:
   * Dynamically assigns Tailwind classes based on the 'color' prop and state.
   */
  const getThemeClasses = () => {
    if (disabled) return "bg-gray-100 dark:bg-gray-800 cursor-not-allowed";

    if (color === "blue") {
      return isChecked ? "bg-brand-500" : "bg-gray-200 dark:bg-white/10";
    }

    return isChecked
      ? "bg-gray-800 dark:bg-brand-400"
      : "bg-gray-200 dark:bg-white/10";
  };

  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 text-sm font-medium select-none transition-colors
        ${
          disabled
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
        }`}
    >
      <div className="relative inline-flex items-center">
        {/* Hidden checkbox for native accessibility (tab-navigation, screen readers) */}
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={handleToggle}
          disabled={disabled}
        />

        {/* Track */}
        <div
          className={`h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${getThemeClasses()}`}
        />

        {/* Knob */}
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out transform
            ${isChecked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </div>

      <span className="leading-none">{label}</span>
    </label>
  );
};

export default Switch;
