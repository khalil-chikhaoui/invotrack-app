export default function ChartSkeleton() {
  return (
    <div className="h-full w-full animate-pulse rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-gray-900">
      {/* Title Placeholder */}
      <div className="mb-6 flex justify-between">
        <div>
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
          <div className="mt-2 h-3 w-48 rounded bg-gray-100 dark:bg-gray-800"></div>
        </div>
      </div>

      {/* Chart Content Placeholder */}
      <div className="flex h-[280px] items-end gap-2">
        {/* Simulate some bars or a graph area */}
        <div className="h-full w-full rounded-xl bg-gray-100 dark:bg-gray-800/50"></div>
      </div>
    </div>
  );
}
