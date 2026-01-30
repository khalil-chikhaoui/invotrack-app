import { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { HiOutlineTruck } from "react-icons/hi2";
import LoadingState from "../common/LoadingState"; 

// Generic interface that matches your API response structure
export interface DeliveryStats {
  Pending: number;
  Shipped: number;
  Delivered: number;
  Returned: number;
}

interface DeliveryAnalyticsCardProps {
  stats: DeliveryStats | null;
  loading: boolean;
  title?: string;
  subtitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function DeliveryAnalyticsCard({
  stats,
  loading,
  title = "Logistics",
  subtitle = "Delivery Performance",
  emptyTitle = "No Shipments",
  emptyDescription = "No delivery data found for this period.",
}: DeliveryAnalyticsCardProps) {
  
  // 1. Calculate Aggregates
  const total = useMemo(() => {
    if (!stats) return 0;
    return stats.Pending + stats.Shipped + stats.Delivered + stats.Returned;
  }, [stats]);

  const successRate = useMemo(() => {
    if (!total || !stats) return 0;
    return Math.round((stats.Delivered / total) * 100);
  }, [total, stats]);

  // 2. Chart Configuration
  const series = [successRate];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "83%" },
        track: {
          background: "var(--chart-track-color)",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "var(--chart-text-color)",
            formatter: (val) => val + "%",
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Success Rate"],
  };

  // 3. Render Empty State
  if (!loading && total === 0) {
    return (
      <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm min-w-0 overflow-hidden">
        {/* Header */}
        <div className="pt-5 px-5 mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300 font-semibold  uppercase tracking-wider">
            {subtitle} 
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-5 text-center">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
            <HiOutlineTruck className="size-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h4 className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-widest">
            {emptyTitle}
          </h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  // 4. Render Main Chart
  return (
    <div
      className="
        rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm flex flex-col h-full overflow-hidden
        [--chart-text-color:#1D2939] dark:[--chart-text-color:#FFFFFF]
        [--chart-track-color:#E4E7EC] dark:[--chart-track-color:#586780]
      "
    >
      <div className="pt-5 px-5 mb-2 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center flex-col min-h-[300px] p-5">
        {loading ? (
          <LoadingState message="Analyzing logistics..." minHeight="full" />
        ) : (
          <>
            <div className="relative -mt-10">
              <Chart options={options} series={series} type="radialBar" height={300} />
            </div>

            {/* Stats Footer Grid */}
            <div className="grid grid-cols-3 gap-4 w-full mt-4 pt-6 border-t border-gray-100 dark:border-white/5">
              <div className="text-center">
                <p className="text-[10px] uppercase font-semibold text-success-600 dark:text-success-300 tracking-widest mb-1">
                  Delivered
                </p>
                <p className="text-lg font-semibold text-success-600 dark:text-success-300">
                  {stats?.Delivered || 0}
                </p>
              </div>
              <div className="text-center border-l border-r border-gray-100 dark:border-white/5">
                <p className="text-[10px] uppercase font-semibold text-brand-500 dark:text-brand-400 tracking-widest mb-1">
                  In Transit
                </p>
                <p className="text-lg font-semibold text-brand-500 dark:text-brand-400">
                  {(stats?.Shipped || 0) + (stats?.Pending || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-semibold text-error-600 dark:text-error-400 tracking-widest mb-1">
                  Returned
                </p>
                <p className="text-lg font-semibold text-error-600 dark:text-error-400">
                  {stats?.Returned || 0}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}