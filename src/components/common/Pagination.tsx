import { HiDotsHorizontal } from "react-icons/hi";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Logic remains exactly as requested
  if (totalPages <= 1) return null;

  const generatePagination = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pages = generatePagination();

  return (
    <div className="w-full">
      <div
        className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6 
        border-t border-gray-200 dark:border-white/[0.05] 
        bg-white/50 dark:bg-transparent backdrop-blur-sm transition-all"
      >
        {/* Left: Info Text (Hidden on mobile to declutter, shown on sm+) */}
        <div className="hidden sm:block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Showing Page{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {currentPage}
          </span>{" "}
          of{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {totalPages}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
          {/* Mobile Previous Button (Larger touch target) */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="sm:hidden group flex items-center justify-center w-10 h-10 rounded-lg 
            bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] 
            text-gray-600 dark:text-gray-300 shadow-sm
            active:scale-95 active:bg-gray-50 transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            aria-label="Previous Page"
          >
            <HiChevronLeft className="size-5" />
          </button>

          {/* Desktop Previous Button (Round) */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="hidden sm:flex group items-center justify-center w-8 h-8 rounded-full 
            bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] 
            text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.1] 
            hover:text-gray-900 dark:hover:text-white transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <HiChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Mobile: Center Info Badge (Replaces the pill) */}
          <div className="sm:hidden flex flex-col items-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              Page
            </span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 font-mono">
              {currentPage} / {totalPages}
            </span>
          </div>

          {/* Desktop: Number Pill */}
          <div
            className="hidden sm:flex items-center gap-1 bg-white dark:bg-white/[0.03] px-1.5 py-1 rounded-full 
            border border-gray-200 dark:border-white/[0.1] shadow-sm ring-1 ring-gray-900/5 dark:ring-white/5"
          >
            {pages.map((pageNum, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() =>
                  typeof pageNum === "number" && onPageChange(pageNum)
                }
                disabled={typeof pageNum !== "number"}
                className={`
                  relative w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-500
                  ${
                    typeof pageNum !== "number"
                      ? "cursor-default text-gray-400 dark:text-gray-600"
                      : currentPage === pageNum
                        ? "bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-105"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.1] hover:text-gray-900 dark:hover:text-white hover:scale-110 active:scale-95"
                  }
                `}
              >
                {pageNum === "..." ? (
                  <HiDotsHorizontal className="size-3" />
                ) : (
                  pageNum
                )}
              </button>
            ))}
          </div>

          {/* Mobile Next Button (Larger touch target) */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="sm:hidden group flex items-center justify-center w-10 h-10 rounded-lg 
            bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] 
            text-gray-600 dark:text-gray-300 shadow-sm
            active:scale-95 active:bg-gray-50 transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            aria-label="Next Page"
          >
            <HiChevronRight className="size-5" />
          </button>

          {/* Desktop Next Button (Round) */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="hidden sm:flex group items-center justify-center w-8 h-8 rounded-full 
            bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] 
            text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.1] 
            hover:text-gray-900 dark:hover:text-white transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <HiChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
