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
    <div
      className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-t border-gray-100 
    dark:border-white/[0.05] bg-gray-50/30 dark:bg-transparent"
    >
      {/* Page Counter Text */}
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
        Page{" "}
        <span className="text-gray-900 dark:text-white">{currentPage}</span> of{" "}
        <span
          className="text-gray-900 dark:text-white"
        >
          {totalPages}
        </span>
      </div>

      {/* Controls Container */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
        type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="group flex items-center justify-center w-8 h-8 rounded-full bg-white 
          dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] text-gray-500 dark:text-gray-400
           hover:bg-gray-50 dark:hover:bg-white/[0.1] hover:text-gray-900 dark:hover:text-white transition-all 
           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:dark:hover:bg-white/[0.05]"
          title="Previous Page"
        >
          <HiChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Number Pill */}
        <div
          className="hidden sm:flex items-center gap-1 bg-white dark:bg-white/[0.03] px-1.5 py-1 rounded-full 
        border border-gray-200 dark:border-white/[0.1] shadow-sm"
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
                w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-200
                ${
                  typeof pageNum !== "number"
                    ? "cursor-default text-gray-400 dark:text-gray-600"
                    : currentPage === pageNum
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-100"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.1] hover:text-gray-900 dark:hover:text-white hover:scale-105"
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

        {/* Mobile View Number (Replaces Pill on small screens) */}
        <span className="sm:hidden text-xs font-bold text-gray-800 dark:text-white">
          {currentPage} / {totalPages}
        </span>

        {/* Next Button */}
        <button
        type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="group flex items-center justify-center w-8 h-8 rounded-full bg-white 
          dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] text-gray-500 dark:text-gray-400
           hover:bg-gray-50 dark:hover:bg-white/[0.1] hover:text-gray-900 dark:hover:text-white transition-all 
           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:dark:hover:bg-white/[0.05]"
          title="Next Page"
        >
          <HiChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
