import { useState, useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { French } from "flatpickr/dist/l10n/fr.js";
import { German } from "flatpickr/dist/l10n/de.js";

import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation("invoice");
  const { t: tCommon } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Separate Refs to prevent conflict between Mobile and Desktop inputs
  const desktopPickerRef = useRef<HTMLInputElement>(null);
  const mobilePickerRef = useRef<HTMLInputElement>(null);

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
    // Collect all active refs (Desktop and Mobile/Modal)
    const activeRefs = [desktopPickerRef.current, mobilePickerRef.current];
    const instances: flatpickr.Instance[] = [];

    if (dateRange === "custom") {
      let locale: any = "default";
      if (i18n.language === "fr") locale = French;
      if (i18n.language === "de") locale = German;

      activeRefs.forEach((ref) => {
        if (ref) {
          const fp = flatpickr(ref, {
            mode: "range",
            dateFormat: "M d, Y",
            locale: locale,
            defaultDate:
              startDate && endDate
                ? [startDate, endDate]
                : [new Date(), new Date()],
            onClose: (selectedDates, _, instance) => {
              if (selectedDates.length === 2) {
                setStartDate(instance.formatDate(selectedDates[0], "Y-m-d"));
                setEndDate(instance.formatDate(selectedDates[1], "Y-m-d"));
              }
            },
          });
          instances.push(fp);
        }
      });
    }

    // Cleanup all instances
    return () => {
      instances.forEach((fp) => fp.destroy());
    };
  }, [dateRange, isModalOpen, i18n.language]);

  const FilterFields = () => (
    <>
      {/* Date Range Dropdown */}
      <div className="w-full xl:w-44">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-widest">
          {t("filters.date_range_label")} {dateRange !== "all" && <PulseDot />}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-10 rounded-lg border border-gray-300 bg-transparent pl-3 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">{t("filters.date_ranges.all")}</option>
            <option value="today">{t("filters.date_ranges.today")}</option>
            <option value="lastweek">
              {t("filters.date_ranges.lastweek")}
            </option>
            <option value="lastmonth">
              {t("filters.date_ranges.lastmonth")}
            </option>
            <option value="custom">{t("filters.date_ranges.custom")}</option>
          </select>
          <CustomChevron />
        </div>
      </div>

      {/* Invoice Status */}
      <div className="w-full xl:w-40">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-widest">
          {t("filters.status_label")} {statusFilter !== "" && <PulseDot />}
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
            <option value="">{t("filters.status.all")}</option>
            <option value="Unpaid">{tCommon("status.open")}</option>
            <option value="Paid">{tCommon("status.paid")}</option>
            <option value="Cancelled">{tCommon("status.cancelled")}</option>
          </select>
          <CustomChevron />
        </div>
      </div>

      {/* Logistics */}
      <div className="w-full xl:w-40">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-widest">
          {t("filters.logistics_label")} {deliveryFilter !== "" && <PulseDot />}
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
            <option value="">{t("filters.logistics.all")}</option>
            {DELIVERY_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {tCommon(`status.${opt.toLowerCase()}`, { defaultValue: opt })}
              </option>
            ))}
          </select>
          <CustomChevron />
        </div>
      </div>

      {/* Sorting */}
      <div className="w-full xl:w-44">
        <label className="text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">
          {t("filters.sort_label")}
        </label>
        <div className="relative">
          <select
            className="appearance-none w-full h-10 rounded-lg border border-gray-300 bg-transparent pl-3 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
            value={sortConfig}
            onChange={(e) => setSortConfig(e.target.value)}
          >
            <option value="createdAt:desc">
              {t("filters.sort.created_new")}
            </option>
            <option value="createdAt:asc">
              {t("filters.sort.created_old")}
            </option>
            <option value="issueDate:desc">
              {t("filters.sort.issued_new")}
            </option>
            <option value="issueDate:asc">
              {t("filters.sort.issued_old")}
            </option>
            <option value="invoiceNumber:asc">
              {t("filters.sort.number_asc")}
            </option>
            <option value="invoiceNumber:desc">
              {t("filters.sort.number_desc")}
            </option>
            <option value="price:desc">{t("filters.sort.amount_high")}</option>
            <option value="price:asc">{t("filters.sort.amount_low")}</option>
          </select>
          <CustomChevron />
        </div>
      </div>
    </>
  );

  return (
    <div className="p-4 xl:p-5 border-b border-gray-200 dark:border-white/[0.05] bg-transparent">
      <div className="flex flex-col gap-4">
        {/* ========================================================
            ROW 1: Search (Full Width) + Action Buttons 
           ======================================================== */}
        <div className="flex flex-col xl:flex-row gap-4 xl:items-end justify-between">
          {/* SEARCH (Expanded Width) */}
          <div className="flex-1 flex gap-2 items-end w-full">
            <div className="flex-1 w-full">
              <label className="hidden xl:block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">
                {t("filters.search_label")}
              </label>
              <Input
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full bg-white dark:bg-gray-900"
              />
            </div>

            {/* Mobile Buttons (Visible only on Mobile) */}
            <div className="flex xl:hidden gap-2">
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
                className="h-10 px-1 border-gray-200 dark:border-white/10"
              >
                <HiOutlineArrowPath
                  className={`size-4.5 ${loading ? "animate-spin" : ""}`}
                />
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

          {/* Desktop Actions (Refresh + New Invoice) */}
          <div className="hidden xl:flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
              className="h-10 px-3 bg-white dark:bg-transparent"
            >
              <HiOutlineArrowPath
                className={`size-5 ${loading ? "animate-spin" : ""}`}
              />
            </Button>

            {canManage && (
              <Button
                onClick={onAdd}
                className="h-10 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest px-5 "
              >
                <PlusIcon className="size-5 fill-current" />
                <span>{t("list.new_invoice")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* ========================================================
            ROW 2: Filters (Left) + Custom Date Input (Right)
           ======================================================== */}
        <div className="hidden xl:flex items-end justify-between gap-4 mt-1 relative">
          {/* Left Side: Standard Filters */}
          <div className="flex items-end gap-3 z-0">
            <FilterFields />
          </div>

          {/* Right Side: Custom Date Input (Float Right) */}
          {/* IMPORTANT: Uses desktopPickerRef so logic works correctly */}
          {dateRange === "custom" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 z-50">
              <div className="relative w-64">
                <label className="text-[10px] font-semibold text-gray-400 mb-1.5 flex items-center uppercase tracking-widest">
                  {t("filters.select_dates")}
                </label>
                <div className="relative">
                  <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 z-10" />
                  <input
                    ref={desktopPickerRef}
                    className="h-10 w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900 text-xs text-gray-700 dark:text-white font-medium dark:border-gray-700 outline-none focus:border-brand-500 transition-all cursor-pointer "
                    placeholder={t("filters.pick_range")}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile New Invoice Button */}
        {canManage && (
          <div className="xl:hidden">
            <Button
              onClick={onAdd}
              className="w-full h-10 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest"
            >
              <PlusIcon className="size-4 fill-current" />
              <span>{t("list.new_invoice")}</span>
            </Button>
          </div>
        )}

        {/* Mobile Date Range Fallback (Hidden on Desktop) */}
        {/* IMPORTANT: Uses mobilePickerRef */}
        {dateRange === "custom" && (
          <div className="xl:hidden flex pt-2 border-t border-gray-100 dark:border-white/5">
            <div className="relative w-full">
              <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 z-10" />
              <input
                ref={mobilePickerRef}
                className="h-10 w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 text-xs text-gray-700 dark:text-white font-medium dark:border-gray-700 outline-none focus:border-brand-500 transition-all cursor-pointer"
                placeholder={t("filters.pick_range")}
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
          <div className="flex flex-col h-full max-h-[90vh]">
            <div className="px-6 py-5 border-b dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-semibold dark:text-white">
                {t("filters.modal_title")}
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
                    {t("filters.select_dates")}
                  </label>
                  <div className="relative">
                    <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 z-10" />
                    <input
                      ref={mobilePickerRef}
                      className="h-12 w-full pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white dark:bg-gray-900 text-sm"
                      placeholder={t("filters.pick_range")}
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
                {t("filters.apply")}
              </Button>
              <button
                onClick={handleReset}
                className="w-full py-2 mt-1 text-xs font-medium uppercase tracking-widest text-red-500 dark:text-red-400 "
              >
                {t("filters.reset")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
