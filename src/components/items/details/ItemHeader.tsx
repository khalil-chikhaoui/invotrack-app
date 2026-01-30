import {
  HiOutlineArrowLeft,
  HiOutlineArrowsRightLeft,
  HiOutlineArrowPathRoundedSquare,
} from "react-icons/hi2";
import Button from "../../ui/button/Button"; 
import { ItemData } from "../../../apis/items";

interface ItemHeaderProps {
  handleSmartBack: () => void;
  canGoBack: boolean;
  item: ItemData;
  canManage: boolean;
  onOpenStock: () => void;
  onRestore: () => void; 
}

export default function ItemHeader({
  handleSmartBack,
  canGoBack,
  item,
  canManage,
  onOpenStock,
  onRestore,
}: ItemHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={handleSmartBack}
        className="flex items-center mt-4 gap-2 text-[10px] font-semibold uppercase text-gray-600 hover:text-brand-500 dark:text-gray-400 hover:dark:text-brand-400 transition-colors tracking-widest cursor-pointer"
      >
        <HiOutlineArrowLeft className="size-4" />
        {canGoBack ? "Back" : "Inventory Registry"}
      </button>

      {/* Action Area */}
      {canManage &&
        (item.isArchived ? (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/10"
            onClick={onRestore}
          >
            <HiOutlineArrowPathRoundedSquare className="size-4" /> Restore Item
          </Button>
        ) : item.itemType === "Product" ? (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-500/20 dark:text-brand-400 dark:hover:bg-brand-500/5"
            onClick={onOpenStock}
          >
            <HiOutlineArrowsRightLeft className="size-4" /> Adjust Stock
          </Button>
        ) : null)}
    </div>
  );
}
