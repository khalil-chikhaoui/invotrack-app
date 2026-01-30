/**
 * @fileoverview ItemsTable Component
 * Updated:
 * 1. Hidden 'Actions' column on mobile (sm screens).
 * 2. Guaranteed single-line price formatting with 'whitespace-nowrap'.
 * 3. Responsive table cell visibility.
 */

import { useNavigate, useParams } from "react-router";
import { ItemData, ItemPaginationMeta } from "../../apis/items";
import { BusinessData } from "../../apis/business";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { TrashBinIcon, PencilIcon, EyeIcon } from "../../icons";
import { HiOutlineCube, HiOutlineArrowsRightLeft } from "react-icons/hi2";
import { formatMoney } from "../../hooks/formatMoney";
import Badge from "../../components/ui/badge/Badge";
import Pagination from "../../components/common/Pagination";

interface ItemsTableProps {
  items: ItemData[];
  business: BusinessData | null;
  canManage: boolean;
  meta?: ItemPaginationMeta | null;
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
  onPageChange,
  onOpenStock,
  onOpenEdit,
  onOpenDelete,
}: ItemsTableProps) {
  const navigate = useNavigate();
  const { businessId } = useParams();

  const handleViewItem = (itemId: string) => {
    navigate(`/business/${businessId}/items/${itemId}`);
  };

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
                className="px-5 py-4 text-start text-theme-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Item
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start text-theme-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Type
              </TableCell>
              {/* Added min-width to header for price consistency */}
              <TableCell
                isHeader
                className="px-5 py-4 text-start text-theme-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]"
              >
                Price
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start text-theme-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Stock
              </TableCell>
              {/* Hidden Actions Header on Mobile */}
              <TableCell
                isHeader
                className="hidden sm:table-cell px-5 py-4 text-end text-theme-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {items.map((item) => (
              <TableRow
                key={item._id}
                onClick={() => handleViewItem(item._id)}
                className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer group"
              >
                {/* --- Item Identity --- */}
                <TableCell className="px-5 py-4 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          className="w-full h-full object-cover"
                          alt={item.name}
                        />
                      ) : (
                        <HiOutlineCube className="size-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col text-start">
                      <span className="font-medium text-theme-sm uppercase text-gray-800 dark:text-white leading-tight">
                        {item.name}
                      </span>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500 dark:text-gray-300 font-medium uppercase tracking-widest">
                          {item.sku || "No SKU"}
                        </span>
                        {item.isArchived && (
                          <Badge
                            color="error"
                            size="sm"
                            className="text-[8px] px-1.5 py-0 uppercase tracking-widest"
                          >
                            Archived
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-4 text-start">
                  <Badge
                    size="sm"
                    color={item.itemType === "Product" ? "success" : "warning"}
                    className="uppercase font-semibold text-[10px]"
                  >
                    {item.itemType}
                  </Badge>
                </TableCell>

                {/* Price: whitespace-nowrap ensures one line, font-bold for better readability */}
                <TableCell className="px-5 py-4 text-start font-bold text-sm text-gray-900 dark:text-white whitespace-nowrap">
                  {formatMoney(
                    item.price,
                    business?.currency,
                    business?.currencyFormat,
                  )}
                </TableCell>

                <TableCell className="px-5 py-4 text-start">
                  {item.itemType === "Product" ? (
                    <span
                      className={`text-sm font-medium whitespace-nowrap ${
                        item.currentStock <= (item.lowStockThreshold || 0)
                          ? "text-error-600 dark:text-error-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {item.currentStock} {item.unit}
                    </span>
                  ) : (
                    <span className="text-sm italic text-gray-400 opacity-50">
                      —
                    </span>
                  )}
                </TableCell>

                {/* Actions: hidden sm:table-cell hides the entire cell content on mobile */}
                <TableCell className="hidden sm:table-cell px-5 py-4 text-end">
                  <div
                    className="flex items-center justify-end gap-3 min-h-[28px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleViewItem(item._id)}
                      className="text-gray-400 hover:text-brand-500 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="size-5 fill-current" />
                    </button>

                    {item.itemType === "Product" &&
                      canManage &&
                      !item.isArchived && (
                        <button
                          onClick={() => onOpenStock(item)}
                          className="text-gray-400 hover:text-brand-500 transition-colors"
                          title="Stock Adjustment"
                        >
                          <HiOutlineArrowsRightLeft className="size-5" />
                        </button>
                      )}

                    {canManage && (
                      <>
                        {!item.isArchived && (
                          <button
                            onClick={() => onOpenEdit(item)}
                            className="text-gray-400 hover:text-brand-500 transition-colors"
                            title="Edit Item"
                          >
                            <PencilIcon className="size-5" />
                          </button>
                        )}

                        {!item.isArchived && (
                          <button
                            onClick={() => onOpenDelete(item)}
                            className="text-gray-400 hover:text-error-500 transition-colors"
                            title="Delete / Archive Item"
                          >
                            <TrashBinIcon className="size-5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
