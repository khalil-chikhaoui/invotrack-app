import { useTranslation } from "react-i18next";
import { HiOutlineCalculator } from "react-icons/hi2";
import Label from "../../form/Label";
import NumericInput from "../../form/input/NumericInput";

interface Props {
  discountValue: number;
  setDiscountValue: (v: number) => void;
  discountType: "percentage" | "fixed";
  setDiscountType: (t: "percentage" | "fixed") => void;
  taxRate: number;
  setTaxRate: (v: number) => void;
}

export default function InvoiceTaxDiscount({
  discountValue,
  setDiscountValue,
  discountType,
  setDiscountType,
  taxRate,
  setTaxRate,
}: Props) {
  const { t } = useTranslation("invoice");

  return (
    <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/[0.05] shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineCalculator className="text-brand-500 size-5" />
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
          {t("create.sections.tax_discount")}
        </h3> 
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[10px] uppercase font-semibold text-gray-500 mb-1.5">
            {t("create.sections.amount")}
          </Label>
          <NumericInput
            variant="currency"
            value={discountValue}
            onChange={(val: string) => setDiscountValue(Number(val))}
            className="bg-gray-50 dark:bg-gray-800/50"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase font-semibold text-gray-500 mb-1.5">
            {t("create.sections.mode")}
          </Label>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 h-[42px]">
            <button
              onClick={() => setDiscountType("percentage")}
              className={`flex-1 text-[10px] font-semibold rounded uppercase transition-all ${discountType === "percentage" ? "bg-white dark:bg-gray-700 text-brand-500 shadow-sm" : "text-gray-400"}`}
            >
              %
            </button>
            <button
              onClick={() => setDiscountType("fixed")}
              className={`flex-1 text-[10px] font-semibold rounded uppercase transition-all ${discountType === "fixed" ? "bg-white dark:bg-gray-700 text-brand-500 shadow-sm" : "text-gray-400"}`}
            >
              VAL
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Label className="text-[10px] uppercase font-semibold text-gray-500 mb-1.5">
          {t("create.sections.tax_rate")}
        </Label>
        <NumericInput
          variant="quantity" 
          value={taxRate}
          onChange={(val: string) => setTaxRate(Number(val))}
          className="bg-gray-50 dark:bg-gray-800/50"
        />
      </div>
    </div>
  );
}