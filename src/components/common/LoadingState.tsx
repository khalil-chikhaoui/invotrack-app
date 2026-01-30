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
      <div className="w-11 h-11 border-3 border-brand-600 dark:border-brand-300 rounded-full border-t-transparent dark:border-t-transparent animate-spin" />

      {/* The Label */}
      <p className="mt-5 text-brand-500 dark:text-brand-300 font-semibold text-sm ">
        {message}
      </p>
    </div>
  );
}
