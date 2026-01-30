/**
 * @fileoverview Reusable Input Component
 * Handles multiple HTML5 input types with unified branding,
 * dark mode support, and transactional feedback states (error/success).
 * * Features:
 * 1. Auto-select on focus (crucial for numeric data entry).
 * 2. High-precision numeric support (default step="any").
 * 3. Theme-aware styling (Light/Dark mode).
 * 4. Contextual hints and validation states.
 */

import type React from "react";
import type { FC } from "react";
 
interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number | string;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  required = false,
  error = false,
  autoFocus = false,
  hint,
  autoComplete,
  maxLength,
}) => {
  // Base structural classes
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 transition-all ${className}`;

  /**
   * Logical State Styling:
   * Prioritizes 'Disabled', then 'Error', then 'Success', falling back to 'Default'.
   */
  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` border-error-500 dark:border-error-300 focus:border-error-400 focus:ring-error-500/20 dark:text-error-300 dark:border-error-500 dark:focus:border-error-800`;
  } else if (success) {
    inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative w-full">
      <input
        autoFocus={autoFocus}
        required={required}
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        /**
         * FOCUS ENHANCEMENT:
         * Automatically highlights the entire content (like a '0' default)
         * so the user can immediately overwrite without deleting.
         */
        onFocus={(e) => e.target.select()}
        min={min}
        max={max}
        /**
         * STEP PRECISION:
         * Defaulting to "any" allows the input to accept any decimal (0.01, 1.5, etc.)
         * without browser validation errors.
         */
        step={step || "any"}
        maxLength={maxLength}
        disabled={disabled}
        className={inputClasses}
      />

      {/* Helper text or validation message */}
      {hint && (
        <p
          className={`mt-1.5 text-xs ${error ? "text-error-500 dark:text-error-400" : success ? "text-success-500" : "text-gray-500"}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
