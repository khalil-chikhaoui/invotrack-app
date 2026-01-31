import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTranslation } from "react-i18next"; // <--- Hook
import { invoiceApi, InvoiceStatusStats } from "../../../apis/invoices";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { useTheme } from "../../../context/ThemeContext";
import LoadingState from "../../common/LoadingState"; 

interface ClientInvoiceStatusChartProps {
  clientId: string;
}

export default function ClientInvoiceStatusChart({
  clientId,
}: ClientInvoiceStatusChartProps) {
  const { t } = useTranslation("client_details"); // <--- Load namespace
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState<InvoiceStatusStats | null>(null);
  const [loading, setLoading] = useState(true);
 
  const LIGHT_COLORS = ["#10B981", "#6366F1", "#EF4444"];
  const DARK_COLORS = ["#34D399", "#818CF8", "#F87171"];

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const data = await invoiceApi.getClientInvoiceStatus(clientId);
        setStats(data);
      } catch (error) {
        console.error("Failed to load invoice status stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId]);

  const total = useMemo(() => {
    if (!stats) return 0;
    return stats.Open + stats.Paid + stats.Cancelled;
  }, [stats]);

  const series = useMemo(() => {
    if (!stats || total === 0) return [0, 0, 0];
    return [
      Math.round((stats.Paid / total) * 100),
      Math.round((stats.Open / total) * 100),
      Math.round((stats.Cancelled / total) * 100),
    ];
  }, [stats, total]);

  const labels = [
    t("analytics.status.legend.paid"), 
    t("analytics.status.legend.open"), 
    t("analytics.status.legend.cancelled")
  ];

  if (!loading && total === 0) {
    return (
      <div
        className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] 
      dark:bg-white/[0.03] min-w-0 items-center justify-center text-center"
      >
        <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
          <HiOutlineDocumentText className="size-6 text-gray-400 dark:text-gray-500" />
        </div>
        <h4 className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-widest">
          {t("analytics.status.no_data_title")}
        </h4>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
          {t("analytics.status.no_data_desc")}
        </p>
      </div>
    );
  }

  const options: ApexOptions = {
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      background: "transparent",
    },
    theme: {
      mode: isDark ? "dark" : "light",
    },
    plotOptions: {
      radialBar: {
        hollow: { size: "35%" },
        track: {
          background: isDark ? "#374151" : "#F3F4F6",
          margin: 12,
        },
        dataLabels: {
          name: {
            fontSize: "11px",
            fontWeight: "600",
            color: isDark ? "#9CA3AF" : "#6B7280",
            offsetY: -5,
          },
          value: {
            fontSize: "16px",
            fontWeight: "bold",
            color: isDark ? "#FFFFFF" : "#111827",
            offsetY: 5,
            formatter: (val) => val + "%",
          },
          total: {
            show: true,
            label: t("analytics.status.legend.total"),
            fontSize: "11px",
            fontWeight: "600",
            color: isDark ? "#9CA3AF" : "#6B7280",
            formatter: () => total.toString(),
          },
        },
      },
    },
    labels: labels,
    stroke: { lineCap: "round" },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "12px",
      fontFamily: "Outfit, sans-serif",
      fontWeight: 500,
      itemMargin: { horizontal: 10, vertical: 5 },
      labels: { colors: isDark ? "#D1D5DB" : "#374151" },
      markers: { shape: "circle", size: 6 },
      formatter: (seriesName, opts) => {
        if (!stats) return seriesName;
        const values = [stats.Paid, stats.Open, stats.Cancelled];
        return `${seriesName}: ${values[opts.seriesIndex]}`;
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]flex flex-col h-full p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
          {t("analytics.status.title")}
        </h3>
        <p className="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
          {t("analytics.status.subtitle")}
        </p>
      </div>

      <div className="relative flex-1 flex items-center justify-center flex-col min-h-[280px]">
        {loading ? (
          <LoadingState message={t("analytics.status.loading")} minHeight="full" />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height="100%"
              width="100%"
            />
          </div>
        )}
      </div>
    </div>
  );
}