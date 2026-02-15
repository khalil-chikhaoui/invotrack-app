import { useTranslation } from "react-i18next";
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

  // Shared classes for the card container
  const cardClassName =
    "rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-brand-100 dark:hover:border-brand-500/20 transition-all flex flex-row sm:flex-col items-center sm:items-start justify-start sm:justify-between gap-4 sm:gap-0 min-h-0 sm:min-h-[160px]";

  // Shared classes for the Icon Container
  const iconContainerClass = (colorClass: string, darkColorClass: string) =>
    `flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl shrink-0 sm:mb-4 ${colorClass} ${darkColorClass}`;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 md:gap-6 mb-8">
      {/* 1. Total Revenue */}
      <div className={cardClassName}>
        <div className={iconContainerClass("bg-emerald-50", "dark:bg-emerald-500/10")}>
          <HiOutlineBanknotes className="text-emerald-500 size-5 sm:size-6" />
        </div>
        <div>
          <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("analytics.health.revenue_title")}
          </span>
          <h4 className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
            {formatMoney(
              stats.totalRevenue,
              business?.currency,
              business?.currencyFormat,
            )}
          </h4>
          <p className="mt-0.5 sm:mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            {t("analytics.health.revenue_subtitle")}
          </p>
        </div>
      </div>

      {/* 2. Total Units Sold */}
      <div className={cardClassName}>
        <div className={iconContainerClass("bg-blue-50", "dark:bg-blue-500/10")}>
          <HiOutlineShoppingCart className="text-blue-500 size-5 sm:size-6" />
        </div>
        <div>
          <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("analytics.health.sold_title")}
          </span>
          <h4 className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
            {stats.totalSold}
          </h4>
          <p className="mt-0.5 sm:mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            {t("analytics.health.sold_subtitle")}
          </p>
        </div>
      </div>

      {/* 3. Current Stock - FIXED CARD */}
      {!isService && (
        <div className={cardClassName}>
          {/* FIX: Removed the wrapper div that had 'w-full'. 
             Now using the standard icon container directly. */}
          <div className={iconContainerClass("bg-orange-50", "dark:bg-orange-500/10")}>
            <HiOutlineCube className="text-orange-500 size-5 sm:size-6" />
          </div>
          
          <div className="flex-1 w-full relative">
            {/* Badge Position: Absolute on mobile, Floating pull-up on desktop */}
            {stats.currentStock <= 5 && (
               <div className="absolute top-0 right-0 sm:static sm:float-right sm:-mt-10">
                  <Badge color="error" size="sm">{t("analytics.health.inventory_low")}</Badge>
               </div>
            )}

            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("analytics.health.inventory_title")}
            </span>
            <h4 className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
              {stats.currentStock || "0"}
            </h4>
            <p className="mt-0.5 sm:mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              {t("analytics.health.inventory_subtitle")}
            </p>
          </div>
        </div>
      )}

      {/* 4. Average Sale Price */}
      <div className={cardClassName}>
        <div className={iconContainerClass("bg-purple-50", "dark:bg-purple-500/10")}>
          <HiOutlineTag className="text-purple-500 size-5 sm:size-6" />
        </div>
        <div>
          <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("analytics.health.price_title")}
          </span>
          <h4 className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
            {formatMoney(
              stats.avgSalePrice,
              business?.currency,
              business?.currencyFormat,
            )}
          </h4>
          <p className="mt-0.5 sm:mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            {t("analytics.health.price_subtitle")}
          </p>
        </div>
      </div>

      {/* 5. Sales Velocity */}
      <div className={cardClassName}>
        <div className={iconContainerClass("bg-amber-50", "dark:bg-amber-500/10")}>
          <HiOutlineBolt className="text-amber-500 size-5 sm:size-6" />
        </div>
        <div>
          <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("analytics.health.velocity_title")}
          </span>
          <h4 className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
            {stats.salesVelocity}{" "}
            <span className="text-xs font-normal text-gray-400">
              {t("analytics.health.velocity_unit")}
            </span>
          </h4>
          <p className="mt-0.5 sm:mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            {t("analytics.health.velocity_subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}