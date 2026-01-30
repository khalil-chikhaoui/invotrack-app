import { Link } from "react-router";
import { formatMoney } from "../../../hooks/formatMoney";
import Badge from "../../ui/badge/Badge";
import {
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlineInformationCircle,
  HiOutlinePencilSquare,
  HiOutlinePencil,
} from "react-icons/hi2";
import { formatDate } from "date-fns";
import {
  STATUS_COLORS,
  InvoiceData,
  getInvoiceDisplayStatus,
} from "../../../apis/invoices";
import { BusinessData } from "../../../apis/business";

interface InvoiceIdentityCardProps {
  invoice: InvoiceData;
  business: BusinessData;
  canManage: boolean;
  businessId: string | undefined;
  onEditDates?: () => void; 
}

export default function InvoiceIdentityCard({
  invoice,
  business,
  canManage,
  businessId,
  onEditDates, 
}: InvoiceIdentityCardProps) {
  const displayStatus = getInvoiceDisplayStatus(invoice);

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl p-6 mb-8 shadow-sm relative overflow-hidden text-start">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <HiOutlineDocumentText className="size-32" />
      </div>
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <div className="w-28 h-28 rounded-3xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center border border-brand-100 dark:border-brand-500/20 shadow-inner">
          <HiOutlineDocumentText className="size-12 text-brand-500" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col mb-2">
            <div className="flex items-center gap-3 mb-2">
              {/* Status */}
              <Badge
                
                color={STATUS_COLORS[displayStatus]}
                className="font-semibold text-[10px] tracking-widest uppercase px-4 py-1"
              >
                {displayStatus}
              </Badge>

              <Badge
                color={STATUS_COLORS[invoice.deliveryStatus]}
                variant="light"
                className="font-semibold text-[10px] tracking-widest uppercase px-4 py-1"
              >
                {invoice.deliveryStatus}
              </Badge>
            </div>
          </div>

          {canManage && !invoice.isDeleted && (
            <Link
              to={`/business/${businessId}/invoices/${invoice._id}/edit`}
              className="flex sm:hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-brand-500 hover:text-brand-600 mb-3 border border-brand-200 bg-brand-50 rounded-lg px-3 py-1.5 w-fit"
            >
              <HiOutlinePencilSquare className="size-4" /> Edit Record
            </Link>
          )}

          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight mb-3 leading-none">
            {invoice.invoiceNumber}
          </h2>
          {/** DATES ROW */}
          <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-300">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tight">
              <HiOutlineCalendarDays className="size-4 text-brand-500" />{" "}
              Issued: {formatDate(new Date(invoice.issueDate), "MMMM dd, yyyy")}
            </div>
            {invoice.dueDate && (
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tight">
                <HiOutlineCalendarDays className="size-4 text-brand-500" /> Due:{" "}
                {formatDate(new Date(invoice.dueDate), "MMMM dd, yyyy")}
              </div>
            )}

            {/* Edit Button */}
            {canManage && !invoice.isDeleted && onEditDates && (
             <button
              type="button"
              onClick={onEditDates}
              className="group flex items-center bg-brand-500/7 hover:bg-brand-500/10 dark:bg-brand-50/10 dark:hover:bg-brand-50/20 py-1.5 px-3 rounded-md gap-1.5 text-[12px] font-medium  tracking-wide text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
            >
              <HiOutlinePencil className="size-3.5" /> Edit
            </button>
            )} 
          </div>


          <span className="text-[11px] text-gray-500 dark:text-gray-300 mt-3 font-medium  tracking-widest flex items-center gap-1.5 ">
            <HiOutlineInformationCircle className="size-4 text-brand-500" />
            Invoice created on{" "}
            {formatDate(new Date(invoice.createdAt), "MMMM dd, yyyy")} by{" "}
            {invoice.createdBy?.name || "System"}
          </span>
        </div>
        <div className="bg-gray-50/[0.02] dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] p-6 rounded-2xl text-center min-w-[180px]">
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">
            Valuation
          </span>
          <span className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {formatMoney(
              invoice.grandTotal,
              business?.currency,
              business?.currencyFormat,
            )}
          </span>
        </div>
      </div>
    </div>
  );
}