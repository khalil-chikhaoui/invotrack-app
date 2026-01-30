import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { invoiceApi } from "../../../apis/invoices";
import { formatMoney } from "../../../hooks/formatMoney";
import { useTheme } from "../../../context/ThemeContext";
import LoadingState from "../../common/LoadingState";

interface ClientAOVChartProps {
  clientId: string;
  currency?: string;
}

export default function ClientAOVChart({
  clientId,
  currency = "USD",
}: ClientAOVChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await invoiceApi.getClientAOV(clientId);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId]);

  const series = [
    { name: "Total Revenue", type: "column", data: data.map((d) => d.revenue) },
    { name: "Avg Order Value", type: "line", data: data.map((d) => d.aov) },
  ];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      background: "transparent",
    },
    theme: { mode: isDark ? "dark" : "light" },
    colors: ["#465FFF", "#10B981"], // Blue for Vol, Green for AOV
    stroke: { width: [0, 3], curve: "smooth" },
    plotOptions: { bar: { columnWidth: "40%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    labels: data.map((d) => d.label),
    grid: { borderColor: "var(--chart-grid-color)", strokeDashArray: 4 },
    xaxis: {
      labels: { style: { colors: "var(--chart-axis-text)", fontSize: "10px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        title: {
          text: "Revenue",
          style: { color: "#465FFF", fontSize: "10px" },
        },
        labels: {
          style: { colors: "var(--chart-axis-text)", fontSize: "10px" },
          formatter: (val) => formatMoney(val, currency, { digits: 0 }),
        },
      },
      {
        opposite: true,
        title: {
          text: "Avg Order Value",
          style: { color: "#10B981", fontSize: "10px" },
        },
        labels: {
          style: { colors: "var(--chart-axis-text)", fontSize: "10px" },
          formatter: (val) => formatMoney(val, currency, { digits: 0 }),
        },
      },
    ],
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: { formatter: (val) => formatMoney(val, currency) },
    },
    legend: { show: true, position: "top" },
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] 
    dark:bg-white/[0.03] shadow-sm min-w-0 
      [--chart-axis-text:#6B7280] dark:[--chart-axis-text:#9CA3AF]
      [--chart-grid-color:#E5E7EB] dark:[--chart-grid-color:#374151]"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          AOV Trend
        </h3>
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
          Revenue vs. Invoice Size
        </p>
      </div>
      <div
        className={`flex-1 min-h-[300px] ${loading ? "flex items-center justify-center" : ""}`}
      >
        {loading ? (
          <LoadingState minHeight="full" message="Calculating Trends..." />
        ) : (
          <Chart
            options={options}
            series={series}
            type="line"
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
}
