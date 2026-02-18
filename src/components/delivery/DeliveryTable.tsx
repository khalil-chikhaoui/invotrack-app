import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  HiOutlineTruck,
  HiOutlinePrinter,
  HiOutlineTrash,
  HiOutlineInbox,
} from "react-icons/hi2";

// APIs & Types
import { DeliveryNoteData } from "../../apis/deliveries";
import { BusinessData } from "../../apis/business";
import { InvoiceData, STATUS_COLORS } from "../../apis/invoices";

// Components & Hooks
import { formatMoney } from "../../hooks/formatMoney";
import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from "../common/Pagination";
import LoadingState from "../common/LoadingState";
import { useNavigate } from "react-router";

interface DeliveryTableProps {
  notes: DeliveryNoteData[];
  meta: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  } | null;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  business: BusinessData | null 
}

export default function DeliveryTable({
  notes,
  meta,
  loading,
  onPageChange,
  onDelete,
  business,
}: DeliveryTableProps) {
  const { t } = useTranslation("delivery");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate(); 

  const handleReprint = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const baseUrl = window.location.origin;
    // Open the new public viewer route
    const url = `${baseUrl}/delivery/${noteId}/view?lang=${business?.language || "en"}`;
    window.open(url, "_blank");
  };

  const handleRowClick = (noteId: string) => {
    if (business?._id) {
       navigate(`/business/${business._id}/delivery/${noteId}`);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-full overflow-x-auto text-start">
        <Table className="w-full">
          <TableHeader className="bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start min-w-[150px]"
              >
                {t("list.columns.details")}
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.status")}
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.invoices")}
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.value")}
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-end"
              >
                {t("list.columns.actions")}
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading && notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0 border-none">
                  <div className="min-h-[300px] flex items-center justify-center">
                    <LoadingState minHeight="200px" />
                  </div>
                </TableCell>
              </TableRow>
            ) : notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0 border-none">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-gray-50 dark:bg-white/5 mb-3">
                      <HiOutlineInbox className="size-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t("list.empty_history")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              notes.map((note) => {
                const totalAmount = (note.invoices as InvoiceData[]).reduce(
                  (sum, inv) => sum + (inv.grandTotal || 0),
                  0,
                );
                return (
                  <TableRow
                    key={note._id}
                    onClick={() => handleRowClick(note._id)}
                    className="group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-all cursor-pointer"
                  >
                    {/* 1. MANIFEST INFO  */}
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.05] text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-500 dark:group-hover:bg-brand-500/20 dark:group-hover:text-brand-400 transition-colors">
                          <HiOutlineTruck className="size-5" />
                        </div>
                        <div className="flex flex-col text-start">
                          <span className="font-semibold text-theme-sm text-gray-800 dark:text-white leading-tight">
                            {note.deliveryNumber}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide mt-0.5">
                            {format(new Date(note.createdAt), "MMM do, yyyy")}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* 2. LOGISTICS HEALTH  */}
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex flex-wrap gap-2">
                        {note.statusCounts.Pending > 0 && (
                          <Badge
                            color={STATUS_COLORS.Pending}
                            size="sm"
                            className="font-semibold text-[10px] tracking-wide  px-3 py-1"
                          >
                            {note.statusCounts.Pending}{" "}
                            {tCommon("status.pending")}
                          </Badge>
                        )}
                        {note.statusCounts.Delivered > 0 && (
                          <Badge
                            color={STATUS_COLORS.Delivered}
                            size="sm"
                            className="font-semibold text-[10px] tracking-wide  px-3 py-1"
                          >
                            {note.statusCounts.Delivered}{" "}
                            {tCommon("status.delivered")}
                          </Badge>
                        )}
                        {note.statusCounts.Shipped > 0 && (
                          <Badge
                            color={STATUS_COLORS.Shipped}
                            size="sm"
                            className="font-semibold text-[10px] tracking-wide px-3 py-1"
                          >
                            {note.statusCounts.Shipped}{" "}
                            {tCommon("status.shipped")}
                          </Badge>
                        )}
                        {note.statusCounts.Returned > 0 && (
                          <Badge
                            color={STATUS_COLORS.Returned}
                            size="sm"
                            className="font-semibold text-[10px] tracking-wide  px-3 py-1"
                          >
                            {note.statusCounts.Returned}{" "}
                            {tCommon("status.returned")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* 3. QUANTITY */}
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex flex-col text-start leading-tight">
                        <span className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {note.invoices.length}
                        </span>
                      </div>
                    </TableCell>

                    {/* 4. TOTAL VALUE  */}
                    <TableCell className="px-5 py-4 text-start whitespace-nowrap">
                      <div className="flex flex-col text-start leading-tight">
                        <span className="text-theme-sm font-medium text-gray-800 dark:text-white font-mono tracking-tight">
                          {formatMoney(
                            totalAmount,
                            business?.currency,
                            business?.currencyFormat,
                          )}
                        </span>
                        <span className="text-[10px] text-gray-800 dark:text-white/90 font-regular mt-0.5">
                          {t("list.columns.value_sub")}
                        </span>
                      </div>
                    </TableCell>

                    {/* 5. ACTIONS  */}
                    <TableCell className="px-5 py-4 text-end">
                      <div className="flex justify-end items-center gap-1">
                        {/* REPRINT BUTTON  */}
                        <button
                          onClick={(e) => handleReprint(note._id, e)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all"
                          title={t("actions.reprint")}
                        >
                          <HiOutlinePrinter className="size-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(note._id);
                          }}
                          className="p-2 text-gray-800 dark:text-white/90 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                          title={t("actions.delete")}
                        >
                          <HiOutlineTrash className="size-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.pages > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.pages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
