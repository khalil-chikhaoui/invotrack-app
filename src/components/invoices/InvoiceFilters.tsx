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
import SelectField from "../../components/form/SelectField";

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

  // State to control the text displayed in the input
  const [displayRange, setDisplayRange] = useState("");

  const desktopPickerRef = useRef<HTMLInputElement>(null);
  const mobilePickerRef = useRef<HTMLInputElement>(null);
  const fpInstances = useRef<flatpickr.Instance[]>([]);

  const hasActiveFilters =
    statusFilter !== "" || deliveryFilter !== "" || dateRange !== "all";

  const handleReset = () => {
    setStatusFilter("");
    setDeliveryFilter("");
    setDateRange("all");
    setSortConfig("issueDate:desc");
    setPage(1);
    setStartDate("");
    setEndDate("");
  };

  // --- 1. Helper: Format Dates for Display ---
  const formatForDisplay = (start: string, end: string) => {
    if (!start || !end) return "";
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const locale =
      i18n.language === "fr"
        ? "fr-FR"
        : i18n.language === "de"
          ? "de-DE"
          : "en-US";
    try {
      const s = new Date(start).toLocaleDateString(locale, opts);
      const e = new Date(end).toLocaleDateString(locale, opts);
      return `${s} ${t("common.to", { defaultValue: "to" })} ${e}`;
    } catch (e) {
      return `${start} - ${end}`;
    }
  };

  // --- 2. Effect: Sync Display Text with State ---
  useEffect(() => {
    setDisplayRange(formatForDisplay(startDate, endDate));
  }, [startDate, endDate, i18n.language]);

  const handleDateRangeChange = (val: string, onCustomSelect?: () => void) => {
    setDateRange(val);
    if (val === "custom") {
      setStartDate("");
      setEndDate("");
      if (onCustomSelect) onCustomSelect();
    }
  };

  // --- 3. Auto-Open Picker ---
  useEffect(() => {
    if (dateRange === "custom") {
      const timer = setTimeout(() => {
        const mobileInstance = fpInstances.current.find(
          (i) => i.element === mobilePickerRef.current,
        );
        const desktopInstance = fpInstances.current.find(
          (i) => i.element === desktopPickerRef.current,
        );

        if (mobileInstance) mobileInstance.open();
        else if (desktopInstance) desktopInstance.open();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [dateRange]);

  // --- 4. Flatpickr Init ---
  useEffect(() => {
    fpInstances.current.forEach((fp) => fp.destroy());
    fpInstances.current = [];

    const activeRefs = [];
    if (desktopPickerRef.current) activeRefs.push(desktopPickerRef.current);
    if (mobilePickerRef.current) activeRefs.push(mobilePickerRef.current);

    if (dateRange === "custom" && activeRefs.length > 0) {
      let locale: any = "default";
      if (i18n.language === "fr") locale = French;
      if (i18n.language === "de") locale = German;

      activeRefs.forEach((ref) => {
        const fp = flatpickr(ref, {
          mode: "range",
          dateFormat: "M d, Y",
          locale: locale,
          defaultDate: startDate && endDate ? [startDate, endDate] : undefined,
          onChange: () => {},
          onClose: (selectedDates, _, instance) => {
            if (selectedDates.length === 2) {
              setStartDate(instance.formatDate(selectedDates[0], "Y-m-d"));
              setEndDate(instance.formatDate(selectedDates[1], "Y-m-d"));
            }
          },
        });
        fpInstances.current.push(fp);
      });
    }

    return () => {
      fpInstances.current.forEach((fp) => fp.destroy());
      fpInstances.current = [];
    };
  }, [dateRange, i18n.language]);

  // --- Components ---

  const FilterFields = ({
    onCustomSelect,
  }: {
    onCustomSelect?: () => void;
  }) => (
    <>
      <SelectField
        label={t("filters.date_range_label")}
        value={dateRange}
        onChange={(val) => handleDateRangeChange(val, onCustomSelect)}
        options={[
          { value: "all", label: t("filters.date_ranges.all") },
          { value: "today", label: t("filters.date_ranges.today") },
          { value: "lastweek", label: t("filters.date_ranges.lastweek") },
          { value: "lastmonth", label: t("filters.date_ranges.lastmonth") },
          { value: "custom", label: t("filters.date_ranges.custom") },
        ]}
        isActive={dateRange !== "all"}
        className="w-full xl:w-44"
      />

      <SelectField
        label={t("filters.status_label")}
        value={statusFilter}
        onChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        options={[
          { value: "", label: t("filters.status.all") },
          { value: "Unpaid", label: tCommon("status.open") },
          { value: "Paid", label: tCommon("status.paid") },
          { value: "Cancelled", label: tCommon("status.cancelled") },
        ]}
        isActive={statusFilter !== ""}
        className="w-full xl:w-40"
      />

      <SelectField
        label={t("filters.logistics_label")}
        value={deliveryFilter}
        onChange={(val) => {
          setDeliveryFilter(val);
          setPage(1);
        }}
        options={[
          { value: "", label: t("filters.logistics.all") },
          ...DELIVERY_STATUS_OPTIONS.map((opt) => ({
            value: opt,
            label: tCommon(`status.${opt.toLowerCase()}`, {
              defaultValue: opt,
            }),
          })),
        ]}
        isActive={deliveryFilter !== ""}
        className="w-full xl:w-40"
      />

      {/* FIX: Inline sortOptions to prevent ReferenceError */}
      <SelectField
        label={t("filters.sort_label")}
        value={sortConfig}
        onChange={(val) => setSortConfig(val)}
        options={[
          { value: "createdAt:desc", label: t("filters.sort.created_new") },
          { value: "createdAt:asc", label: t("filters.sort.created_old") },
          { value: "issueDate:desc", label: t("filters.sort.issued_new") },
          { value: "issueDate:asc", label: t("filters.sort.issued_old") },
          { value: "invoiceNumber:asc", label: t("filters.sort.number_asc") },
          { value: "invoiceNumber:desc", label: t("filters.sort.number_desc") },
          { value: "price:desc", label: t("filters.sort.amount_high") },
          { value: "price:asc", label: t("filters.sort.amount_low") },
        ]}
        isActive={sortConfig !== "issueDate:desc"}
        className="w-full xl:w-52"
      />
    </>
  );

  const inputClassName =
    "h-11 w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-xs text-gray-700 dark:text-white font-medium outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 hover:border-gray-400 dark:hover:border-gray-600 transition-all cursor-pointer placeholder-gray-500";

  return (
    <div className="p-4 xl:p-5 border-b border-gray-200 dark:border-white/[0.05] bg-transparent">
      <div className="flex flex-col gap-4">
        {/* ROW 1: Search + Actions */}
        <div className="flex flex-col xl:flex-row gap-4 xl:items-end justify-between">
          <div className="flex-1 flex gap-2 items-end w-full">
            <div className="flex-1 w-full">
              <label className="hidden xl:block text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-widest">
                {t("filters.search_label")}
              </label>
              <Input
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full !bg-transparent"
              />
            </div>

            {/* Mobile Buttons */}
            <div className="flex xl:hidden gap-2">
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
                className="h-11 px-1 border-gray-200 dark:border-white/10"
              >
                <HiOutlineArrowPath
                  className={`size-4.5 ${loading ? "animate-spin" : ""}`}
                />
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="h-11 px-1 relative border-gray-200 dark:border-white/10"
              >
                <HiOutlineAdjustmentsHorizontal className="size-4.5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 bg-brand-500 rounded-full border-2 border-white dark:border-gray-900" />
                )}
              </Button>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden xl:flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
              className="h-11 px-3 bg-white dark:bg-transparent"
            >
              <HiOutlineArrowPath
                className={`size-5 ${loading ? "animate-spin" : ""}`}
              />
            </Button>

            {canManage && (
              <Button
                onClick={onAdd}
                className="h-11 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest px-5 "
              >
                <PlusIcon className="size-5 fill-current" />
                <span>{t("list.new_invoice")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* ROW 2: Desktop Filters */}
        <div className="hidden xl:flex items-end justify-between gap-4 mt-1 relative">
          <div className="flex items-end gap-3 z-0">
            <FilterFields />
          </div>

          {/* External Date Input (Desktop) */}
          {dateRange === "custom" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 z-50">
              <div className="relative w-64">
                <label className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5 flex items-center uppercase tracking-wide">
                  {t("filters.select_dates")}
                </label>
                <div className="relative">
                  <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 z-10" />
                  <input
                    ref={desktopPickerRef}
                    className={inputClassName}
                    placeholder={t("filters.pick_range")}
                    value={displayRange} // CONTROLLED VALUE
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- MOBILE SECTION --- */}

        {/* Mobile New Invoice Button */}
        {canManage && (
          <div className="xl:hidden">
            <Button
              onClick={onAdd}
              className="w-full h-11 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-widest"
            >
              <PlusIcon className="size-4 fill-current" />
              <span>{t("list.new_invoice")}</span>
            </Button>
          </div>
        )}

        {/* External Date Input (Mobile Fallback) */}
        {dateRange === "custom" && (
          <div className="xl:hidden flex pt-2 border-t border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
            <div className="relative w-full">
              <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 z-10" />
              <input
                ref={mobilePickerRef}
                className={inputClassName}
                placeholder={t("filters.pick_range")}
                value={displayRange} // CONTROLLED VALUE
                readOnly
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
              {/* Pass close callback to auto-close modal on Custom selection */}
              <FilterFields onCustomSelect={() => setIsModalOpen(false)} />
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