/**
 * @fileoverview Label Component
 * A semantic wrapper for form field titles.
 * Features:
 * 1. Semantic Association: Supports 'htmlFor' to link with specific inputs (A11y).
 * 2. Style Merging: Uses tailwind-merge to prevent class conflicts when overrides are passed.
 * 3. Conditional Classes: Uses clsx for clean, logical class joining.
 * 4. Theme Integration: Adapts text color for Dark/Light modes.
 */

import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

interface LabelProps {
  /** The ID of the input this label belongs to (crucial for accessibility) */
  htmlFor?: string;
  /** The textual content or required-marker icon */
  children: ReactNode;
  /** Optional style overrides from the parent form */
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        twMerge(
          // Base styles: tight margins and medium weight for clarity
          "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400 text-start",
          className,
        ),
      )}
    >
      {children}
    </label>
  );
};

export default Label;
