type BadgeVariant = "light" | "solid";
type BadgeSize =  "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant; // Light or solid variant
  size?: BadgeSize; // Badge size
  color?: BadgeColor; // Badge color
  startIcon?: React.ReactNode; // Icon at the start
  endIcon?: React.ReactNode; // Icon at the end
  children: React.ReactNode; // Badge content
  className?: String;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
  className
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  // Define size styles
  const sizeStyles = {
    sm: "text-theme-xs", // Smaller padding and font size
    md: "text-sm", // Default padding and font size
  };

  // Define color styles for variants
  const variants = {
    light: {
      primary:
        "bg-brand-100 text-brand-700 border border-brand-300 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20",
      success:
        "bg-success-100 text-success-700 border border-success-300 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20",
      error:
        "bg-error-100 text-error-700 border border-error-300 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20",
      warning:
        "bg-warning-100 text-warning-700 border border-warning-300 dark:bg-warning-500/10 dark:text-warning-400 dark:border-warning-500/20",
      info: 
        "bg-blue-light-100 text-blue-light-700 border border-blue-light-300 dark:bg-blue-light-500/10 dark:text-blue-light-400 dark:border-blue-light-500/20",
      light: 
        "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-white/5 dark:text-gray-300 dark:border-white/10",
      dark: 
        "bg-gray-200 text-gray-900 border border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
    },
    solid: {
      primary: "bg-brand-500 text-white dark:bg-brand-500",
      success: "bg-success-500 text-white dark:bg-success-500",
      error: "bg-error-500 text-white dark:bg-error-500",
      warning: "bg-warning-500 text-white dark:bg-warning-500",
      info: "bg-blue-light-500 text-white dark:bg-blue-light-500",
      light: "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      dark: "bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-100",
    },
  };

  // Get styles based on size and color variant
  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles} ${className}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
