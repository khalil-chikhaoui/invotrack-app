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

interface ClientFiltersProps {
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
    <svg
      className="size-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
);

const PulseDot = () => (
  <span className="relative flex h-2 w-2 ml-1.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
  </span>
);

export default function ClientFilters({
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
}: ClientFiltersProps) {
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
      {/* Status Filter */}
      <div className="w-full xl:w-32">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-[0.15em]">
          Status {isStatusChanged && <PulseDot />}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-11 rounded-lg border border-gray-300 bg-transparent pl-4 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:border-brand-500 text-sm font-medium transition-colors"
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

      {/* Type Filter */}
      <div className="w-full xl:w-40">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-[0.15em]">
          Client Type {isTypeChanged && <PulseDot />}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-11 rounded-lg border border-gray-300 bg-transparent pl-4 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:border-brand-500 text-sm font-medium transition-colors"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Types</option>
            <option value="Business">Business</option>
            <option value="Individual">Individual</option>
          </select>
          <CustomChevron />
        </div>
      </div>

      {/* Sort Filter */}
      <div className="w-full xl:w-48">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-[0.15em]">
          Sort By {isSortChanged && <PulseDot />}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-11 rounded-lg border border-gray-300 bg-transparent pl-4 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:border-brand-500 text-sm font-medium transition-colors"
            value={sortConfig}
            onChange={(e) => setSortConfig(e.target.value)}
          >
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
          </select>
          <CustomChevron />
        </div>
      </div>
    </>
  );

  return (
    <div className="p-4 xl:p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-2xl">
      <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
        <div className="flex flex-1 items-end gap-2">
          <div className="flex-1">
            <label className="hidden xl:block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-[0.15em]">
              Search
            </label>
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsFilterModalOpen(true)}
              className="xl:hidden h-11 px-3 border-gray-200 dark:border-white/10"
            >
              <HiOutlineAdjustmentsHorizontal className="size-5" />
            </Button>
            {hasActiveFilters && (
              <span className="xl:hidden absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500 border-2 border-white dark:border-gray-900"></span>
              </span>
            )}
          </div>
        </div>

        <div className="hidden xl:flex xl:flex-row gap-4">
          <FilterFields />
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              onClick={onAdd}
              className="flex-1 xl:flex-none h-11 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest px-6"
            >
              <PlusIcon className="size-5 fill-current" />{" "}
              <span className="xl:inline">Add Client</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="h-11 px-4 border-gray-200 dark:border-white/10"
          >
            <HiOutlineArrowPath
              className={`size-5 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

    {isFilterModalOpen && (
  <Modal
    isOpen={isFilterModalOpen}
    onClose={() => setIsFilterModalOpen(false)}
    className="max-w-[600px] m-4"
  >
    <form 
      onSubmit={(e) => {
        e.preventDefault();
       
        setIsFilterModalOpen(false);
      }}
      className="flex flex-col h-full max-h-[90vh]"
    >
      {/* Modal Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Refine Search
          </h3>
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <HiOutlineXMark className="size-6 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Adjust the criteria below to filter your client list.
        </p>
      </div>

      {/* Modal Body */}
      <div className="px-6 py-5 overflow-y-auto">
        <div className="grid grid-cols-1 gap-5">
          <FilterFields />
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-6 py-6 mt-auto bg-gray-50/50 dark:bg-white/[0.01]">
        <div className="flex flex-col gap-3">
          <Button
            type="submit" 
            className="w-full h-12 text-sm font-medium tracking-widest"
          >
            Apply Filters
          </Button>

          <button
            type="button" 
            className={`w-full py-2 text-xs font-medium uppercase tracking-widest transition-colors mt-1
              ${
                hasActiveFilters
                  ? "text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                  : "text-gray-500 dark:text-gray-200 pointer-events-none opacity-50"
              }`}
            onClick={handleReset}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </form>
  </Modal>
)}
    </div>
  );
}
