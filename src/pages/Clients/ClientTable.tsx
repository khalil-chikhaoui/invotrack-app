import { useTranslation } from "react-i18next";
import { ClientData, ClientPaginationMeta } from "../../apis/clients";
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
  HiOutlineUsers,
} from "react-icons/hi2";
import Pagination from "../../components/common/Pagination";
import { formatMoney } from "../../hooks/formatMoney";
import LoadingState from "../../components/common/LoadingState";

interface ClientsTableProps {
  clients: ClientData[];
  business: BusinessData | null;
  meta?: ClientPaginationMeta | null;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onView: (client: ClientData) => void;
}

export default function ClientsTable({
  clients,
  business,
  meta,
  loading,
  onPageChange,
  onView,
}: ClientsTableProps) {
  const { t } = useTranslation("client");

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-full overflow-x-auto text-start">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start min-w-[250px]"
              >
                {t("list.columns.info")}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.contact")}
              </TableCell>
              
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.revenue")}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.outstanding")}
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading && clients.length === 0 ? (
              <TableRow>
                <td colSpan={4} className="p-0 border-none">
                  <div className="min-h-[300px] flex items-center justify-center">
                    <LoadingState
                      message={t("list.loading")}
                      minHeight="200px"
                    />
                  </div>
                </td>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <td colSpan={4} className="p-0 border-none">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-gray-50 dark:bg-white/5 mb-3">
                      <HiOutlineUsers className="size-8 text-gray-300 dark:text-gray-600" />
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
              clients.map((client) => (
                <TableRow
                  key={client._id}
                  onClick={() => onView(client)}
                  className="group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-all cursor-pointer"
                >
                  <TableCell className="px-5 py-3 text-start">
                    <div className="flex items-center gap-3 text-start">
                      <div className="w-10 h-10 overflow-hidden rounded-lg bg-gray-50 dark:bg-white/[0.05] flex items-center justify-center border border-gray-100 dark:border-white/[0.05] shrink-0 group-hover:border-brand-200 dark:group-hover:border-brand-500/30 transition-colors">
                        {client.logo ? (
                          <img
                            src={client.logo}
                            className="object-cover w-full h-full"
                            alt={client.name}
                          />
                        ) : client.clientType === "Business" ? (
                          <HiOutlineBuildingOffice2 className="size-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                        ) : (
                          <HiOutlineUser className="size-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                        )}
                      </div>
                      <div className="flex flex-col text-start">
                        <span className="font-semibold text-theme-sm text-gray-800 dark:text-white leading-tight">
                          {client.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            size="sm"
                            variant="light"
                            color={
                              client.clientType === "Business"
                                ? "warning"
                                : "info"
                            }
                            className="text-[8px] px-1.5 py-0 tracking-widest font-bold"
                          >
                            {t(
                              `form.options.${client.clientType.toLowerCase()}` as any,
                              client.clientType
                            )}
                          </Badge>
                          {client.isArchived && (
                            <Badge
                              color="error"
                              size="sm"
                              className="text-[8px] px-1.5 py-0 tracking-widest font-bold"
                            >
                              {t("filters.status.archived")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-start">
                      {client.email ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                          <HiMiniPaperAirplane className="size-3.5 text-brand-500" />
                          <span className="truncate max-w-[180px]">
                            {client.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[10px] italic pl-5">
                          {t("list.no_email")}
                        </span>
                      )}
                      {client.phone?.number && (
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                          <HiOutlinePhone className="size-3.5 text-brand-500" />
                          {client.phone.number}
                        </div>
                      )}
                    </div>
                  </TableCell>

                 

                  <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                    <div className="flex flex-col items-start">
                      <span
                        className={`text-theme-sm font-medium font-mono tracking-tight ${
                          client.metrics?.paidTotal
                            ? "text-success-700 dark:text-success-400"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {formatMoney(
                          client.metrics?.paidTotal || 0,
                          business?.currency,
                          business?.currencyFormat
                        )}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 mt-0.5">
                        {t("list.lifetime_paid")}
                      </span>
                    </div>
                  </TableCell>
                   <TableCell className="px-5 py-3 text-start whitespace-nowrap">
                    <div className="flex flex-col items-start">
                      <span
                        className={`text-theme-sm font-medium font-mono tracking-tight ${
                          client.metrics?.unpaidTotal
                            ? "text-error-600 dark:text-error-400"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {formatMoney(
                          client.metrics?.unpaidTotal || 0,
                          business?.currency,
                          business?.currencyFormat
                        )}
                      </span>
                      {client.metrics?.unpaidCount ? (
                        <span className="text-[10px] font-medium text-gray-500 mt-0.5">
                          {client.metrics.unpaidCount} {t("list.open_inv")}
                        </span>
                      ) : null}
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