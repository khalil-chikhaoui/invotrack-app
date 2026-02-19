import { useTranslation } from "react-i18next";
import { formatMoney } from "../../../hooks/formatMoney";
import Badge from "../../ui/badge/Badge";
import {
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlineInformationCircle,
  HiOutlinePencil,
} from "react-icons/hi2";
import { formatDate } from "date-fns";
import {
  STATUS_COLORS,
  InvoiceData,
  getInvoiceDisplayStatus,
} from "../../../apis/invoices";
import { BusinessData } from "../../../apis/business";
import { useDateLocale } from "../../../hooks/useDateLocale";

interface InvoiceIdentityCardProps {
  invoice: InvoiceData;
  business: BusinessData;
  canManage: boolean;
  businessId: string | undefined;
  onEditDates?: () => void;
  onEditStatus?: () => void;
  onEditDelivery?: () => void;
}

export default function InvoiceIdentityCard({
  invoice,
  business,
  canManage,
  onEditDates,
  onEditStatus,
  onEditDelivery,
}: InvoiceIdentityCardProps) {
  const { t } = useTranslation("invoice_details");
  const { t: tCommon } = useTranslation("common");

  const dateLocale = useDateLocale();
  const displayStatus = getInvoiceDisplayStatus(invoice);

  return (
    <div className="border border-gray-200 dark:border-white/[0.05] rounded-3xl p-6 mb-8 relative overflow-hidden text-start shadow-sm bg-white dark:bg-gray-900">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <HiOutlineDocumentText className="size-32" />
      </div>
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        {/* Icon Box */}
        <div className="w-28 h-28 rounded-3xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center border border-brand-100 dark:border-brand-500/20 shadow-inner">
          <HiOutlineDocumentText className="size-12 text-brand-500" />
        </div>

        <div className="flex-1 w-full md:w-auto">
          <div className="flex flex-col mb-2">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {/* Payment Status Badge - Clickable */}
              <div
                onClick={canManage && onEditStatus ? onEditStatus : undefined}
                className={`transition-all ${
                  canManage && onEditStatus
                    ? "cursor-pointer hover:opacity-80 active:scale-95"
                    : ""
                }`}
                title={canManage ? t("identity_card.edit_status") : ""}
              >
                <Badge
                  color={STATUS_COLORS[displayStatus]}
                  className="font-semibold text-[10px] tracking-widest uppercase px-4 py-1"
                >
                  <div className="flex items-center gap-1.5">
                    {tCommon(`status.${displayStatus.toLowerCase()}`, {
                      defaultValue: displayStatus,
                    })}
                    {canManage && onEditStatus && (
                      <HiOutlinePencil className="size-3 opacity-70" />
                    )}
                  </div>
                </Badge>
              </div>

              {/* Delivery Status Badge - Clickable */}
              <div
                onClick={
                  canManage && onEditDelivery ? onEditDelivery : undefined
                }
                className={`transition-all ${
                  canManage && onEditDelivery
                    ? "cursor-pointer hover:opacity-80 active:scale-95"
                    : ""
                }`}
                title={canManage ? t("identity_card.edit_delivery") : ""}
              >
                <Badge
                  color={STATUS_COLORS[invoice.deliveryStatus]}
                  variant="light"
                  className="font-semibold text-[10px] tracking-widest uppercase px-4 py-1"
                >
                  <div className="flex items-center gap-1.5">
                    {tCommon(`status.${invoice.deliveryStatus.toLowerCase()}`, {
                      defaultValue: invoice.deliveryStatus,
                    })}
                    {canManage && onEditDelivery && (
                      <HiOutlinePencil className="size-3 opacity-70" />
                    )}
                  </div>
                </Badge>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight mb-3 leading-none">
            {invoice.invoiceNumber}
          </h2>

          {/** DATES ROW */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-normal">
              <HiOutlineCalendarDays className="size-4 text-brand-600 dark:text-brand-300" />{" "}
              {t("identity_card.issued")}{" "}
              {formatDate(new Date(invoice.issueDate), "MMMM dd, yyyy", {
                locale: dateLocale,
              })}
            </div>
            {invoice.dueDate && (
              <div className="flex items-center gap-2 text-xs font-semibold tracking-normal">
                <HiOutlineCalendarDays className="size-4 text-brand-600 dark:text-brand-300" />{" "}
                {t("identity_card.due")}{" "}
                {formatDate(new Date(invoice.dueDate), "MMMM dd, yyyy", {
                  locale: dateLocale,
                })}
              </div>
            )}

            {/* Edit Dates Button */}
            {canManage && !invoice.isDeleted && onEditDates && (
              <button
                type="button"
                onClick={onEditDates}
                className="group flex items-center bg-brand-500/5 hover:bg-brand-500/10 dark:bg-brand-50/10 dark:hover:bg-brand-50/20 py-1.5 px-3 rounded-md gap-1.5 text-[12px] font-medium tracking-wide text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
              >
                <HiOutlinePencil className="size-3.5" />{" "}
                {t("identity_card.edit")}
              </button>
            )}
          </div>

          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 font-medium tracking-widest flex items-center gap-1.5">
            <HiOutlineInformationCircle className="size-4 text-gray-400 dark:text-gray-500" />
            {t("identity_card.created_on", {
              date: formatDate(new Date(invoice.createdAt), "MMMM dd, yyyy", {
                locale: dateLocale,
              }),
              user: invoice.createdBy?.name || "System",
            })}
          </span>
        </div>

        <div className="bg-gray-50/[0.02] dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] p-6 rounded-2xl text-center min-w-[180px]">
          <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widest block mb-1">
            {t("identity_card.valuation")}
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