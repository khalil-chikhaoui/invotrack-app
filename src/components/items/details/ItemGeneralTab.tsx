import {
  HiOutlineInformationCircle,
  HiOutlineArchiveBoxXMark,
  HiOutlineArrowPathRoundedSquare,
} from "react-icons/hi2";
import { formatMoney } from "../../../hooks/formatMoney";
import { ItemData } from "../../../apis/items";
import { BusinessData } from "../../../apis/business";
import Button from "../../ui/button/Button";

interface ItemGeneralTabProps {
  item: ItemData;
  business: BusinessData | null;
  canManage: boolean;
  onLifecycleAction: () => void;
}

export default function ItemGeneralTab({
  item,
  business,
  canManage,
  onLifecycleAction,
}: ItemGeneralTabProps) {
  const isArchived = item.isArchived;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 text-start">
      {/* --- Specifications Block --- */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-brand-500">
          <HiOutlineInformationCircle className="size-5 stroke-[2.5]" />
          <h3 className="font-bold text-[10px] tracking-widest uppercase">
            Specifications & Description
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-4xl text-sm">
          {item.description ||
            "No detailed description provided for this item record."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10 pt-8 border-t border-gray-100 dark:border-white/5">
          <div>
            <span className="text-[9px] font-bold text-gray-400 tracking-widest block mb-1 uppercase">
              Unit Price
            </span>
            <p className="text-sm font-bold text-gray-800 dark:text-white">
              {formatMoney(
                item.price,
                business?.currency,
                business?.currencyFormat,
              )}
            </p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 tracking-widest block mb-1 uppercase">
              SKU Reference
            </span>
            <p className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tighter">
              {item.sku || "---"}
            </p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 tracking-widest block mb-1 uppercase">
              Inventory Status
            </span>
            <p
              className={`text-sm font-bold ${
                item.itemType === "Service"
                  ? "text-gray-400"
                  : item.currentStock > item.lowStockThreshold
                    ? "text-emerald-500"
                    : "text-rose-500"
              }`}
            >
              {item.itemType === "Service"
                ? "N/A (Service)"
                : item.currentStock > 0
                  ? `${item.currentStock} ${item.unit || "units"}`
                  : "Out of Stock"}
            </p>
          </div>
        </div>
      </div>

      {/* --- Lifecycle Management Block --- */}
      {canManage && (
        <div className="pt-4 border-t border-gray-100 dark:border-white/5">
          <h4
            className={`text-sm font-bold uppercase tracking-widest mb-4 ${
              isArchived
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            Item Lifecycle
          </h4>

          <div
            className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors ${
              isArchived
                ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20"
                : "bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isArchived ? (
                  <HiOutlineArrowPathRoundedSquare className="size-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <HiOutlineArchiveBoxXMark className="size-5 text-rose-600 dark:text-rose-400" />
                )}
                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                  {isArchived
                    ? "Restore Item Availability"
                    : "Retire or Remove Item"}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium max-w-lg leading-relaxed">
                {isArchived
                  ? "Re-activating this item will make it available for new invoices and stock adjustments immediately."
                  : "If this item has existing transaction history, it will be Archived to preserve financial records. Otherwise, it will be permanently deleted."}
              </p>
            </div>

            <Button
              variant="outline"
              className={`px-6 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                isArchived
                  ? "border-amber-200 text-amber-600 hover:bg-amber-600"
                  : "border-error-200 text-error-600 hover:bg-error-600 dark:hover:text-white"
              }`}
              onClick={onLifecycleAction}
            >
              {isArchived ? "Restore Item" : "Delete / Archive"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
