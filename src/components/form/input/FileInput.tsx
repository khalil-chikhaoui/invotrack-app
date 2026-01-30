/**
 * @fileoverview FileInput Component
 * A stylized file uploader component with a unified theme.
 * Features:
 * 1. Specialized Styling: Uses Tailwind's 'file:' modifier to style the native button.
 * 2. High Density: Matches the standard 'h-11' height of other inputs in the system.
 * 3. Theme Responsive: Fully supports Dark Mode with background and border shifts.
 * 4. UX Polish: Includes hover states for the internal file picker button.
 */

import { FC, ChangeEvent } from "react";

interface FileInputProps {
  /** Optional override for layout or additional styling */
  className?: string;
  /** Dispatches the change event to the parent for processing (e.g., logo upload) */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Standard accessibility and form identification */
  id?: string;
  /** Restricts file types (e.g., "image/*") */
  accept?: string;
}

const FileInput: FC<FileInputProps> = ({
  className = "",
  onChange,
  id,
  accept,
}) => {
  return (
    <div className="relative w-full">
      <input
        type="file"
        id={id}
        accept={accept}
        onChange={onChange}
        className={`
          /* --- Base Structural Styling --- */
          h-11 w-full overflow-hidden rounded-lg border border-gray-300 
          bg-transparent text-sm text-gray-500 shadow-theme-xs transition-all
          placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 
          focus:border-brand-500 cursor-pointer

          /* --- Internal 'File Picker' Button Styling --- */
          file:mr-4 file:h-full file:px-4 file:cursor-pointer
          file:border-0 file:border-r file:border-solid file:border-gray-200 
          file:bg-gray-50 file:text-xs file:font-semibold file:uppercase file:tracking-widest
          file:text-gray-700 hover:file:bg-gray-100 transition-colors

          /* --- Dark Mode Overrides --- */
          dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 
          dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 
          dark:hover:file:bg-white/[0.05]
          
          ${className}
        `}
      />
    </div>
  );
};

export default FileInput;
