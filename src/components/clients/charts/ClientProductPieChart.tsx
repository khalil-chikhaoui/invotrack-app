import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTranslation } from "react-i18next"; // <--- Hook
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { HiChevronDown, HiOutlineShoppingBag } from "react-icons/hi2";
import { invoiceApi, ProductStat } from "../../../apis/invoices";
import { formatMoney } from "../../../hooks/formatMoney";
import { useTheme } from "../../../context/ThemeContext";
import LoadingState from "../../common/LoadingState"; 

interface ClientProductPieChartProps {
  clientId: string;
  currency?: string;
}

export default function ClientProductPieChart({ 
  clientId,
  currency = "USD",
}: ClientProductPieChartProps) {
  const { t } = useTranslation("client_details"); // <--- Load namespace
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(-1);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [productData, setProductData] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const LIGHT_COLORS = ["#465FFF", "#34D399", "#F59E0B", "#EF4444", "#8B5CF6"];
  const DARK_COLORS = ["#818CF8", "#6EE7B7", "#FCD34D", "#F87171", "#A78BFA"];

  const fallbackYearOptions = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, [currentYear]);

  const yearOptions =
    availableYears.length > 0 ? availableYears : fallbackYearOptions;

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const data = await invoiceApi.getClientTopProducts(
          clientId,
          selectedYear,
        );
        setProductData(data.products);
        if (data.years && data.years.length > 0) {
          setAvailableYears(data.years);
        }
      } catch (error) {
        console.error("Failed to load top products", error);
        setProductData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId, selectedYear]);

  const hasData = useMemo(() => productData.length > 0, [productData]);

  const getYearLabel = () => {
    if (selectedYear === -1) return t("analytics.products.year_all");
    return selectedYear.toString();
  };

  const series = productData.map((p) => p.value);
  const labels = productData.map((p) => p.label);

  const options: ApexOptions = {
    labels: labels,
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
      background: "transparent",
    },
    theme: {
      mode: isDark ? "dark" : "light",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: t("analytics.products.legend_total"),
              fontSize: "12px",
              fontWeight: 600,
              color: isDark ? "#FFFFFF" : "#6B7280",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce(
                  (a: any, b: any) => a + b,
                  0,
                );
                return formatMoney(total, currency, { digits: 0 });
              },
            },
            value: {
              fontSize: "18px",
              fontWeight: 700,
              color: isDark ? "#FFFFFF" : "#111827",
              offsetY: 2,
              formatter: (val) =>
                formatMoney(Number(val), currency, { digits: 0 }),
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      fontSize: "12px",
      itemMargin: { horizontal: 10, vertical: 5 },
      labels: {
        colors: isDark ? "#D1D5DB" : "#374151",
      },
    },
    stroke: {
      show: true,
      colors: isDark ? ["#1F2937"] : ["#ffffff"],
      width: 2,
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => formatMoney(val, currency),
      },
    },
  };

  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]  flex flex-col h-full p-6"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
            {t("analytics.products.title")}
          </h3>
          <p className="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            {t("analytics.products.subtitle", { year: getYearLabel() })}
          </p>
        </div>

        <div className="relative inline-block">
          <button
            onClick={() => setIsYearOpen(!isYearOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            {getYearLabel()}
            <HiChevronDown
              className={`size-3 transition-transform ${isYearOpen ? "rotate-180" : ""}`}
            />
          </button>
          <Dropdown
            isOpen={isYearOpen}
            onClose={() => setIsYearOpen(false)}
            className="w-24 right-0 mt-2 p-1"
          >
            <DropdownItem
              onItemClick={() => {
                setSelectedYear(-1);
                setIsYearOpen(false);
              }}
              className={`flex w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                selectedYear === -1
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              }`}
            >
              {t("analytics.products.year_all")}
            </DropdownItem>
            <div className="border-t border-gray-100 dark:border-white/10 my-1"></div>
            {yearOptions.map((year) => (
              <DropdownItem
                key={year}
                onItemClick={() => {
                  setSelectedYear(year);
                  setIsYearOpen(false);
                }}
                className={`flex w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                  selectedYear === year
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                {year}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center flex-col min-h-[280px]">
        {loading ? (
          <LoadingState message={t("analytics.products.loading")} minHeight="full" />
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
              <HiOutlineShoppingBag className="size-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-widest">
              {t("analytics.products.no_data_title")}
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 max-w-xs mt-1">
              {t("analytics.products.no_data_desc")}
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