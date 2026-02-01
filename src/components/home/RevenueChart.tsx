import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTranslation } from "react-i18next";
import { HiOutlinePresentationChartLine } from "react-icons/hi2";
import { dashboardApi, DashboardChartPoint } from "../../apis/dashboard";
import { useAuth } from "../../context/AuthContext";
import { BusinessData } from "../../apis/business";
import { DashboardDateRange } from "./HomeHeader";
import { formatMoney } from "../../hooks/formatMoney";
import { useTheme } from "../../context/ThemeContext";
import { formatDate } from "date-fns";
import ChartSkeleton from "./ChartSkeleton";
import { useDateLocale } from "../../hooks/useDateLocale";

interface RevenueChartProps {
  business: BusinessData | null;
  dateRange: DashboardDateRange;
  loadingBusiness?: boolean;
}

export default function RevenueChart({
  business,
  dateRange,
  loadingBusiness,
}: RevenueChartProps) {
  const { t } = useTranslation("home");
  const { user } = useAuth();
  const { theme } = useTheme();
  const dateLocale = useDateLocale();

  const businessId = business?._id || user?.memberships[0]?.businessId._id;
  const currency = business?.currency || "USD";
  const currencyFormat = business?.currencyFormat;

  const [data, setData] = useState<DashboardChartPoint[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) return;

      setInternalLoading(true);
      try {
        const result = await dashboardApi.getChartData(
          businessId,
          dateRange.start,
          dateRange.end,
        );
        setData(result);
      } catch (error) {
        console.error("Failed to load revenue chart", error);
      } finally {
        setInternalLoading(false);
      }
    };

    fetchData();
  }, [businessId, dateRange]);

  const isLoading = loadingBusiness || internalLoading;
  const hasData = useMemo(() => data.length > 0, [data]);

  const series = [
    {
      name: t("charts.revenue.series_revenue"),
      data: data.map((d) => d.revenue),
    },
    {
      name: t("charts.revenue.series_profit"),
      data: data.map((d) => d.profit),
    },
  ];

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Outfit, sans-serif",
      fontSize: "12px",
      itemMargin: { horizontal: 10 },
    },
    colors: ["#465FFF", "#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
      redrawOnParentResize: true,
    },
    stroke: { curve: "smooth", width: [2, 2] },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0.05 },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "rgba(229, 231, 235, 0.5)",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    xaxis: {
      categories: data.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "10px", colors: "#9CA3AF" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#9CA3AF", fontSize: "10px" },
        formatter: (val) => formatMoney(val, currency, { digits: 0 }),
      },
    },
    markers: {
      size: data.length < 5 ? 5 : 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    tooltip: {
      theme: theme,
      x: { show: true },
      y: { formatter: (val) => formatMoney(val, currency, currencyFormat) },
    },
  };

  const rangeLabel = `${formatDate(dateRange.start, "MMM d", { locale: dateLocale })} - ${formatDate(dateRange.end, "MMM d", { locale: dateLocale })}`;

  if (isLoading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="w-full h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-5 pl-0 dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
      <div className="mb-6 flex items-start justify-between">
        <div className="pl-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
            {t("charts.revenue.title")}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t("charts.revenue.subtitle", { range: rangeLabel })}
          </p>
        </div>
      </div>

      <div
        className={`relative flex-1 w-full min-h-0 ${!hasData ? "flex items-center justify-center" : ""}`}
      >
        {!hasData ? (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <HiOutlinePresentationChartLine className="size-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h4 className="text-[12px] font-semibold text-gray-800 dark:text-white uppercase tracking-widest">
              {t("charts.revenue.no_data_title")}
            </h4>
            <p className="text-[12px] text-gray-600 dark:text-gray-400 mt-1 max-w-[200px] leading-relaxed">
              {t("charts.revenue.no_data_desc")}
            </p>
          </div>
        ) : (
          <Chart
            options={options}
            series={series}
            type="area"
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
}
