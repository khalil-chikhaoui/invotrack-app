import { useNavigate, useParams } from "react-router";
import {
  InvoiceData,
  InvoicePaginationMeta,
  getInvoiceDisplayStatus,
  STATUS_COLORS,
} from "../../apis/invoices";
import { BusinessData } from "../../apis/business";
import { EyeIcon, PencilIcon } from "../../icons";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { formatMoney } from "../../hooks/formatMoney";
import Badge from "../../components/ui/badge/Badge";
import {
  TableRow,
  Table,
  TableBody,
  TableCell,
  TableHeader,
} from "../../components/ui/table";
import { formatDate } from "date-fns";
import Pagination from "../../components/common/Pagination";
import LoadingState from "../../components/common/LoadingState";

interface InvoiceTableProps {
  invoices: InvoiceData[];
  business: BusinessData | null;
  loading?: boolean;
  canManage: boolean;
  meta?: InvoicePaginationMeta | null;
  onPageChange?: (page: number) => void;
  onOpenStatus: (inv: InvoiceData) => void;
  onOpenDelivery: (inv: InvoiceData) => void;
  showClient?: boolean;
}

export default function InvoiceTable({
  invoices,
  business,
  loading,
  canManage,
  meta,
  onPageChange,
  onOpenStatus,
  onOpenDelivery,
  showClient = true,
}: InvoiceTableProps) {
  const navigate = useNavigate();
  const { businessId } = useParams();

  const handleViewInvoice = (id: string) => {
    navigate(`/business/${businessId}/invoices/${id}`);
  };

  const baseColSpan = showClient ? 6 : 5;

  return (
    <div className="flex flex-col gap-0 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-2xl overflow-hidden shadow-sm">
      <div className="max-w-full overflow-x-auto text-start">
        {meta && (
          <Pagination
            currentPage={meta.page}
            totalPages={meta.pages}
            onPageChange={(p) => onPageChange?.(p)}
          />
        )}
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-4 text-theme-xs font-medium text-gray-500 uppercase text-start min-w-[150px]"
              >
                Invoice
              </TableCell>
              {showClient && (
                <TableCell
                  isHeader
                  className="px-5 py-4 text-theme-xs font-medium text-gray-500 uppercase text-start"
                >
                  Client
                </TableCell>
              )}
              <TableCell
                isHeader
                className="px-5 py-4 text-theme-xs font-medium text-gray-500 uppercase text-start"
              >
                Amount
              </TableCell>
              <TableCell
                isHeader
                className="hidden sm:table-cell px-5 py-4 text-theme-xs font-medium text-gray-500 uppercase text-start"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="hidden sm:table-cell px-5 py-4 text-theme-xs font-medium text-gray-500 uppercase text-start"
              >
                Logistics
              </TableCell>
             
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading && invoices.length === 0 ? (
              <TableRow>
                <td colSpan={baseColSpan} className="p-0">
                  <LoadingState
                    message="Syncing Billing Data..."
                    minHeight="200px"
                  />
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
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                  >
                    <TableCell className="px-5 py-4 text-start min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-500">
                          <HiOutlineDocumentText className="size-5" />
                        </div>
                        <div className="flex flex-col text-start">
                          <span className="font-semibold text-theme-sm text-gray-800 dark:text-white leading-tight">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-widest mt-0.5 flex items-center">
                            {formatDate(
                              new Date(inv.issueDate),
                              "MMM do, yyyy",
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
                          <span className="text-[10px] text-gray-400 font-regular uppercase tracking-widest mt-0.5 truncate max-w-[120px]">
                            {inv.clientSnapshot.email || "No email provided"}
                          </span>
                        </div>
                      </TableCell>
                    )}

                    <TableCell className="px-5 py-4 text-start">
                      <span className="text-theme-sm font-semibold text-gray-800 dark:text-white">
                        {formatMoney(
                          inv.grandTotal,
                          business?.currency,
                          business?.currencyFormat,
                        )}
                      </span>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell px-5 py-4 text-start">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canManage) onOpenStatus(inv);
                        }}
                        className={
                          canManage
                            ? "cursor-pointer hover:opacity-80 transition-opacity"
                            : ""
                        }
                      >
                        <Badge size="sm" color={statusColor}>
                          <div className="flex items-center gap-1 uppercase font-semibold text-[10px] tracking-wider">
                            {displayStatus}
                            {canManage && (
                              <PencilIcon className="size-3 opacity-50" />
                            )}
                          </div>
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell px-5 py-4 text-start">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canManage) onOpenDelivery(inv);
                        }}
                        className={
                          canManage
                            ? "cursor-pointer hover:opacity-80 transition-opacity"
                            : ""
                        }
                      >
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
                          <div className="flex items-center gap-1 uppercase font-semibold text-[10px] tracking-wider">
                            {inv.deliveryStatus}
                            {canManage && (
                              <PencilIcon className="size-3 opacity-50" />
                            )}
                          </div>
                        </Badge>
                      </div>
                    </TableCell>

                    {/*<TableCell className="px-5 py-4 text-end">
                      <div
                        className="flex items-center justify-end gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleViewInvoice(inv._id)}
                          className="text-gray-400 hover:text-brand-500 transition-colors"
                        >
                          <EyeIcon className="size-5 fill-current" />
                        </button>
                        {canManage && !inv.isDeleted && (
                          <button
                            onClick={() =>
                              navigate(
                                `/business/${businessId}/invoices/${inv._id}/edit`,
                              )
                            }
                            className="text-gray-400 hover:text-brand-500 transition-colors"
                          >
                            <PencilIcon className="size-5" />
                          </button>
                        )}
                      </div>
                    </TableCell>*/}
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
