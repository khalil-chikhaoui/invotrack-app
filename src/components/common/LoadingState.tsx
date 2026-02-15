interface LoadingStateProps {
  message?: string;
  minHeight?: string; // e.g., "50vh" or "full"
}

export default function LoadingState({
  message = "Loading Data...",
  minHeight = "50vh",
}: LoadingStateProps) {
  return (
    <div
      className="flex flex-col flex-1 items-center justify-center"
      style={{ minHeight }}
    >
      {/* The Spinner */}
      <div className="w-8 h-8 border-3 border-brand-600 dark:border-brand-200 rounded-full border-t-transparent dark:border-t-transparent animate-spin" />

      {/* The Label */}
      <p className="mt-3 text-brand-600 dark:text-brand-200 font-medium text-sm ">
        {message}
      </p>
    </div>
  );
}
