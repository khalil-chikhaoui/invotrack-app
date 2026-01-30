import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset" | undefined;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type,
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      // CHANGED: Added active:scale-[0.98] for touch feedback and hover:bg-brand-700
      "bg-brand-600 text-white shadow-theme-xs hover:bg-brand-700 active:bg-brand-700 active:scale-[0.98] disabled:bg-brand-300 disabled:shadow-none disabled:active:scale-100",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] " +
      "dark:bg-transparent dark:text-gray-300 dark:ring-gray-600 " +
      "dark:hover:bg-white/[0.05] dark:hover:text-white dark:hover:ring-gray-500 disabled:active:scale-100",
  };

  return (
    <button
      type={type || "button"}
      // CHANGED: Added 'cursor-pointer', 'touch-manipulation', and 'select-none'
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 ease-in-out cursor-pointer touch-manipulation select-none ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;