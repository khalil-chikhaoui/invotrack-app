/**
 * @fileoverview DatePicker Component
 * A stylized wrapper for the Flatpickr library.
 * Updated to accept dynamic Flatpickr options (e.g., minDate) and custom classes.
 */

import { useEffect, useRef } from "react"; // Added useRef for safety
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "../form/Label"; // Adjusted import path based on context
import { CalenderIcon } from "../../icons"; // Adjusted import path
import { Options } from "flatpickr/dist/types/options";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: (selectedDates: Date[], dateStr: string, instance: flatpickr.Instance) => void;
  defaultDate?: string | Date | Date[];
  label?: string;
  placeholder?: string;
  className?: string; 
  options?: Partial<Options>; 
};

export default function DatePicker({
  id,
  mode = "single",
  onChange,
  label,
  defaultDate,
  placeholder = "YYYY-MM-DD",
  className,
  options,
}: PropsType) {
  const fp = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;

    fp.current = flatpickr(el, {
      mode: mode,
      static: false, // Allows absolute positioning
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate: defaultDate,
      onChange: onChange,
      ...options, // Spread extra options (allows passing minDate from parent)
    });

    return () => {
      fp.current?.destroy();
    };
  }, [mode, onChange, id, defaultDate, options]);

  return (
    <div className="w-full text-start">
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className={`
            h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm 
            shadow-theme-xs placeholder:text-gray-400 focus:outline-none transition-all
            bg-transparent text-gray-800 border-gray-300 focus:border-brand-500 
            focus:ring-4 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 
            dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-brand-500
            ${className || ""} 
          `}
        />
        <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-500">
          <CalenderIcon className="size-5" />
        </span>
      </div>
    </div>
  );
}