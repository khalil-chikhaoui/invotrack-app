/**
 * @fileoverview TextArea Component
 * A stylized, multi-line text input designed for the Invotrack UI.
 * Features:
 * 1. Semantic Feedback: Visual state changes for Error and Disabled modes.
 * 2. Theme Integration: Seamless transition between Light and Dark modes.
 * 3. Contextual Hints: Supports status-aware helper text (hints).
 * 4. Controlled State: Uses a clean string-based callback for parent state updates.
 */

import React from "react";

interface TextareaProps {
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void; // Dispatches the raw string value
  className?: string;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
  autoFocus?: boolean;
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Enter text...",
  rows = 3,
  value = "",
  autoFocus = false,
  onChange,
  className = "",
  disabled = false,
  error = false,
  hint = "",
}) => {
  /**
   * Dispatches the internal event value to the parent callback.
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Base structural classes
  let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs transition-all duration-200 focus:outline-none ${className} `;

  /**
   * Logic State Styling:
   * Prioritizes 'Disabled', then 'Error', falling back to 'Default/Brand'.
   */
  if (disabled) {
    textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    textareaClasses += ` bg-transparent border-error-500 focus:border-error-500 focus:ring-4 focus:ring-error-500/10 dark:bg-gray-900 dark:text-white/90`;
  } else {
    textareaClasses += ` bg-transparent text-gray-900 border-gray-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:text-gray-300`;
  }

  return (
    <div className="relative w-full">
      <textarea
        autoFocus={autoFocus}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={textareaClasses}
      />

      {/* Helper text / Hint display */}
      {hint && (
        <p
          className={`mt-1.5 text-xs font-medium ${
            error ? "text-error-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea;
