import Button from "../../ui/button/Button";
import Badge from "../../ui/badge/Badge";
import {
  HiOutlineEnvelope,
  HiOutlinePaperAirplane,
  HiOutlineInformationCircle,
  HiOutlinePencil,
} from "react-icons/hi2";
import {
  InvoiceData,
  STATUS_COLORS,
  getInvoiceDisplayStatus,
} from "../../../apis/invoices";

interface InvoiceSidebarProps {
  invoice: InvoiceData;
  openStatusModal: () => void;
  openDeliveryModal: () => void;
  handleSendRecord: () => void;
  sendingEmail: boolean;
}

export default function InvoiceSidebar({
  invoice,
  openStatusModal,
  openDeliveryModal,
  handleSendRecord,
  sendingEmail,
}: InvoiceSidebarProps) {
  const displayStatus = getInvoiceDisplayStatus(invoice);

  return (
    <div className="space-y-6 no-print">
      {/* --- Lifecycle Management Card --- */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl p-6 shadow-sm">
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <HiOutlineInformationCircle className="size-4 text-brand-500" />{" "}
          Lifecycle Management
        </h3>

        <div className="space-y-5">
          {/* Payment Status Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
              Payment State
            </span>
            <div
              onClick={openStatusModal}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              {/* Status  */}
              <Badge size="sm" color={STATUS_COLORS[displayStatus]}>
                <div className="flex items-center gap-1.5 font-semibold text-[10px] tracking-wider uppercase">
                  {displayStatus}
                  <HiOutlinePencil className="size-3 opacity-70" />
                </div>
              </Badge>
            </div>
          </div>

          {/* Logistics Status Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
              Logistics
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
                  {invoice.deliveryStatus}
                  <HiOutlinePencil className="size-3 opacity-70" />
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* --- Internal Notes Card --- */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl p-6 shadow-sm">
      TODO
      </div>
    </div>
  );
}
