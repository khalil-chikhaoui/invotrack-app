import { useState, useEffect, useMemo } from "react";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { HiChevronDown } from "react-icons/hi2";
import { invoiceApi, ProfitStat } from "../../../apis/invoices";
import ProfitAnalyticsCard from "../../charts/ProfitAnalyticsCard";

interface ItemProfitChartProps {
  itemId: string;
  currency?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ItemProfitChart({
  itemId,
  currency = "USD",
}: ItemProfitChartProps) {
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<number>(-1);
  const [selectedMonth, setSelectedMonth] = useState<number>(-1);
  const [statsData, setStatsData] = useState<ProfitStat[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [loading, setLoading] = useState(true);
  
  // Dropdown States
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  const yearOptions = useMemo(() => {
    return availableYears.length > 0 ? availableYears : [currentYear];
  }, [availableYears, currentYear]);

  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) return;
      setLoading(true);
      try {
        const data = await invoiceApi.getItemProfitStats(itemId, selectedYear, selectedMonth);
        setStatsData(data.stats);
        if (data.years && data.years.length > 0) setAvailableYears(data.years);
      } catch (error) {
        console.error("Failed to load profit stats", error);
        setStatsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [itemId, selectedYear, selectedMonth]);

  // Define the Dropdowns JSX to pass to the card
  const headerActions = (
    <>
      {/* Month Dropdown */}
      <div className={`relative inline-block ${selectedYear === -1 ? "opacity-50 pointer-events-none" : ""}`}>
        <button
          onClick={() => setIsMonthOpen(!isMonthOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          {selectedMonth === -1 ? "All Months" : MONTH_NAMES[selectedMonth].substring(0, 3)}
          <HiChevronDown className={`size-3 transition-transform ${isMonthOpen ? "rotate-180" : ""}`} />
        </button>
        <Dropdown isOpen={isMonthOpen} onClose={() => setIsMonthOpen(false)} className="w-32 right-0 mt-2 p-1">
          <div className="px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 mb-1">
            Select Month
          </div>
          <div className="max-h-40 overflow-y-auto custom-scrollbar">
            <DropdownItem
              onItemClick={() => { setSelectedMonth(-1); setIsMonthOpen(false); }}
              className={`flex w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${selectedMonth === -1 ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
            >
              All Months
            </DropdownItem>
            {MONTH_NAMES.map((m, idx) => (
              <DropdownItem
                key={m}
                onItemClick={() => { setSelectedMonth(idx); setIsMonthOpen(false); }}
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
          {selectedYear === -1 ? "All Time" : selectedYear}
          <HiChevronDown className={`size-3 transition-transform ${isYearOpen ? "rotate-180" : ""}`} />
        </button>
        <Dropdown isOpen={isYearOpen} onClose={() => setIsYearOpen(false)} className="w-32 right-0 mt-2 p-1">
          <div className="px-3 py-2 text-[9px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 mb-1">
            Select Year
          </div>
          <div className="max-h-40 overflow-y-auto custom-scrollbar">
            <DropdownItem
              onItemClick={() => { setSelectedYear(-1); setSelectedMonth(-1); setIsYearOpen(false); }}
              className={`flex w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${selectedYear === -1 ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
            >
              All Time
            </DropdownItem>
            {yearOptions.map((year) => (
              <DropdownItem
                key={year}
                onItemClick={() => { setSelectedYear(year); setIsYearOpen(false); }}
                className={`flex w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${selectedYear === year ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
              >
                {year}
              </DropdownItem>
            ))}
          </div>
        </Dropdown>
      </div>
    </>
  );

  return (
    <ProfitAnalyticsCard
      data={statsData}
      loading={loading}
      currency={currency}
      title="Profitability"
      subtitle="Cost vs Profit analysis"
      rightAction={headerActions} 
    />
  );
}