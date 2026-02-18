/**
 * @fileoverview CreateDeliveryHeader Component
 * Manages invoice selection for new delivery manifests.
 */

import { useTranslation } from "react-i18next";
import { HiOutlineTruck, HiOutlineInformationCircle } from "react-icons/hi2";
import MultiSelect from "../invoices/MultiSelect";
import { InvoiceData } from "../../apis/invoices";
import { useMemo } from "react";

interface CreateDeliveryHeaderProps {
  candidates: InvoiceData[]; // Invoices currently 'Pending' and available
  selectedIds: string[]; // Array of selected invoice IDs
  selectedInvoicesCache: InvoiceData[]; // Persistent data for already selected items
  loading: boolean; // API fetching state
  isUpdating: boolean; // Submission/Processing state
  onSelectionChange: (ids: string[]) => void;
  onSearch: (search: string) => void;
}

export default function CreateDeliveryHeader({
  candidates,
  selectedIds,
  selectedInvoicesCache,
  loading,
  isUpdating,
  onSelectionChange,
  onSearch,
}: CreateDeliveryHeaderProps) {
  const { t } = useTranslation("delivery");

  /**
   * MEMOIZED OPTIONS LOGIC
   * This is crucial: When an invoice is selected and processed, it might disappear
   * from the "candidates" list (if the API only returns Pending items).
   * We merge the cache back in so the MultiSelect doesn't show empty labels for
   * items already in the bucket.
   */
  const options = useMemo(() => {
    const combinedList = [...candidates];

    selectedInvoicesCache.forEach((selected) => {
      const exists = combinedList.find((c) => c._id === selected._id);
      if (!exists) {
        // Keeps selected items visible even if they are no longer in the search results
        combinedList.push(selected);
      }
    });

    return combinedList.map((inv) => ({
      value: inv._id,
      text: `${inv.invoiceNumber} — ${inv.clientSnapshot.name}`,
    }));
  }, [candidates, selectedInvoicesCache]);

  return (
    <div className="flex-1 space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        {/* Animated Icon: Bounces when the manifest is being generated */}
        <div
          className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-sm
          ${isUpdating ? "bg-orange-500 text-white animate-bounce" : "bg-brand-500/10 text-brand-500"}`}
        >
          <HiOutlineTruck className="size-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {t("header.title")}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{t("header.subtitle")}</p>
        </div>
      </div>

      {/* Logic Information Banner: Explains the status transition (Pending -> Shipped) */}
      <div className="flex gap-3 p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10">
        <HiOutlineInformationCircle className="size-5 text-brand-600 dark:text-brand-100 shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed text-brand-600 dark:text-brand-100 font-medium">
          {t("form.info_banner")}
        </p>
      </div>

      {/* Main Search/Selection Input */}
      <MultiSelect
        placeholder={t("form.search_placeholder")}
        options={options}
        value={selectedIds}
        onChange={onSelectionChange}
        onSearch={onSearch}
        loading={loading}
      />
    </div>
  );
}
