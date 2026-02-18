/**
 * @fileoverview InvoiceFinancials Component
 * Handles input for tax rates, discount values, and non-taxable delivery fees.
 */

import { useTranslation } from "react-i18next";
import { HiOutlineCalculator, HiReceiptPercent, HiTag, HiOutlineTruck } from "react-icons/hi2";
import { HiOutlineReceiptTax } from "react-icons/hi";
import Label from "../../form/Label";
import NumericInput from "../../form/input/NumericInput";

interface Props {
  discountValue: number;
  setDiscountValue: (v: number) => void;
  discountType: "percentage" | "fixed";
  setDiscountType: (t: "percentage" | "fixed") => void;
  taxRate: number;
  setTaxRate: (v: number) => void;
  deliveryFee: number;
  setDeliveryFee: (v: number) => void;
}

export default function InvoiceFinancials({ 
  discountValue,
  setDiscountValue,
  discountType,
  setDiscountType,
  taxRate,
  setTaxRate,
  deliveryFee,
  setDeliveryFee,
}: Props) {
  const { t } = useTranslation("invoice");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100/50 dark:border-white/5">
        <HiOutlineCalculator className="text-gray-400 dark:text-gray-500 size-5" />
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm tracking-wide">
          {t("create.sections.financials")}
        </h3>
      </div>

      <div className="p-5 space-y-5">
        {/* --- SECTION 1: Discount --- */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="space-y-2 sm:col-span-4">
            <Label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest pl-1">
              {t("create.sections.discount")}
            </Label>
            <NumericInput
              variant="currency"
              value={discountValue}
              onChange={(val: string) => setDiscountValue(Number(val))}
              placeholder="0.00"
              className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 dark:text-white transition-all focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-2 sm:col-span-8">
            <Label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest pl-1">
              {t("create.sections.mode")}
            </Label>
            <div className="flex gap-2 h-11">
              <button
                type="button"
                onClick={() => setDiscountType("percentage")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                  discountType === "percentage"
                    ? "bg-brand-500 border-brand-500 text-white shadow-sm"
                    : "bg-transparent border-gray-300 dark:border-gray-600 text-gray-500 hover:text-brand-500"
                }`}
              >
                <HiReceiptPercent className="size-4" />
                <span>%</span>
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("fixed")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                  discountType === "fixed"
                    ? "bg-brand-500 border-brand-500 text-white shadow-sm"
                    : "bg-transparent border-gray-300 dark:border-gray-600 text-gray-500 hover:text-brand-500"
                }`}
              >
                <HiTag className="size-4" />
                <span>{t("create.sections.fixed")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: Tax Rate & Delivery Fee --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Tax Rate */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-widest pl-1">
              {t("create.sections.tax_rate")}
            </Label>
            <div className="relative group flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 rounded-l-xl z-10">
                <HiOutlineReceiptTax className="text-gray-400 size-4" />
              </div>
              <NumericInput
                variant="quantity"
                value={taxRate}
                onChange={(val: string) => setTaxRate(Number(val))}
                className="w-full bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pr-8 pl-12 text-sm font-bold text-gray-800 dark:text-white"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</div>
            </div>
          </div>

          {/* Delivery Fee (New Input) */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-widest pl-1">
              {t("create.sections.delivery_fee")}
            </Label>
            <div className="relative group flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 rounded-l-xl z-10">
                <HiOutlineTruck className="text-gray-400 size-4" />
              </div>
              <NumericInput
                variant="currency"
                value={deliveryFee}
                onChange={(val: string) => setDeliveryFee(Number(val))}
                placeholder="0.00"
                className="w-full bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pr-3 pl-12 text-sm font-bold text-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}