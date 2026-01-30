import { PlusIcon } from "../../icons";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowPath,
  HiOutlineXMark,
} from "react-icons/hi2";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { useState } from "react";
import { Modal } from "../ui/modal";

interface ItemFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  sortConfig: string;
  setSortConfig: (val: string) => void;
  setPage: (page: number) => void;
  loading: boolean;
  canManage: boolean;
  onAdd: () => void;
  onRefresh: () => void;
}

const CustomChevron = () => (
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

const PulseDot = () => (
  <span className="relative flex h-2 w-2 ml-1.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
  </span>
);

export default function ItemFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  sortConfig,
  setSortConfig,
  setPage,
  loading,
  canManage,
  onAdd,
  onRefresh,
}: ItemFiltersProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const defaults = {
    status: "active",
    type: "all",
    sort: "name:asc",
  };

  const isStatusChanged = statusFilter !== defaults.status;
  const isTypeChanged = typeFilter !== defaults.type;
  const isSortChanged = sortConfig !== defaults.sort;
  const hasActiveFilters = isStatusChanged || isTypeChanged || isSortChanged;

  const handleReset = () => {
    setStatusFilter(defaults.status);
    setTypeFilter(defaults.type);
    setSortConfig(defaults.sort);
    setPage(1);
    setIsFilterModalOpen(false);
  };

  const FilterFields = () => (
    <>
      {/* Status */}
      <div className="w-full xl:w-36">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-widest">
          Status {isStatusChanged && <PulseDot />}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-10 rounded-lg border border-gray-300 bg-transparent pl-3 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:border-brand-500 text-sm font-medium transition-colors"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <CustomChevron />
        </div>
      </div>

      {/* Category/Type */}
      <div className="w-full xl:w-40">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-widest">
          Category {isTypeChanged && <PulseDot />}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-10 rounded-lg border border-gray-300 bg-transparent pl-3 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:border-brand-500 text-sm font-medium transition-colors"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Types</option>
            <option value="Product">Products</option>
            <option value="Service">Services</option>
          </select>
          <CustomChevron />
        </div>
      </div>

      {/* Sorting */}
      <div className="w-full xl:w-48">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-widest">
          Sort By {isSortChanged && <PulseDot />}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-10 rounded-lg border border-gray-300 bg-transparent pl-3 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:border-brand-500 text-sm font-medium transition-colors"
            value={sortConfig}
            onChange={(e) => setSortConfig(e.target.value)}
          >
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="price:asc">Price (Low)</option>
            <option value="price:desc">Price (High)</option>
            <option value="createdAt:desc">Newest First</option>
          </select>
          <CustomChevron />
        </div>
      </div>
    </>
  );

  return (
    // DESIGN CHANGE: Removed border/rounded. Added border-b.
    <div className="p-4 xl:p-5 border-b border-gray-200 dark:border-white/[0.05] bg-transparent">
      <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
        
        {/* Search + Mobile Controls */}
        <div className="flex flex-1 items-end gap-2">
          <div className="flex-1">
            <label className="hidden xl:block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">
              Search Catalog
            </label>
            <Input
              placeholder="Search product name, SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-10" // Matched height
            />
          </div>
          
          <div className="relative flex xl:hidden gap-2">
             {/* Mobile Filter Trigger */}
            <Button
              variant="outline"
              onClick={() => setIsFilterModalOpen(true)}
              className="h-10 px-3 relative border-gray-200 dark:border-white/10"
            >
              <HiOutlineAdjustmentsHorizontal className="size-5" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500 border-2 border-white dark:border-gray-900"></span>
                </span>
              )}
            </Button>
            
             {/* Mobile Refresh */}
             <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
                className="h-10 px-3 border-gray-200 dark:border-white/10"
              >
                <HiOutlineArrowPath className={`size-5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden xl:flex xl:flex-row gap-4">
          <FilterFields />
        </div>

        {/* Desktop Actions */}
        <div className="hidden xl:flex items-center gap-2">
           <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="h-10 px-4 bg-white dark:bg-transparent"
          >
            <HiOutlineArrowPath className={`size-5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {canManage && (
            <Button
              onClick={onAdd}
              className="h-10 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest px-6 shadow-sm shadow-brand-500/20"
            >
              <PlusIcon className="size-5 fill-current" /> Add Item
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Add Button Row */}
      {canManage && (
        <div className="mt-4 xl:hidden">
           <Button
              onClick={onAdd}
              className="w-full h-10 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
            >
              <PlusIcon className="size-4 fill-current" /> Add Item
            </Button>
        </div>
      )}

      {/* Professional Modal */}
      {isFilterModalOpen && (
        <Modal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          className="max-w-[550px] m-4 w-full"
        >
          <div className="flex flex-col h-full max-h-[85vh] sm:max-h-[80vh]">
            {/* Header */}
            <div className="flex-none px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 rounded-t-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 dark:bg-white/5 rounded-lg text-brand-600 dark:text-brand-400">
                    <HiOutlineAdjustmentsHorizontal className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                      Refine Catalog
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                      Filter by type, status or sort
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="group p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <HiOutlineXMark className="size-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <div className="flex flex-col gap-6">
                <FilterFields />
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex-none px-6 py-5 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 backdrop-blur-sm rounded-b-2xl">
              <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={!hasActiveFilters}
                  onClick={handleReset}
                   className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 border border-transparent
                    ${
                      hasActiveFilters
                        ? "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                        : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    }
                  `}
                >
                  Reset
                </button>
                <Button
                  className="w-full sm:flex-1 h-11 text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}