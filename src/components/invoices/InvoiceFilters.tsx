import { useState, useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowPath,
  HiOutlineXMark,
} from "react-icons/hi2";
import { PlusIcon, CalenderIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { Modal } from "../ui/modal";
import { DELIVERY_STATUS_OPTIONS } from "../../apis/invoices";

interface InvoiceFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: any) => void;
  deliveryFilter: string;
  setDeliveryFilter: (val: any) => void;
  sortConfig: string;
  setSortConfig: (val: string) => void;
  dateRange: string;
  setDateRange: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  setPage: (page: number) => void;
  loading: boolean;
  canManage: boolean;
  onAdd: () => void;
  onRefresh: () => void;
  placeholder: string;
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

export default function InvoiceFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  deliveryFilter,
  setDeliveryFilter,
  sortConfig,
  setSortConfig,
  dateRange,
  setDateRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  setPage,
  loading,
  canManage,
  onAdd,
  onRefresh,
  placeholder,
}: InvoiceFiltersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const datePickerRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters =
    statusFilter !== "" || deliveryFilter !== "" || dateRange !== "all";

  const handleReset = () => {
    setStatusFilter("");
    setDeliveryFilter("");
    setDateRange("all");
    setSortConfig("issueDate:desc");
    setPage(1);
  };

  useEffect(() => {
    if (dateRange === "custom" && datePickerRef.current) {
      const fp = flatpickr(datePickerRef.current, {
        mode: "range",
        static: true,
        dateFormat: "M d, Y",
        defaultDate: startDate && endDate ? [startDate, endDate] : [new Date(), new Date()],
        onClose: (selectedDates, _, instance) => {
          if (selectedDates.length === 2) {
            setStartDate(instance.formatDate(selectedDates[0], "Y-m-d"));
            setEndDate(instance.formatDate(selectedDates[1], "Y-m-d"));
          }
        },
      });
      return () => fp.destroy();
    }
  }, [dateRange, isModalOpen]);

  const FilterFields = () => (
    <>
      {/* Date Range */}
      <div className="w-full xl:w-44">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-widest">
          Time Frame {dateRange !== "all" && <PulseDot />}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-10 rounded-lg border border-gray-300 bg-transparent pl-3 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="lastweek">Last Week</option>
            <option value="lastmonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
          <CustomChevron />
        </div>
      </div>

      {/* Invoice Status */}
      <div className="w-full xl:w-40">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-widest">
          Payment {statusFilter !== "" && <PulseDot />}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-10 rounded-lg border border-gray-300 bg-transparent pl-3 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <CustomChevron />
        </div>
      </div>

      {/* Logistics */}
      <div className="w-full xl:w-40">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-widest">
          Logistics {deliveryFilter !== "" && <PulseDot />}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-10 rounded-lg border border-gray-300 bg-transparent pl-3 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
            value={deliveryFilter}
            onChange={(e) => {
              setDeliveryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Tracking</option>
            {DELIVERY_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <CustomChevron />
        </div>
      </div>

      {/* Sorting */}
      <div className="w-full xl:w-44">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">
          Sort By
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-10 rounded-lg border border-gray-300 bg-transparent pl-3 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
            value={sortConfig}
            onChange={(e) => setSortConfig(e.target.value)}
          >
            <option value="createdAt:desc">Created: Newest</option>
            <option value="createdAt:asc">Created: Oldest</option>
            <option value="issueDate:desc">Issued: Newest</option>
            <option value="issueDate:asc">Issued: Oldest</option>
            <option value="invoiceNumber:asc">Invoice # (0-9)</option>
            <option value="invoiceNumber:desc">Invoice # (9-0)</option>
            <option value="price:desc">Amount (High-Low)</option>
            <option value="price:asc">Amount (Low-High)</option>
          </select>
          <CustomChevron />
        </div>
      </div>
    </>
  );

  return (
    // DESIGN CHANGE: Removed border/shadow/rounded. Added border-b for separation.
    <div className="p-4 xl:p-5 border-b border-gray-200 dark:border-white/[0.05] bg-transparent">
      <div className="flex flex-col gap-4">
        {/* Top Row: Search + Filters + Actions */}
        <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
          {/* SEARCH FIELD + MOBILE BUTTONS */}
          <div className="flex-1 flex gap-2 items-end">
            <div className="flex-1">
              <label className="hidden xl:block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">
                Search
              </label>
              <Input
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="h-10" // Matched height
              />
            </div>

            {/* MOBILE: Inline Group */}
            <div className="flex xl:hidden gap-2">
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
                className="h-10 px-1 border-gray-200 dark:border-white/10"
              >
                <HiOutlineArrowPath className={`size-4.5 ${loading ? "animate-spin" : ""}`} />
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="h-10 px-1 relative border-gray-200 dark:border-white/10"
              >
                <HiOutlineAdjustmentsHorizontal className="size-4.5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 bg-brand-500 rounded-full border-2 border-white dark:border-gray-900" />
                )}
              </Button>
            </div>
          </div>

          {/* DESKTOP: Filter Fields */}
          <div className="hidden xl:flex items-end gap-3">
            <FilterFields />
          </div>

          {/* DESKTOP: Action Buttons */}
          <div className="hidden xl:flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
              className="h-10 px-3 bg-white dark:bg-transparent"
             
            >
              <HiOutlineArrowPath className={`size-5 ${loading ? "animate-spin" : ""}`} />
            </Button>

            {canManage && (
              <Button
                onClick={onAdd}
                className="h-10 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest px-5 shadow-sm shadow-brand-500/20"
              >
              <PlusIcon className="size-5 fill-current" />
                <span>New Invoice</span>
              </Button>
            )}
          </div>
        </div>

        {/* MOBILE: New Invoice Button */}
        {canManage && (
          <div className="xl:hidden">
            <Button
              onClick={onAdd}
              className="w-full h-10 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest"
            >
             <PlusIcon className="size-4 fill-current" />
              <span>New Invoice</span>
            </Button>
          </div>
        )}

        {/* Custom Date Range Expanded Row */}
        {dateRange === "custom" && (
          <div className="hidden xl:flex animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-gray-100 dark:border-white/5">
            <div className="relative w-64">
              <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 z-10" />
              <input
                ref={datePickerRef}
                className="h-10 w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 text-xs font-medium dark:border-gray-700 outline-none focus:border-brand-500 transition-all cursor-pointer"
                placeholder="Select date range"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Modal Filter */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="max-w-[500px] m-2.5"
        >
          {/* ... Modal content remains the same ... */}
           <div className="flex flex-col h-full max-h-[90vh]">
            <div className="px-6 py-5 border-b dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-semibold dark:text-white">
                Refine Registry
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <HiOutlineXMark className="size-6 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5 overflow-y-auto">
              <FilterFields />
              {dateRange === "custom" && (
                <div className="relative">
                  <label className="text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">
                    Select Dates
                  </label>
                  <div className="relative">
                    <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 z-10" />
                    <input
                      ref={datePickerRef}
                      className="h-12 w-full pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm"
                      placeholder="Pick Range"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 dark:bg-white/[0.02] flex flex-col gap-3">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="w-full h-12 text-sm font-medium tracking-widest"
              >
                Apply Filters
              </Button>
              <button
                onClick={handleReset}
                className="w-full py-2 mt-1 text-xs font-medium uppercase tracking-widest text-red-500 dark:text-red-400 "
              >
                Reset All
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}