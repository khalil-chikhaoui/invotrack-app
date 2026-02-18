import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineTruck,
  HiOutlineDocumentText,
  HiXMark,
} from "react-icons/hi2";
import { InvoiceData } from "../../apis/invoices";
import { BusinessData } from "../../apis/business";
import { formatMoney } from "../../hooks/formatMoney";

interface ManifestPreviewListProps {
  selectedList: InvoiceData[];
  business: BusinessData | null;
  onRemove: (id: string) => void;
}

export default function ManifestPreviewList({
  selectedList,
  business,
  onRemove,
}: ManifestPreviewListProps) {
  const { t } = useTranslation("delivery");
  const { t: tCommon } = useTranslation("common");

  // Calculate the total value of the manifest on the fly
  const manifestTotal = useMemo(() => {
    return selectedList.reduce((sum, item) => sum + (item.grandTotal || 0), 0);
  }, [selectedList]);

  return (
    <div className="min-h-[300px]">
      {selectedList.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
          {/* --- HEADER --- */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center">
            <h3 className="text-sm font-medium  tracking-widest text-gray-600 dark:text-gray-300">
              {t("list.manifest_title")} ({selectedList.length})
            </h3>
            <span className="text-[10px] font-mono font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-md">
              {t("list.items_count") || "Draft"}
            </span>
          </div>

          {/* --- LIST ITEMS --- */}
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {selectedList.map((item) => (
              <div
                key={item._id}
                className="group flex items-center justify-between p-4 px-6 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all duration-200"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-lg transition-colors duration-200
                    ${
                      item.deliveryStatus === "Shipped"
                        ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                        : "bg-gray-50 dark:bg-white/[0.05] text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-500 dark:group-hover:bg-brand-500/20 dark:group-hover:text-brand-400"
                    }`}
                  >
                    {item.deliveryStatus === "Shipped" ? (
                      <HiOutlineTruck className="size-5" />
                    ) : (
                      <HiOutlineDocumentText className="size-5" />
                    )}
                  </div>

                  <div className="flex flex-col text-start">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-800 dark:text-white leading-tight">
                        {item.invoiceNumber}
                      </span>
                      {item.deliveryStatus === "Shipped" && (
                        <span className="text-[9px] bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">
                          {tCommon("status.shipped")}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide mt-0.5">
                      {item.clientSnapshot.name}
                    </span>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="font-mono font-medium text-sm text-gray-800 dark:text-white tracking-tight">
                      {formatMoney(
                        item.grandTotal,
                        business?.currency,
                        business?.currencyFormat,
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">
                      {new Date(item.issueDate).toLocaleDateString()}
                    </p>
                  </div>

                  {item.deliveryStatus !== "Shipped" && (
                    <button
                      onClick={() => onRemove(item._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                      title={t("list.remove_hint") || "Remove"}
                    >
                      <HiXMark className="size-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* --- FOOTER TOTAL --- */}
          <div className="bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 p-4 px-6 flex justify-between items-center">
            <span className="text-sm font-medium  tracking-widest text-gray-600 dark:text-gray-300">
              {t("list.columns.value_sub") || "Manifest Total"}
            </span>
            <span className="font-mono font-bold text-lg text-gray-900 dark:text-white tracking-tight">
              {formatMoney(
                manifestTotal,
                business?.currency,
                business?.currencyFormat,
              )}
            </span>
          </div>
        </div>
      ) : (
        /* --- EMPTY STATE --- */
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/30 dark:bg-transparent">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-full mb-3">
            <HiOutlineDocumentText className="size-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {t("list.empty_state")}
          </p>
        </div>
      )}
    </div>
  );
}
