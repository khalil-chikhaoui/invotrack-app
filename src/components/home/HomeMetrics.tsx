import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  HiOutlineBanknotes,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiArrowUp,
  HiArrowDown,
} from "react-icons/hi2";
import { HiOutlineTrendingUp } from "react-icons/hi";
import { formatDate } from "date-fns";
import { DashboardDateRange } from "./HomeHeader";
import { dashboardApi, DashboardStatsResponse } from "../../apis/dashboard";
import { formatMoney } from "../../hooks/formatMoney";
import { BusinessData } from "../../apis/business";

function MetricSkeleton() {
  return (
    // Matches the parent structure of the loaded card exactly: flex-col, justify-between, same padding
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white px-5 py-8 md:p-5 shadow-sm dark:border-white/[0.05] dark:bg-gray-900 animate-pulse h-full">
      {/* Top Section: Matches "flex items-start justify-between mb-4" */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-full">
          {/* Value Placeholder */}
          <div className="h-7 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-3"></div>
          {/* Title Placeholder */}
          <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800/80 rounded mb-2"></div>
          {/* Description Placeholder */}
          <div className="h-3 w-2/3 bg-gray-50 dark:bg-gray-800/50 rounded"></div>
        </div>
        {/* Icon Placeholder */}
        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-xl shrink-0 ml-4"></div>
      </div>

      {/* Bottom Section: Matches "flex items-center justify-between gap-2" */}
      <div className="flex items-center justify-between gap-2">
        {/* Percentage Badge Placeholder */}
        <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
        {/* Date/Comparison Text Placeholder */}
        <div className="h-3 w-20 bg-gray-50 dark:bg-gray-800/50 rounded"></div>
      </div>
    </div>
  );
}

interface HomeMetricsProps {
  dateRange: DashboardDateRange;
  business: BusinessData | null;
  loadingBusiness: boolean;
}

export default function HomeMetrics({
  dateRange,
  business,
  loadingBusiness,
}: HomeMetricsProps) {
  const { businessId } = useParams();

  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!businessId) return;

      setLoadingStats(true);
      try {
        const data = await dashboardApi.getStats(
          businessId,
          dateRange.start,
          dateRange.end
        );
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchMetrics();
  }, [dateRange, businessId]);

  const getComparisonLabel = () => {
    if (!stats?.meta) return "";
    const start = new Date(stats.meta.compareStart);
    const end = new Date(stats.meta.compareEnd);
    const currentYear = new Date().getFullYear();
    const formatStr =
      start.getFullYear() === currentYear ? "MMM dd" : "dd.MM.yy";
    return `vs. ${formatDate(start, formatStr)} - ${formatDate(
      end,
      formatStr
    )}`;
  };

  const comparisonLabel = getComparisonLabel();

  // --- Skeleton Loading State ---
  if (loadingStats || loadingBusiness || !stats || !business) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          // Fixed height wrapper ensures consistent skeleton size
          <div key={i} className="h-[180px]"> 
            <MetricSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // --- UI Configuration ---
  const metricsConfig = [
    {
      id: "revenue",
      title: "Total Revenue",
      description: "Total invoiced amount",
      value: formatMoney(
        stats.revenue.value,
        business.currency,
        business.currencyFormat
      ),
      metric: stats.revenue,
      icon: HiOutlineBanknotes,
      colorClass:
        "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
    },
    {
      id: "profit",
      title: "Gross Profit",
      description: "Revenue minus costs",
      value: formatMoney(
        stats.profit.value,
        business.currency,
        business.currencyFormat
      ),
      metric: stats.profit,
      icon: HiOutlineTrendingUp,
      colorClass:
        "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
    },
    {
      id: "invoices",
      title: "Invoices",
      description: "Volume of bills sent",
      value: stats.invoices.value.toLocaleString(),
      metric: stats.invoices,
      icon: HiOutlineDocumentText,
      colorClass:
        "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-300",
    },
    {
      id: "clients",
      title: "New Clients",
      description: "Acquired customers",
      value: stats.clients.value.toLocaleString(),
      metric: stats.clients,
      icon: HiOutlineUserGroup,
      colorClass:
        "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {metricsConfig.map((item) => (
        <div
          key={item.id}
          className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white px-5 py-8 md:p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {item.value}
              </h4>
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                {item.title}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {item.description}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${item.colorClass}`}
            >
              <item.icon className="size-5" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap" >
            <div
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold ${
                item.metric.isPositive
                  ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              {item.metric.isPositive ? (
                <HiArrowUp className="size-3" />
              ) : (
                <HiArrowDown className="size-3" />
              )}
              {item.metric.change}%
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {comparisonLabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}