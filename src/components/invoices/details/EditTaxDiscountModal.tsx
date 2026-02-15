import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import { InvoiceData } from "../../../apis/invoices";
import InvoiceTaxDiscount from "../create/InvoiceTaxDiscount";
import { HiOutlineCalculator } from "react-icons/hi2";
import { HiX } from "react-icons/hi";

interface EditTaxDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  onSave: (data: {
    taxRate: number;
    discountValue: number;
    discountType: "percentage" | "fixed";
  }) => Promise<void>;
}

export default function EditTaxDiscountModal({
  isOpen,
  onClose,
  invoice,
  onSave,
}: EditTaxDiscountModalProps) {
  const { t } = useTranslation("invoice_details");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [taxRate, setTaxRate] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (invoice) {
      setDiscountValue(invoice.discountValue || 0);
      setDiscountType(invoice.discountType || "percentage");
      setTaxRate(invoice.taxRate || 0);
    }
  }, [invoice, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        discountValue,
        discountType,
        taxRate,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    // 2. Hide the default absolute close button
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg"
      showCloseButton={false}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#0B1120] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* --- Compact Header --- */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 border border-brand-100 dark:border-brand-500/20 shrink-0">
            <HiOutlineCalculator className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {t("modals.financials.title")}
            </h3>
          </div>

          {/* 3. Custom Close Button inside Flex Header */}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/5"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* --- Content Section --- */}
        <div className="p-0">
          <div
            className="
            [&>div]:!border-0 
            [&>div]:!shadow-none 
            [&>div]:!bg-transparent 
            [&>div]:!rounded-none 
            [&>div>div:first-child]:hidden
            [&_input]:!border-gray-300 dark:[&_input]:!border-gray-700
            [&_.border-l]:!border-gray-300 dark:[&_.border-l]:!border-gray-700
          "
          >
            <InvoiceTaxDiscount
              discountValue={discountValue}
              setDiscountValue={setDiscountValue}
              discountType={discountType}
              setDiscountType={setDiscountType}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
            />
          </div>
        </div>

        {/* --- Compact Footer --- */}
        <div className="px-5 py-3 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex justify-end gap-2 backdrop-blur-sm">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="h-9 px-4 bg-transparent border-0 text-xs font-bold uppercase tracking-wide transition-colors text-gray-900  dark:text-gray-400  "
          >
            {t("modals.financials.actions.cancel")}
          </Button>

          <Button
            type="submit"
            disabled={saving}
            className="h-9 px-6 text-xs font-bold uppercase tracking-wide shadow-lg shadow-brand-500/20"
          >
            {saving
              ? t("modals.financials.actions.calculating")
              : t("modals.financials.actions.apply")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
