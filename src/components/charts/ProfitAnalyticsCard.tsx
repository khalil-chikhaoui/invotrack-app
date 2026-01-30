import { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { HiOutlineCurrencyDollar } from "react-icons/hi2";
import { formatMoney } from "../../hooks/formatMoney";
import { useTheme } from "../../context/ThemeContext";
import LoadingState from "../common/LoadingState";

export interface ProfitStat {
  label: string;
  revenue?: number;
  cost: number;
  profit: number;
}

interface ProfitAnalyticsCardProps {
  data: ProfitStat[];
  loading: boolean;
  currency?: string;
  title?: string;
  subtitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  rightAction?: React.ReactNode; 
}

export default function ProfitAnalyticsCard({
  data,
  loading,
  currency = "USD",
  title = "Profitability",
  subtitle = "Cost vs Profit analysis",
  emptyTitle = "Insufficient Data",
  emptyDescription = "Cost prices needed for analysis.",
  rightAction, 
}: ProfitAnalyticsCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const LIGHT_COLORS = ["#465FFF", "#10B981"]; 
  const DARK_COLORS = ["#465FFF", "#34D399"]; 

  const hasData = useMemo(
    () => data.length > 0 && data.some((b) => b.profit > 0 || b.cost > 0),
    [data]
  );

  const series = [
    { name: "Cost (COGS)", data: data.map((d) => d.cost) },
    { name: "Net Profit", data: data.map((d) => d.profit) },
  ];

  const options: ApexOptions = {
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      background: "transparent",
    },
    theme: { mode: isDark ? "dark" : "light" },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "50%" } },
    dataLabels: { enabled: false },
    stroke: { width: 1, colors: isDark ? ["#1F2937"] : ["#ffffff"] },
    xaxis: {
      categories: data.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: "10px", colors: "#9CA3AF" },
        formatter: (val: string | number) => formatMoney(val, currency, { digits: 0 }),
      },
    },
    yaxis: {
      labels: { style: { colors: "#9CA3AF", fontSize: "11px", fontWeight: 500 }, maxWidth: 100 },
    },
    grid: {
      borderColor: isDark ? "#374151" : "#E5E7EB",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { top: 0, right: 10, bottom: 0, left: 10 },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "11px",
      labels: { colors: isDark ? "#D1D5DB" : "#374151" },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      shared: true,
      intersect: false,
      y: { formatter: (val) => formatMoney(val, currency) },
    },
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            {subtitle}
          </p>
        </div>
       
        {rightAction && <div className="flex gap-2">{rightAction}</div>}
      </div>

      <div className={`relative flex-1 min-h-[300px] w-full ${loading || !hasData ? 'flex items-center justify-center' : ''}`}>
        {loading ? (
          <LoadingState message="Calculating margins..." minHeight="full" />
        ) : !hasData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/[0.01]">
            <HiOutlineCurrencyDollar className="size-10 text-gray-400 mb-3" />
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-widest">
              {emptyTitle}
            </h4>
            <p className="text-[10px] text-gray-500 mt-1">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <Chart options={options} series={series} type="bar" height="100%" width="100%" />
          </div>
        )}
      </div>
    </div>
  );
}