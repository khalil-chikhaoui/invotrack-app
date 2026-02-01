import { useState, useRef, useEffect } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi2";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string; // For controlling width (e.g., w-40)
  isActive?: boolean; // To show the PulseDot
  placeholder?: string;
}

const PulseDot = () => (
  <span className="relative flex h-2 w-2 ml-1.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
  </span>
);

export default function SelectField({
  label,
  value,
  onChange,
  options,
  className = "w-full",
  isActive = false,
  placeholder = "Select...",
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the label for the current selected value
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-semibold text-gray-700 dark:text-gray-300  mb-1.5 flex items-center uppercase tracking-wide">
          {label} {isActive && <PulseDot />}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-full h-11 pl-3 pr-10 text-left bg-transparent border rounded-lg outline-none transition-all duration-200 cursor-pointer flex items-center
            ${
              isOpen
                ? "border-brand-500 ring-1 ring-brand-500"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
            }
          `}
        >
          <span className="block truncate text-sm font-medium text-gray-700 dark:text-gray-200">
            {selectedLabel || placeholder}
          </span>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <HiChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-brand-500" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
            <ul className="max-h-60 overflow-auto py-1 custom-scrollbar">
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors
                        ${
                          isSelected
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                        }
                      `}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <HiCheck className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}