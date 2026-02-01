import { useEffect, useRef, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { French } from "flatpickr/dist/l10n/fr.js";
import { German } from "flatpickr/dist/l10n/de.js";

import {
  HiOutlineCalendar,
  HiOutlinePresentationChartLine,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { ClientStatPoint } from "../../apis/invoices";
import { formatMoney } from "../../hooks/formatMoney";
import LoadingState from "../common/LoadingState";
import ChartTab from "../common/ChartTab";
import { useTheme } from "../../context/ThemeContext";

interface GenericStatsChartProps {
  entityId: string;
  fetchData: (
    id: string,
    mode: string,
    range?: { start: Date; end: Date },
  ) => Promise<ClientStatPoint[]>;
  currency?: string;
  title?: string;
  subtitle?: string;
  /** Colors for the chart [Primary, Secondary] */
  colors?: string[];
  /** Label for the secondary Y-axis (e.g., "Units Sold" or "Invoices") */
  secondaryLabel?: string;
  formatSecondaryAsCurrency?: boolean;
}

export default function GenericStatsChart({
  entityId,
  fetchData,
  currency = "USD",
  title = "Performance",
  subtitle = "Revenue & Trends",
  colors = ["#465FFF", "#34D399"],
  secondaryLabel = "Count",
  formatSecondaryAsCurrency = false,
}: GenericStatsChartProps) {
  const { t, i18n } = useTranslation("common");
  const [data, setData] = useState<ClientStatPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<
    "monthly" | "quarterly" | "annually" | "custom"
  >("monthly");
  const [customRange, setCustomRange] = useState<
    { start: Date; end: Date } | undefined
  >(undefined);

  const datePickerRef = useRef<HTMLInputElement>(null);

  const { theme } = useTheme();

  // --- Data Fetching ---
  useEffect(() => {
    const loadStats = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const stats = await fetchData(entityId, mode, customRange);
        setData(stats);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [entityId, mode, customRange, fetchData]);

  // --- Date Picker Logic ---
  useEffect(() => {
    if (!datePickerRef.current) return;

    // Determine Flatpickr Locale based on i18next language
    let locale: any = "default";
    if (i18n.language === "fr") locale = French;
    if (i18n.language === "de") locale = German;

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M d, Y",
      locale: locale, // <--- Apply Locale Here
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          setCustomRange({ start: selectedDates[0], end: selectedDates[1] });
          setMode("custom");
        }
      },
    });
    return () => fp.destroy();
  }, [i18n.language]);

  const hasData = useMemo(
    () => data.some((d) => d.revenue > 0 || d.count > 0),
    [data],
  );

  // --- Chart Configuration ---
  const series = [
    { name: t("charts.revenue"), data: data.map((d) => d.revenue) },
    { name: secondaryLabel, data: data.map((d) => d.count) },
  ];

  const options: ApexOptions = {
    legend: { show: false },
    colors: colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
    },
    stroke: {
      curve: data.length > 1 ? "smooth" : "straight",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
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
    yaxis: [
      {
        labels: {
          style: { colors: "#9CA3AF", fontSize: "10px" },
          formatter: (val) => formatMoney(val, currency, { digits: 0 }),
        },
      },
      {
        opposite: true,
        labels: {
          style: { colors: "#9CA3AF", fontSize: "10px" },
          formatter: (val) =>
            formatSecondaryAsCurrency
              ? formatMoney(val, currency, { digits: 0 })
              : val.toFixed(0),
        },
      },
    ],
    markers: {
      size: data.length < 3 ? 6 : 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    tooltip: {
      theme: theme,
      x: { show: true },
      y: {
        formatter: (val, { seriesIndex }) => {
          // Primary Axis (Revenue)
          if (seriesIndex === 0) return formatMoney(val, currency);

          // Secondary Axis (Profit or Count)
          return formatSecondaryAsCurrency
            ? formatMoney(val, currency)
            : `${val} ${secondaryLabel}`;
        },
      },
    },
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 px-0 dark:border-white/[0.05] dark:bg-white/[0.03]  min-w-0">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between items-start ">
        <div className="w-full pl-4">
          <h3 className="text-xl mt-1 font-semibold text-gray-800 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-[0.15em]">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <ChartTab
            selected={mode === "custom" ? "" : mode}
            onChange={(val) => {
              setMode(val);
              if (datePickerRef.current) datePickerRef.current.value = "";
            }}
          />
          <div className="relative inline-flex items-center">
            <HiOutlineCalendar
              className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none z-10
                ${
                  mode === "custom"
                    ? "  text-brand-600  dark:text-brand-400"
                    : " text-gray-800 dark:text-gray-400 "
                }
                `}
            />
            <input
              ref={datePickerRef}
              className={`h-9 w-10 lg:w-auto pl-9 pr-3 py-1.5 rounded-lg border text-[10px] font-medium  tracking-widest outline-none transition-all cursor-pointer  
                placeholder-gray-500 dark:placeholder-gray-300
                ${
                  mode === "custom"
                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    : "border-gray-200 bg-white text-gray-800 dark:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:lg:text-gray-400"
                }`}
              placeholder={t("charts.custom_date")}
            />
          </div>
        </div>
      </div>

      <div
        className={`relative flex-1 min-h-[300px] w-full ${loading || !hasData ? "flex items-center justify-center" : ""}`}
      >
        {loading ? (
          <LoadingState message={t("charts.loading")} minHeight="full" />
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-100 dark:border-white/5 rounded-2xl bg-gray-50/50 dark:bg-white/[0.01]">
            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <HiOutlinePresentationChartLine className="size-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-[10px] font-semibold text-gray-800 dark:text-white uppercase tracking-widest">
              {t("charts.no_data_title")}
            </h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-1 max-w-[180px] leading-relaxed">
              {t("charts.no_data_desc")}
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <Chart
              options={options}
              series={series}
              type="area"
              height="100%"
              width="100%"
            />
          </div>
        )}
      </div>
    </div>
  );
}
