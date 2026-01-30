// src/pages/Clients/ClientTable.tsx

import { ClientData, ClientPaginationMeta } from "../../apis/clients";
// 1. Import Business Data Type
import { BusinessData } from "../../apis/business";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import {
  HiOutlineBuildingOffice2,
  HiOutlineUser,
  HiMiniPaperAirplane,
  HiOutlinePhone,
} from "react-icons/hi2";
import Pagination from "../../components/common/Pagination";
// 2. Import the formatMoney helper
import { formatMoney } from "../../hooks/formatMoney";

interface ClientsTableProps {
  clients: ClientData[];
  // 3. Add business to props
  business: BusinessData | null;
  meta?: ClientPaginationMeta | null;
  onPageChange?: (page: number) => void;
  onView: (client: ClientData) => void;
}

// REMOVED: const formatCurrency = ... (We use the hook now)

export default function ClientsTable({
  clients,
  business,
  meta,
  onPageChange,
  onView,
}: ClientsTableProps) {
  return (
    <div className="flex flex-col gap-0 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-2xl overflow-hidden shadow-sm">
      <div className="max-w-full overflow-x-auto">
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
                className="px-5 py-4 font-semibold text-start text-gray-500 text-[10px] uppercase tracking-widest w-[30%]"
              >
                Client Info
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-4 font-semibold text-start text-gray-500 text-[10px] uppercase tracking-widest"
              >
                Contact Info
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-semibold text-start text-gray-500 text-[10px] uppercase tracking-widest"
              >
                Outstanding (Open)
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 font-semibold text-start text-gray-500 text-[10px] uppercase tracking-widest"
              >
                Revenue (Paid)
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {clients.length === 0 ? (
              <TableRow>
                <td
                  colSpan={5}
                  className="p-10 text-center text-gray-500 text-theme-sm uppercase font-semibold"
                >
                  No clients found.
                </td>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client._id}
                  onClick={() => onView(client)}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer group"
                >
                  {/* 1. Client Info */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-3 text-start">
                      <div className="w-11 h-11 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shrink-0">
                        {client.logo ? (
                          <img
                            src={client.logo}
                            className="object-cover w-full h-full"
                            alt=""
                          />
                        ) : client.clientType === "Business" ? (
                          <HiOutlineBuildingOffice2 className="size-5 text-gray-500 dark:text-gray-300" />
                        ) : (
                          <HiOutlineUser className="size-5 text-gray-500 dark:text-gray-300" />
                        )}
                      </div>
                      <div className="flex flex-col text-start">
                        <span className="font-medium text-theme-sm uppercase text-gray-800 dark:text-white leading-tight">
                          {client.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            size="sm"
                            color={
                              client.clientType === "Business"
                                ? "warning"
                                : "info"
                            }
                            className="text-[8px] px-1.5 py-0 uppercase tracking-widest mt-1"
                          >
                            {client.clientType}
                          </Badge>
                          {client.isArchived && (
                            <Badge
                              color="error"
                              size="sm"
                              className="text-[8px] px-1.5 py-0 uppercase tracking-widest mt-1"
                            >
                              Archived
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* 2. Contact Info */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex flex-col gap-1 text-start font-semibold">
                      {client.email ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-300">
                          <HiMiniPaperAirplane className="size-3.5 text-brand-500" />
                          <span className="truncate max-w-[150px]">
                            {client.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs italic">
                          No email
                        </span>
                      )}
                      {client.phone?.number && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-300">
                          <HiOutlinePhone className="size-3.5 text-brand-500" />
                          {client.phone.number}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* 3. OUTSTANDING (Unpaid) */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm font-semibold ${client.metrics?.unpaidTotal ? "text-error-600 dark:text-error-400" : "text-gray-500 dark:text-gray-300"}`}
                        >
                          {/* 4. Use formatMoney with business settings */}
                          {formatMoney(
                            client.metrics?.unpaidTotal || 0,
                            business?.currency,
                            business?.currencyFormat,
                          )}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-300 tracking-wider">
                        {client.metrics?.unpaidCount || 0} Invoice
                        {(client.metrics?.unpaidCount || 0) !== 1 && "s"}
                      </span>
                    </div>
                  </TableCell>

                  {/* 4. REVENUE (Paid) */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm font-semibold ${client.metrics?.paidTotal ? "text-success-600 dark:text-success-400" : "text-gray-500 dark:text-gray-300"}`}
                        >
                          {/* 5. Use formatMoney here too */}
                          {formatMoney(
                            client.metrics?.paidTotal || 0,
                            business?.currency,
                            business?.currencyFormat,
                          )}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-300 tracking-wider">
                        {client.metrics?.paidCount || 0} Paid
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
