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
// Switched to React Icons for Delete to ensure no import errors
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
  const navigate = useNavigate();
  const { businessId } = useParams();

  const handleViewItem = (itemId: string) => {
    navigate(`/business/${businessId}/items/${itemId}`);
  };

  // 1. Helper to render the table body content cleanly
  const renderTableContent = () => {
    // Case A: Loading State
    if (loading && items.length === 0) {
      return (
        <TableRow>
          <td colSpan={5} className="p-0 border-none">
            <div className="min-h-[300px] flex items-center justify-center">
              <LoadingState message="Syncing Inventory..." minHeight="200px" />
            </div>
          </td>
        </TableRow>
      );
    }

    // Case B: Empty State
    if (items.length === 0) {
      return (
        <TableRow>
          <td colSpan={5} className="p-0 border-none">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-gray-50 dark:bg-white/5 mb-3">
                <HiOutlineCube className="size-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                No items found
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Adjust filters or create a new item.
              </p>
            </div>
          </td>
        </TableRow>
      );
    }

    // Case C: Data Rows
    return items.map((item) => (
      <TableRow
        key={item._id}
        onClick={() => handleViewItem(item._id)}
        className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-all cursor-pointer group"
      >
        {/* --- Column 1: Item Identity --- */}
        <TableCell className="px-5 py-4 text-start">
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
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                  {item.sku || "No SKU"}
                </span>
                {item.isArchived && (
                  <Badge
                    color="error"
                    size="sm"
                    className="text-[8px] px-1.5 py-0 uppercase tracking-widest font-bold"
                  >
                    Archived
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </TableCell>

        {/* --- Column 2: Type --- */}
        <TableCell className="px-5 py-4 text-start">
          <Badge
            size="sm"
            variant="light"
            color={item.itemType === "Product" ? "success" : "warning"}
            className="uppercase font-bold text-[9px] tracking-wider"
          >
            {item.itemType}
          </Badge>
        </TableCell>

        {/* --- Column 3: Price --- */}
        <TableCell className="px-5 py-4 text-start font-bold font-mono text-sm text-gray-800 dark:text-white whitespace-nowrap tracking-tight">
          {formatMoney(
            item.price,
            business?.currency,
            business?.currencyFormat
          )}
        </TableCell>

        {/* --- Column 4: Stock --- */}
        <TableCell className="px-5 py-4 text-start">
          {item.itemType === "Product" ? (
            <span
              className={`text-sm font-bold whitespace-nowrap ${
                item.currentStock <= (item.lowStockThreshold || 0)
                  ? "text-error-600 dark:text-error-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {item.currentStock}{" "}
              <span className="text-[10px] uppercase font-medium">
                {item.unit}
              </span>
            </span>
          ) : (
            <span className="text-sm italic text-gray-300 dark:text-gray-600">
              —
            </span>
          )}
        </TableCell>

        {/* --- Column 5: Actions --- */}
        <TableCell className="hidden sm:table-cell px-5 py-4 text-end">
          <div
            className="flex items-center justify-end gap-3 min-h-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            {item.itemType === "Product" && canManage && !item.isArchived && (
              <button
                onClick={() => onOpenStock(item)}
                className="text-gray-400 hover:text-brand-500 transition-colors"
                title="Stock Adjustment"
              >
                <HiOutlineArrowsRightLeft className="size-4" />
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
                    <HiOutlinePencil className="size-4" />
                  </button>
                )}

                {!item.isArchived && (
                  <button
                    onClick={() => onOpenDelete(item)}
                    className="text-gray-400 hover:text-error-500 transition-colors"
                    title="Delete / Archive Item"
                  >
                    <HiOutlineTrash className="size-4" />
                  </button>
                )}
              </>
            )}
            
            <button
                onClick={() => handleViewItem(item._id)}
                className="text-gray-400 hover:text-brand-500 transition-colors"
                title="View Details"
              >
              <HiOutlineEye className="size-4" />
            </button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-start text-[10px] font-bold text-gray-400 uppercase tracking-widest"
              >
                Item Details
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-start text-[10px] font-bold text-gray-400 uppercase tracking-widest"
              >
                Type
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-start text-[10px] font-bold text-gray-400 uppercase tracking-widest min-w-[120px]"
              >
                Price
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-start text-[10px] font-bold text-gray-400 uppercase tracking-widest"
              >
                Stock
              </TableCell>
              <TableCell
                isHeader
                className="hidden sm:table-cell px-5 py-3 text-end text-[10px] font-bold text-gray-400 uppercase tracking-widest"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {renderTableContent()}
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