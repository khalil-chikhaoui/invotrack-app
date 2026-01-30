/**
 * @fileoverview Reusable Form Wrapper
 * Provides a standardized structure for data collection across the platform.
 * Features:
 * 1. Default Prevention: Automatically handles 'preventDefault' to support SPA transitions.
 * 2. Slot Pattern: Uses 'children' to allow for flexible, nested form layouts.
 * 3. Event Passthrough: Forwards the full FormEvent to the parent for advanced processing.
 * 4. Layout Neutrality: Minimal default styling to allow parent-driven grid/flex configurations.
 */

import { FC, ReactNode, FormEvent } from "react";

interface FormProps {
  /** Callback executed on form submission */
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** Form fields, labels, and action buttons */
  children: ReactNode;
  /** Optional layout classes (e.g., 'space-y-4' or 'grid grid-cols-2') */
  className?: string;
  /** Optional ID for linking with external submit buttons via 'form' attribute */
  id?: string;
}

const Form: FC<FormProps> = ({ onSubmit, children, className = "", id }) => {
  /**
   * Internal submit handler to ensure the SPA-friendly
   * 'preventDefault' is always executed.
   */
  const handleSubmission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <form
      id={id}
      onSubmit={handleSubmission}
      className={className}
      // Enables standard browser validation styling
      noValidate={false}
    >
      {children}
    </form>
  );
};

export default Form;
