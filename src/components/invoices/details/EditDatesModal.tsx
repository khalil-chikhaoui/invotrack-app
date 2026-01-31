import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; // <--- Hook
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import InvoiceDates from "../create/InvoiceDates";
import { InvoiceData } from "../../../apis/invoices";
import { HiOutlineCalendarDays } from "react-icons/hi2";

interface EditDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  onSave: (data: { issueDate: string; dueDate: string }) => Promise<void>;
}

export default function EditDatesModal({
  isOpen,
  onClose,
  invoice,
  onSave,
}: EditDatesModalProps) {
  const { t } = useTranslation("invoice_details");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    if (invoice) {
      const fmt = (d: string | Date) => new Date(d).toISOString().split("T")[0];
      setIssueDate(invoice.issueDate ? fmt(invoice.issueDate) : "");
      setDueDate(invoice.dueDate ? fmt(invoice.dueDate) : "");
    }
  }, [invoice, isOpen]);

  // Updated to handle form event
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await onSave({ issueDate, dueDate });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
      {/* Wrapped the inner content in a form */}
      <form 
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
      >
        
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="w-14 h-14 mx-auto bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-500/20">
            <HiOutlineCalendarDays className="size-7 text-brand-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("modals.dates.title")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
            {t("modals.dates.desc")}
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 pb-6">
          <div className="[&>div]:!border-0 [&>div]:!shadow-none [&>div]:!p-0 [&>div]:!bg-transparent">
             <InvoiceDates
                issueDate={issueDate}
                setIssueDate={setIssueDate}
                dueDate={dueDate}
                setDueDate={setDueDate}
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
            {t("modals.dates.actions.cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={saving}
            className="h-10 px-6 text-xs uppercase tracking-wider font-semibold shadow-lg shadow-brand-500/20"
          >
            {saving ? t("modals.dates.actions.saving") : t("modals.dates.actions.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}