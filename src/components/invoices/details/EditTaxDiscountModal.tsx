import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; // <--- Hook
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import { InvoiceData } from "../../../apis/invoices";
import InvoiceTaxDiscount from "../create/InvoiceTaxDiscount";
import { HiOutlineCalculator } from "react-icons/hi2";

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

  // Load initial data
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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
      >
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="w-14 h-14 mx-auto bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-500/20">
            <HiOutlineCalculator className="size-7 text-brand-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("modals.financials.title")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
            {t("modals.financials.desc")}
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 pb-6">
          <div className="[&>div]:!border-0 [&>div]:!shadow-none [&>div]:!p-0 [&>div]:!bg-transparent">
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

        {/* Footer Actions */}
        <div className="px-8 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-white/[0.05] flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="h-10 text-xs uppercase tracking-wider font-semibold"
          >
            {t("modals.financials.actions.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="h-10 px-6 text-xs uppercase tracking-wider font-semibold shadow-lg shadow-brand-500/20"
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
