import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { HiChevronDown, HiOutlinePresentationChartLine } from "react-icons/hi2";
import { invoiceApi } from "../../../apis/invoices";
import { formatMoney } from "../../../hooks/formatMoney";
import LoadingState from "../../common/LoadingState";
interface MonthlySalesChartProps {
  clientId: string;
  currency?: string;
}

export default function MonthlySalesChart({
  clientId,
  currency,
}: MonthlySalesChartProps) {
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [salesData, setSalesData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const data = await invoiceApi.getMonthlySales(clientId, selectedYear);
        setSalesData(data.sales);
        if (data.years && data.years.length > 0) {
          setAvailableYears(data.years);
        }
      } catch (error) {
        console.error("Failed to load monthly sales", error);
        setSalesData(Array(12).fill(0));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId, selectedYear]);

  const hasData = useMemo(() => salesData.some((val) => val > 0), [salesData]);

  const series = [{ name: "Sales", data: salesData }];

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "10px", colors: "#9CA3AF" } },
    },
    legend: { show: false },
    yaxis: {
      labels: {
        style: { colors: "#9CA3AF", fontSize: "10px" },
        formatter: (val) => formatMoney(val, currency, { digits: 0 }),
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val) => formatMoney(val, currency),
      },
    },
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/[0.05]
     dark:bg-white/[0.03] shadow-sm min-w-0">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
            Monthly Sales
          </h3>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Revenue for {selectedYear}
          </p>
        </div>

        <div className="relative inline-block">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={availableYears.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 
            rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 
            dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {selectedYear}
            <HiChevronDown
              className={`size-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          <Dropdown
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            className="w-32 right-0 mt-2 p-1"
          >
            <div
              className="px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 
            dark:border-white/5 mb-1"
            >
              Select Year
            </div>
            <div className="max-h-40 overflow-y-auto custom-scrollbar">
              {availableYears.map((year) => (
                <DropdownItem
                  key={year}
                  onItemClick={() => {
                    setSelectedYear(year);
                    setIsOpen(false);
                  }}
                  className={`flex w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                    selectedYear === year
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  {year}
                </DropdownItem>
              ))}
            </div>
          </Dropdown>
        </div>
      </div>

      <div className={`flex-1 min-h-[300px] w-full ${loading || !hasData ? 'flex items-center justify-center' : ''}`}>
        {loading ? (
          <LoadingState message="Syncing sales..." minHeight="full" />
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-100 dark:border-white/5 rounded-2xl bg-gray-50/50 dark:bg-white/[0.01]">
            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
              <HiOutlinePresentationChartLine className="size-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-[10px] font-bold text-gray-800 dark:text-white uppercase tracking-widest">
              No Data Available
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[150px] mt-1 leading-relaxed">
              No sales recorded for the fiscal year {selectedYear}.
            </p>
          </div>
        ) : (
          <div className="w-full h-full">
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
