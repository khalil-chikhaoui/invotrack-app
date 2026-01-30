/**
 * @fileoverview InvoiceSummary Component
 * Displays the financial breakdown including subtotal, adjustments, tax, and grand total.
 */
import { HiOutlineBanknotes } from "react-icons/hi2";
import Button from "../../ui/button/Button";
import { formatMoney } from "../../../hooks/formatMoney";
import { CurrencyFormat } from "../../../apis/business";

interface Props {
  totals: {
    subTotal: number;
    totalDiscount: number;
    totalTax: number;
    grandTotal: number;
  };
  taxRate: number; // The percentage rate (e.g., 15)
  currency?: string;
  currencyFormat?: CurrencyFormat;
  loading: boolean;
  isEdit: boolean;
  onSubmit: () => void;
  hasDiscount: boolean;
}

export default function InvoiceSummary({
  totals,
  taxRate,
  currency,
  currencyFormat,
  loading,
  isEdit,
  onSubmit,
  hasDiscount,
}: Props) {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/[0.05] shadow-sm xl:sticky xl:top-24">
      {/* --- Header Section --- */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
          <HiOutlineBanknotes className="text-brand-500 size-4" />
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm uppercase tracking-tight">
          Valuation Summary
        </h3>
      </div>

      {/* --- Breakdown Section --- */}
      <div className="space-y-4 mb-8">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          <span>Subtotal</span>
          <span className="text-sm text-gray-900 dark:text-white font-semibold">
            {formatMoney(totals.subTotal, currency, currencyFormat)}
          </span>
        </div>

        {/* Discount / Adjustment */}
        {hasDiscount && (
          <div className="flex justify-between items-center text-xs font-semibold text-error-500 uppercase tracking-widest">
            <span>Adjustment</span>
            <span className="text-sm font-semibold">
              -{formatMoney(totals.totalDiscount, currency, currencyFormat)}
            </span>
          </div>
        )}

        {/* Taxation with Percentage Label */}
        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          <span className="flex items-center gap-1">
            Taxation 
            <span className="text-[10px] lowercase font-medium opacity-60">({taxRate}%)</span>
          </span>
          <span className="text-sm text-gray-900 dark:text-white font-semibold">
            +{formatMoney(totals.totalTax, currency, currencyFormat)}
          </span>
        </div>

        {/* --- Grand Total --- */}
        <div className="flex justify-between items-center pt-6 mt-2 border-t-2 border-dashed border-gray-100 dark:border-white/10">
          <span className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-tighter">
            TOTAL
          </span>
          <span className="text-lg font-semibold text-brand-600 dark:text-brand-500 tracking-tight">
            {formatMoney(totals.grandTotal, currency, currencyFormat)}
          </span>
        </div>
      </div>

      {/* --- Action Button --- */}
      <Button
        onClick={onSubmit}
        disabled={loading}
        className="w-full py-4 text-xs font-semibold uppercase tracking-widest shadow-xl shadow-brand-500/20"
      >
        {loading
          ? "Synchronizing..."
          : isEdit
            ? "Sync Invoice Update"
            : "Confirm & Dispatch"}
      </Button>
    </div>
  );
}