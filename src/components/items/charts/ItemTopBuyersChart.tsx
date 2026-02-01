import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTranslation } from "react-i18next";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { HiChevronDown, HiOutlineUsers } from "react-icons/hi2";
import { invoiceApi, TopBuyerStat } from "../../../apis/invoices";
import { formatMoney } from "../../../hooks/formatMoney";
import { useTheme } from "../../../context/ThemeContext";
import LoadingState from "../../common/LoadingState";

interface ItemTopBuyersChartProps {
  itemId: string;
  currency?: string;
}

export default function ItemTopBuyersChart({
  itemId,
  currency = "USD",
}: ItemTopBuyersChartProps) {
  const { t } = useTranslation("item_details");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<number>(-1);
  const [selectedMonth, setSelectedMonth] = useState<number>(-1);

  const [buyersData, setBuyersData] = useState<TopBuyerStat[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [loading, setLoading] = useState(true);

  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  const MONTH_NAMES = t("analytics.buyers.months_full", {
    returnObjects: true,
  }) as string[];

  const yearOptions = useMemo(() => {
    return availableYears.length > 0 ? availableYears : [currentYear];
  }, [availableYears, currentYear]);

  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) return;
      setLoading(true);
      try {
        const data = await invoiceApi.getItemTopBuyers(
          itemId,
          selectedYear,
          selectedMonth,
        );
        setBuyersData(data.buyers);
        if (data.years && data.years.length > 0) setAvailableYears(data.years);
      } catch (error) {
        console.error("Failed to load top buyers", error);
        setBuyersData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [itemId, selectedYear, selectedMonth]);

  const hasData = useMemo(
    () => buyersData.length > 0 && buyersData.some((b) => b.value > 0),
    [buyersData],
  );

  const series = [
    {
      name: t("analytics.buyers.series_name"),
      data: buyersData.map((d) => d.value),
    },
  ];

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
    },
    theme: { mode: isDark ? "dark" : "light" },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "50%",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ["transparent"] },
    xaxis: {
      categories: buyersData.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: "10px", colors: "#9CA3AF" },
        formatter: (val) => formatMoney(val, currency, { digits: 0 }),
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#9CA3AF", fontSize: "11px", fontWeight: 500 },
      },
    },
    grid: {
      borderColor: isDark ? "#374151" : "#E5E7EB",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { top: 0, right: 10, bottom: 0, left: 10 },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val, { dataPointIndex }) => {
          const revenue = formatMoney(val, currency);
          const qty = buyersData[dataPointIndex]?.quantity || 0;
          return `${revenue} (${qty} ${t("analytics.buyers.tooltip_units")})`;
        },
      },
    },
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
            {t("analytics.buyers.title")}
          </h3>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            {selectedYear === -1
              ? t("analytics.buyers.subtitle_all")
              : t("analytics.buyers.subtitle_year", { year: selectedYear })}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Month Dropdown */}
          <div
            className={`relative inline-block ${selectedYear === -1 ? "opacity-50 pointer-events-none" : ""}`}
          >
            <button
              onClick={() => setIsMonthOpen(!isMonthOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              {selectedMonth === -1
                ? t("analytics.buyers.all_months")
                : MONTH_NAMES[selectedMonth].substring(0, 3)}
              <HiChevronDown
                className={`size-3 transition-transform ${isMonthOpen ? "rotate-180" : ""}`}
              />
            </button>
            <Dropdown
              isOpen={isMonthOpen}
              onClose={() => setIsMonthOpen(false)}
              className="w-32 right-0 mt-2 p-1"
            >
              <div className="px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 mb-1">
                {t("analytics.buyers.select_month")}
              </div>
              <div className="max-h-40 overflow-y-auto custom-scrollbar">
                <DropdownItem
                  onItemClick={() => {
                    setSelectedMonth(-1);
                    setIsMonthOpen(false);
                  }}
                  className={`flex w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${selectedMonth === -1 ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                >
                  {t("analytics.buyers.all_months")}
                </DropdownItem>
                {MONTH_NAMES.map((m, idx) => (
                  <DropdownItem
                    key={m}
                    onItemClick={() => {
                      setSelectedMonth(idx);
                      setIsMonthOpen(false);
                    }}
                    className={`flex w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${selectedMonth === idx ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                  >
                    {m}
                  </DropdownItem>
                ))}
              </div>
            </Dropdown>
          </div>

          {/* Year Dropdown */}
          <div className="relative inline-block">
            <button
              onClick={() => setIsYearOpen(!isYearOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              {selectedYear === -1
                ? t("analytics.buyers.all_time")
                : selectedYear}
              <HiChevronDown
                className={`size-3 transition-transform ${isYearOpen ? "rotate-180" : ""}`}
              />
            </button>
            <Dropdown
              isOpen={isYearOpen}
              onClose={() => setIsYearOpen(false)}
              className="w-32 right-0 mt-2 p-1"
            >
              <div className="px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 mb-1">
                {t("analytics.buyers.select_year")}
              </div>
              <div className="max-h-40 overflow-y-auto custom-scrollbar">
                <DropdownItem
                  onItemClick={() => {
                    setSelectedYear(-1);
                    setSelectedMonth(-1);
                    setIsYearOpen(false);
                  }}
                  className={`flex w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${selectedYear === -1 ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                >
                  {t("analytics.buyers.all_time")}
                </DropdownItem>
                {yearOptions.map((year) => (
                  <DropdownItem
                    key={year}
                    onItemClick={() => {
                      setSelectedYear(year);
                      setIsYearOpen(false);
                    }}
                    className={`flex w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${selectedYear === year ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                  >
                    {year}
                  </DropdownItem>
                ))}
              </div>
            </Dropdown>
          </div>
        </div>
      </div>

      <div
        className={`relative flex-1 min-h-[300px] w-full ${loading || !hasData ? "flex items-center justify-center" : ""}`}
      >
        {loading ? (
          <LoadingState
            message={t("analytics.buyers.loading")}
            minHeight="full"
          />
        ) : !hasData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/[0.01]">
            <HiOutlineUsers className="size-10 text-gray-400 mb-3" />
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-widest">
              {t("analytics.buyers.no_data_title")}
            </h4>
            <p className="text-[10px] text-gray-500 mt-1">
              {t("analytics.buyers.no_data_desc")}
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <Chart
              options={options}
              series={series}
              type="bar"
              height="100%"
              width="100%"
            />
          </div>
        )}
      </div>
    </div>
  );
}
