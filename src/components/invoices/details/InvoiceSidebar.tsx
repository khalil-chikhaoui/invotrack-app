import { useTranslation } from "react-i18next";
import Badge from "../../ui/badge/Badge";
import { HiOutlineInformationCircle, HiOutlinePencil } from "react-icons/hi2";
import {
  InvoiceData,
  STATUS_COLORS,
  getInvoiceDisplayStatus,
} from "../../../apis/invoices";

interface InvoiceSidebarProps {
  invoice: InvoiceData;
  openStatusModal: () => void;
  openDeliveryModal: () => void;
}

export default function InvoiceSidebar({
  invoice,
  openStatusModal,
  openDeliveryModal,
}: InvoiceSidebarProps) {
  const { t } = useTranslation("invoice_details");
  const { t: tCommon } = useTranslation("common");
  const displayStatus = getInvoiceDisplayStatus(invoice);

  return (
    <div className="space-y-6 no-print">
      {/* --- Lifecycle Management Card --- */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl p-6 shadow-sm">
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <HiOutlineInformationCircle className="size-4 text-brand-500" />{" "}
          {t("sidebar.lifecycle_title")}
        </h3>

        <div className="space-y-5">
          {/* Payment Status Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
              {t("sidebar.payment_state")}
            </span>
            <div
              onClick={openStatusModal}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              {/* Status Badge */}
              <Badge size="sm" color={STATUS_COLORS[displayStatus]}>
                <div className="flex items-center gap-1.5 font-semibold text-[10px] tracking-wider uppercase">
                  {tCommon(`status.${displayStatus.toLowerCase()}`, {
                    defaultValue: displayStatus,
                  })}
                  <HiOutlinePencil className="size-3 opacity-70" />
                </div>
              </Badge>
            </div>
          </div>

          {/* Logistics Status Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
              {t("sidebar.logistics")}
            </span>
            <div
              onClick={openDeliveryModal}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Badge
                size="sm"
                variant="light"
                color={STATUS_COLORS[invoice.deliveryStatus]}
              >
                <div className="flex items-center gap-1.5 font-semibold text-[10px] tracking-wider uppercase">
                  {tCommon(`status.${invoice.deliveryStatus.toLowerCase()}`, {
                    defaultValue: invoice.deliveryStatus,
                  })}
                  <HiOutlinePencil className="size-3 opacity-70" />
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* --- Internal Notes Card --- */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl p-6 shadow-sm">
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          {t("sidebar.notes_title")}
        </h3>
        <textarea
          placeholder={t("sidebar.notes_placeholder")}
          className="w-full bg-transparent text-xs text-gray-600 dark:text-gray-300 outline-none resize-none h-20 placeholder-gray-300 dark:placeholder-gray-600"
        />
      </div>
    </div>
  );
}
