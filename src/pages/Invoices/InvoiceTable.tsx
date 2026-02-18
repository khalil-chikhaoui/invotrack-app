import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { formatDate } from "date-fns";
import {
  InvoiceData,
  InvoicePaginationMeta,
  getInvoiceDisplayStatus,
  STATUS_COLORS,
} from "../../apis/invoices";
import { BusinessData } from "../../apis/business";
import { HiOutlineDocumentText, HiOutlineInbox } from "react-icons/hi2";
import { formatMoney } from "../../hooks/formatMoney";
import Badge from "../../components/ui/badge/Badge";
import {
  TableRow,
  Table,
  TableBody,
  TableCell,
  TableHeader,
} from "../../components/ui/table";
import Pagination from "../../components/common/Pagination";
import LoadingState from "../../components/common/LoadingState";
import { useDateLocale } from "../../hooks/useDateLocale";

interface InvoiceTableProps {
  invoices: InvoiceData[];
  business: BusinessData | null;
  loading?: boolean;
  canManage: boolean;
  meta?: InvoicePaginationMeta | null;
  onPageChange?: (page: number) => void;
  showClient?: boolean;
}

export default function InvoiceTable({
  invoices,
  business,
  loading,
  meta,
  onPageChange,

  showClient = true,
}: InvoiceTableProps) {
  const { t } = useTranslation("invoice");
  const { t: tCommon } = useTranslation("common");

  const dateLocale = useDateLocale();

  const navigate = useNavigate();
  const { businessId } = useParams();

  const handleViewInvoice = (id: string) => {
    navigate(`/business/${businessId}/invoices/${id}`);
  };

  const baseColSpan = showClient ? 6 : 5;

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-full overflow-x-auto text-start">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start min-w-[150px]"
              >
                {t("list.columns.details")}
              </TableCell>
              {showClient && (
                <TableCell
                  isHeader
                  className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
                >
                  {t("list.columns.client")}
                </TableCell>
              )}
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.amount")}
              </TableCell>
              <TableCell
                isHeader
                className=" px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.payment")}
              </TableCell>
              <TableCell
                isHeader
                className=" px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.logistics")}
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading && invoices.length === 0 ? (
              <TableRow>
                <td colSpan={baseColSpan} className="p-0 border-none">
                  <div className="min-h-[300px] flex items-center justify-center">
                    <LoadingState
                      message={t("list.syncing")}
                      minHeight="200px"
                    />
                  </div>
                </td>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <td colSpan={baseColSpan} className="p-0 border-none">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-gray-50 dark:bg-white/5 mb-3">
                      <HiOutlineInbox className="size-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t("list.empty.title")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("list.empty.desc")}
                    </p>
                  </div>
                </td>
              </TableRow>
            ) : (
              invoices.map((inv) => {
                const displayStatus = getInvoiceDisplayStatus(inv);
                const statusColor = STATUS_COLORS[displayStatus] || "light";

                return (
                  <TableRow
                    key={inv._id}
                    onClick={() => handleViewInvoice(inv._id)}
                    className="group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-all cursor-pointer"
                  >
                    <TableCell className="px-5 py-4 text-start min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.05] text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-500 dark:group-hover:bg-brand-500/20 dark:group-hover:text-brand-400 transition-colors">
                          <HiOutlineDocumentText className="size-5" />
                        </div>
                        <div className="flex flex-col text-start">
                          <span className="font-semibold text-theme-sm text-gray-800 dark:text-white leading-tight">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide mt-0.5">
                            {" "}
                            {formatDate(
                              new Date(inv.issueDate),
                              "MMM do, yyyy",
                              { locale: dateLocale },
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {showClient && (
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col text-start leading-tight">
                          <span className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                            {inv.clientSnapshot.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-regular mt-0.5 truncate max-w-[120px]">
                            {inv.clientSnapshot.email || "—"}
                          </span>
                        </div>
                      </TableCell>
                    )}

                    <TableCell className="px-5 py-4 text-start whitespace-nowrap">
                      <span className="text-theme-sm font-medium text-gray-800 dark:text-white font-mono tracking-tight">
                        {formatMoney(
                          inv.grandTotal,
                          business?.currency,
                          business?.currencyFormat,
                        )}
                      </span>
                    </TableCell>

                    <TableCell className=" px-5 py-4 text-start">
                      <Badge size="sm" color={statusColor}>
                        <div className="flex items-center gap-1.5 uppercase font-medium text-[10px] tracking-wider px-1">
                          {tCommon(`status.${displayStatus.toLowerCase()}`, {
                            defaultValue: displayStatus,
                          })}
                        </div>
                      </Badge>
                    </TableCell>

                    <TableCell className=" px-5 py-4 text-start">
                      <Badge
                        size="sm"
                        variant="light"
                        color={
                          inv.deliveryStatus === "Delivered"
                            ? "success"
                            : inv.deliveryStatus === "Shipped"
                              ? "info"
                              : "light"
                        }
                      >
                        <div className="flex items-center gap-1.5 uppercase font-medium text-[10px] tracking-wider px-1">
                          {tCommon(
                            `status.${inv.deliveryStatus.toLowerCase()}`,
                            { defaultValue: inv.deliveryStatus },
                          )}
                        </div>
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.pages}
          onPageChange={(p) => onPageChange?.(p)}
        />
      )}
    </div>
  );
}
