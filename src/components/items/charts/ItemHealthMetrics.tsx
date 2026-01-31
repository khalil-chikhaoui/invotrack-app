import { useTranslation } from "react-i18next"; // <--- Hook
import {
  HiOutlineBanknotes,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineTag,
  HiOutlineBolt,
} from "react-icons/hi2";
import { BusinessData } from "../../../apis/business";
import { formatMoney } from "../../../hooks/formatMoney";
import Badge from "../../ui/badge/Badge";
import { ItemData } from "../../../apis/items";

interface ItemHealthMetricsProps {
  stats: {
    totalRevenue: number;
    totalSold: number;
    currentStock: number;
    avgSalePrice: number;
    salesVelocity: number;
  };
  business: BusinessData | null;
  item: ItemData | null;
}

export default function ItemHealthMetrics({
  stats,
  business,
  item,
}: ItemHealthMetricsProps) {
  const { t } = useTranslation("item_details");
  const isService = item?.itemType === "Service";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 md:gap-6 mb-8">
      {/* 1. Total Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-brand-100 dark:hover:border-brand-500/20 transition-all flex flex-col justify-between min-h-[160px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl dark:bg-emerald-500/10">
            <HiOutlineBanknotes className="text-emerald-500 size-6" />
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("analytics.health.revenue_title")}
          </span>
          <h4 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
            {formatMoney(
              stats.totalRevenue,
              business?.currency,
              business?.currencyFormat,
            )}
          </h4>
          <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            {t("analytics.health.revenue_subtitle")}
          </p>
        </div>
      </div>

      {/* 2. Total Units Sold */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-brand-100 dark:hover:border-brand-500/20 transition-all flex flex-col justify-between min-h-[160px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-blue-500/10">
            <HiOutlineShoppingCart className="text-blue-500 size-6" />
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("analytics.health.sold_title")}
          </span>
          <h4 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
            {stats.totalSold}
          </h4>
          <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            {t("analytics.health.sold_subtitle")}
          </p>
        </div>
      </div>

      {/* 3. Current Stock - ONLY SHOW IF NOT SERVICE */}
      {!isService && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-brand-100 dark:hover:border-brand-500/20 transition-all flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-xl dark:bg-orange-500/10">
              <HiOutlineCube className="text-orange-500 size-6" />
            </div>
            {stats.currentStock <= 5 && (
              <Badge color="error">{t("analytics.health.inventory_low")}</Badge>
            )}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("analytics.health.inventory_title")}
            </span>
            <h4 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
              {stats.currentStock || "0"}
            </h4>
            <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              {t("analytics.health.inventory_subtitle")}
            </p>
          </div>
        </div>
      )}

      {/* 4. Average Sale Price */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-brand-100 dark:hover:border-brand-500/20 transition-all flex flex-col justify-between min-h-[160px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-50 rounded-xl dark:bg-purple-500/10">
            <HiOutlineTag className="text-purple-500 size-6" />
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("analytics.health.price_title")}
          </span>
          <h4 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
            {formatMoney(
              stats.avgSalePrice,
              business?.currency,
              business?.currencyFormat,
            )}
          </h4>
          <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            {t("analytics.health.price_subtitle")}
          </p>
        </div>
      </div>

      {/* 5. Sales Velocity */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-brand-100 dark:hover:border-brand-500/20 transition-all flex flex-col justify-between min-h-[160px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl dark:bg-amber-500/10">
            <HiOutlineBolt className="text-amber-500 size-6" />
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("analytics.health.velocity_title")}
          </span>
          <h4 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
            {stats.salesVelocity}{" "}
            <span className="text-xs font-normal text-gray-400">
              {t("analytics.health.velocity_unit")}
            </span>
          </h4>
          <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            {t("analytics.health.velocity_subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
