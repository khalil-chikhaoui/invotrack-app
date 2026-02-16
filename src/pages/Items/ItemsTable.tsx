import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ItemData, ItemPaginationMeta } from "../../apis/items";
import { BusinessData } from "../../apis/business";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { HiOutlineTrash, HiOutlinePencil, HiOutlineEye } from "react-icons/hi";
import { HiOutlineCube, HiOutlineArrowsRightLeft } from "react-icons/hi2";
import { formatMoney } from "../../hooks/formatMoney";
import Badge from "../../components/ui/badge/Badge";
import Pagination from "../../components/common/Pagination";
import LoadingState from "../../components/common/LoadingState";

interface ItemsTableProps {
  items: ItemData[];
  business: BusinessData | null;
  canManage: boolean;
  meta?: ItemPaginationMeta | null;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onOpenStock: (item: ItemData) => void;
  onOpenEdit: (item: ItemData) => void;
  onOpenDelete: (item: ItemData) => void;
}

export default function ItemsTable({
  items,
  business,
  canManage,
  meta,
  loading,
  onPageChange,
  onOpenStock,
  onOpenEdit,
  onOpenDelete,
}: ItemsTableProps) {
  const { t } = useTranslation("item");
  const navigate = useNavigate();
  const { businessId } = useParams();

  const handleViewItem = (itemId: string) => {
    navigate(`/business/${businessId}/items/${itemId}`);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-full overflow-x-auto text-start">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start min-w-[200px]"
              >
                {t("list.columns.details")}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.type")}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.price")}
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-[10px] font-medium tracking-widest text-gray-600 dark:text-gray-300 uppercase text-start"
              >
                {t("list.columns.stock")}
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
            {loading && items.length === 0 ? (
              <TableRow>
                <td colSpan={5} className="p-0 border-none">
                  <div className="min-h-[300px] flex items-center justify-center">
                    <LoadingState
                      message={t("list.syncing")}
                      minHeight="200px"
                    />
                  </div>
                </td>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <td colSpan={5} className="p-0 border-none">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-gray-50 dark:bg-white/5 mb-3">
                      <HiOutlineCube className="size-8 text-gray-300 dark:text-gray-600" />
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
              items.map((item) => (
                <TableRow
                  key={item._id}
                  onClick={() => handleViewItem(item._id)}
                  className="group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-all cursor-pointer"
                >
                  <TableCell className="px-5 py-4 text-start min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/[0.05] flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/[0.05] shrink-0 group-hover:border-brand-200 dark:group-hover:border-brand-500/30 transition-colors">
                        {item.image ? (
                          <img
                            src={item.image}
                            className="w-full h-full object-cover"
                            alt={item.name}
                          />
                        ) : (
                          <HiOutlineCube className="size-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                        )}
                      </div>
                      <div className="flex flex-col text-start">
                        <span className="font-semibold text-theme-sm text-gray-800 dark:text-white leading-tight">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                            {item.sku || "—"}
                          </span>
                          {item.isArchived && (
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

                  <TableCell className="py-4 text-start">
                    <Badge
                      size="sm"
                      variant="light"
                      color={
                        item.itemType === "Product" ? "info" : "warning"
                      }
                    >
                      <div className="flex items-center gap-1.5 uppercase font-medium text-[10px] tracking-wider px-1">
                        {t(
                          `form.options.${item.itemType.toLowerCase()}` as any,
                          item.itemType
                        )}
                      </div>
                    </Badge>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-start whitespace-nowrap">
                    <span className="text-theme-sm font-medium text-gray-800 dark:text-white font-mono tracking-tight">
                      {formatMoney(
                        item.price,
                        business?.currency,
                        business?.currencyFormat
                      )}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-start">
                    {item.itemType === "Product" ? (
                      <span
                        className={`text-theme-sm font-medium whitespace-nowrap ${
                          item.currentStock <= (item.lowStockThreshold || 0)
                            ? "text-error-600 dark:text-error-400"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {item.currentStock}{" "}
                        <span className="text-[10px] text-gray-600 dark:text-gray-300">
                          {item.unit}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[8px] text-gray-600 dark:text-gray-300">
                        —
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-end">
                    <div
                      className="flex items-center justify-end gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.itemType === "Product" &&
                        canManage &&
                        !item.isArchived && (
                          <button
                            onClick={() => onOpenStock(item)}
                            className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-all"
                            title={t("stock_modal.title")}
                          >
                            <HiOutlineArrowsRightLeft className="size-4" />
                          </button>
                        )}

                      {canManage && (
                        <>
                          {!item.isArchived && (
                            <button
                              onClick={() => onOpenEdit(item)}
                              className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-all"
                              title={t("form.title_edit")}
                            >
                              <HiOutlinePencil className="size-4" />
                            </button>
                          )}

                          {!item.isArchived && (
                            <button
                              onClick={() => onOpenDelete(item)}
                              className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 dark:hover:text-error-400 transition-all"
                              title={t("modals.delete_title")}
                            >
                              <HiOutlineTrash className="size-4" />
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={() => handleViewItem(item._id)}
                        className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-all"
                        title={t("list.columns.details")}
                      >
                        <HiOutlineEye className="size-4" />
                      </button>
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