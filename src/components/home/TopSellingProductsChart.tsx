import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTranslation } from "react-i18next";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { dashboardApi } from "../../apis/dashboard";
import { formatMoney } from "../../hooks/formatMoney";
import { useTheme } from "../../context/ThemeContext";
import { DashboardDateRange } from "../home/HomeHeader";
import { formatDate } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { BusinessData } from "../../apis/business";
import ChartSkeleton from "./ChartSkeleton";
import { useDateLocale } from "../../hooks/useDateLocale";

interface TopSellingProductsChartProps {
  dateRange: DashboardDateRange;
  business: BusinessData | null;
  loadingBusiness?: boolean;
}

interface ProductStat {
  label: string;
  value: number;
  quantity: number;
}

export default function TopSellingProductsChart({
  dateRange,
  business,
  loadingBusiness,
}: TopSellingProductsChartProps) {
  const { t } = useTranslation("home");
  const { theme } = useTheme();
  const { user } = useAuth();
  const dateLocale = useDateLocale();

  const businessId = business?._id || user?.memberships[0]?.businessId._id;
  const isDark = theme === "dark";
  const currency = business?.currency || "USD";

  const [productData, setProductData] = useState<ProductStat[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  // Colors
  const LIGHT_COLORS = ["#465FFF", "#34D399", "#F59E0B", "#EF4444", "#8B5CF6"];
  const DARK_COLORS = ["#818CF8", "#6EE7B7", "#FCD34D", "#F87171", "#A78BFA"];

  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) return;

      setInternalLoading(true);
      try {
        const data = await dashboardApi.getTopSellingItems(
          businessId,
          dateRange.start,
          dateRange.end,
        );
        setProductData(data.stats);
      } catch (error) {
        console.error("Failed to load top products", error);
        setProductData([]);
      } finally {
        setInternalLoading(false);
      }
    };

    fetchData();
  }, [dateRange, businessId]);

  const hasData = useMemo(() => productData.length > 0, [productData]);
  const series = useMemo(() => productData.map((p) => p.value), [productData]);
  const labels = useMemo(() => productData.map((p) => p.label), [productData]);

  const options: ApexOptions = {
    labels: labels,
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
      background: "transparent",
    },
    theme: { mode: isDark ? "dark" : "light" },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "12px",
              color: isDark ? "#9CA3AF" : "#6B7280",
            },
            value: {
              show: true,
              fontSize: "18px",
              fontWeight: 700,
              color: isDark ? "#FFFFFF" : "#111827",
              offsetY: 2,
              formatter: (val) =>
                formatMoney(Number(val), currency, { digits: 0 }),
            },
            total: {
              show: true,
              label: t("charts.products.total_sales"),
              fontSize: "12px",
              fontWeight: 600,
              color: isDark ? "#D1D5DB" : "#6B7280",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0,
                );
                return formatMoney(total, currency, { digits: 0 });
              },
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      fontSize: "12px",
      fontWeight: 500,
      itemMargin: { horizontal: 10, vertical: 5 },
      labels: { colors: isDark ? "#D1D5DB" : "#374151" },
    },
    stroke: {
      show: true,
      colors: isDark ? ["#1F2937"] : ["#ffffff"],
      width: 2,
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: { formatter: (val) => formatMoney(val, currency) },
    },
  };

  // Pass locale option to formatDate
  const formattedDateRange = `${formatDate(dateRange.start, "MMM dd", { locale: dateLocale })} - ${formatDate(dateRange.end, "MMM dd", { locale: dateLocale })}`;

  if (loadingBusiness || internalLoading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] flex flex-col h-full p-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
            {t("charts.products.title")}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("charts.products.subtitle", { range: formattedDateRange })}
          </p>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center flex-col min-h-[280px]">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <HiOutlineShoppingBag className="size-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-widest">
              {t("charts.products.no_data_title")}
            </h4>
            <p className="text-[12px] text-gray-600 dark:text-gray-400 mt-1">
              {t("charts.products.no_data_desc")}
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <Chart
              options={options}
              series={series}
              type="donut"
              height="100%"
              width="100%"
            />
          </div>
        )}
      </div>
    </div>
  );
}
