/**
 * @fileoverview MultiSelect Component
 * A feature-rich dropdown for selecting multiple values, rendered as removable tags.
 * Features:
 * 1. Hybrid State: Supports both controlled and uncontrolled usage patterns.
 * 2. Tag Cloud UI: Selected items are rendered as chips within the input area.
 * 3. Accessibility: Full keyboard navigation (Arrows, Enter, Escape) and ARIA roles.
 * 4. UX Polish: Click-outside detection and transition-aware dropdown positioning.
 */

import type React from "react";
import { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  text: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  defaultSelected?: string[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  value,
  onChange,
  disabled = false,
  placeholder = "Select options",
}) => {
  // Determine if component is being controlled by a parent state
  const isControlled = value !== undefined;
  const [internalSelected, setInternalSelected] =
    useState<string[]>(defaultSelected);
  const selectedOptions = isControlled ? value : internalSelected;

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Click-Outside Listener:
   * Ensures the dropdown closes automatically when the user clicks elsewhere.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const updateSelection = (newSelected: string[]) => {
    if (!isControlled) setInternalSelected(newSelected);
    onChange?.(newSelected);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (optionValue: string) => {
    const newSelected = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((v) => v !== optionValue)
      : [...selectedOptions, optionValue];
    updateSelection(newSelected);
  };

  const removeOption = (optionValue: string) => {
    updateSelection(selectedOptions.filter((v) => v !== optionValue));
  };

  /**
   * Keyboard Navigation:
   * Implements standard W3C 'combobox' behavior for accessibility.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0) {
          handleSelect(options[focusedIndex].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
    }
  };

  return (
    <div className="w-full text-start" ref={dropdownRef}>
      <label
        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400 uppercase tracking-widest"
        id={`${label}-label`}
      >
        {label}
      </label>

      <div className="relative z-20 w-full">
        <div className="relative flex flex-col items-center">
          <div
            onClick={toggleDropdown}
            onKeyDown={handleKeyDown}
            className="w-full"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-labelledby={`${label}-label`}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          >
            {/* Input Container with Tag Cloud */}
            <div
              className={`flex min-h-11 w-full rounded-lg border border-gray-300 py-1.5 pl-3 pr-3 shadow-theme-xs transition-all focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 ${
                disabled
                  ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                  : "cursor-pointer"
              }`}
            >
              <div className="flex flex-wrap flex-auto gap-2">
                {selectedOptions.length > 0 ? (
                  selectedOptions.map((val) => {
                    const text =
                      options.find((opt) => opt.value === val)?.text || val;
                    return (
                      <div
                        key={val}
                        className="flex items-center gap-1.5 rounded-full bg-gray-100 py-0.5 px-3 text-[11px] font-semibold uppercase tracking-tight text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:border-gray-700"
                      >
                        <span>{text}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!disabled) removeOption(val);
                          }}
                          className="text-gray-400 hover:text-error-500 transition-colors"
                          aria-label={`Remove ${text}`}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 14 14"
                            fill="currentColor"
                          >
                            <path d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500 self-center">
                    {placeholder}
                  </span>
                )}
              </div>
              <div className="flex items-center pl-2 border-l border-gray-100 dark:border-white/5 ml-2">
                <svg
                  className={`size-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div
              className="absolute left-0 z-40 w-full mt-2 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-xl top-full max-h-60 overflow-y-auto dark:bg-gray-900 dark:border-white/10"
              role="listbox"
            >
              {options.map((option, index) => {
                const isSelected = selectedOptions.includes(option.value);
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={option.value}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors border-b last:border-0 border-gray-50 dark:border-white/5 ${
                      isFocused ? "bg-gray-50 dark:bg-white/5" : ""
                    } ${isSelected ? "bg-brand-50/50 dark:bg-brand-500/10" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span
                      className={`text-sm ${isSelected ? "text-brand-600 dark:text-brand-400 font-semibold" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {option.text}
                    </span>
                    {isSelected && (
                      <svg
                        className="size-4 text-brand-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiSelect;
