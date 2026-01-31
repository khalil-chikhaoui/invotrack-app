import { useRef, useEffect, useMemo } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { useTranslation } from "react-i18next"; // <--- Hook
import { HiOutlineCalendar, HiChevronDown, HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { 
  startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, 
  startOfYear, endOfYear, subMonths, isSameDay 
} from "date-fns";

export interface DashboardDateRange {
  start: Date;
  end: Date;
}

interface HomeHeaderProps {
  dateRange: DashboardDateRange;
  setDateRange: (range: DashboardDateRange) => void;
}

export default function HomeHeader({ 
  dateRange,
  setDateRange,
}: HomeHeaderProps) {
  const { t } = useTranslation("home"); // <--- Load namespace
  const pickerRef = useRef<HTMLInputElement>(null);
  const fpInstance = useRef<flatpickr.Instance | null>(null);

  // 1. Presets Configuration
  const presets = useMemo(() => {
    const now = new Date();
    return [
      {
        key: 'today',
        label: t("header.presets.today"),
        getRange: () => ({ start: startOfDay(now), end: endOfDay(now) })
      },
      {
        key: 'last3days',
        label: t("header.presets.last3days"),
        getRange: () => ({ start: startOfDay(subDays(now, 2)), end: endOfDay(now) })
      },
      {
        key: 'thisWeek',
        label: t("header.presets.this_week"),
        getRange: () => ({ start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) })
      },
      {
        key: 'thisMonth',
        label: t("header.presets.this_month"),
        getRange: () => ({ start: startOfMonth(now), end: endOfMonth(now) })
      },
      {
        key: 'thisTrimester',
        label: t("header.presets.this_trimester"),
        getRange: () => ({ start: startOfQuarter(now), end: endOfQuarter(now) })
      },
      {
        key: 'thisSemester',
        label: t("header.presets.this_semester"),
        getRange: () => {
          const currentMonth = now.getMonth();
          const startMonth = currentMonth < 6 ? 0 : 6;
          const start = new Date(now.getFullYear(), startMonth, 1);
          const end = endOfMonth(subMonths(new Date(now.getFullYear(), startMonth + 6, 1), 1));
          return { start: startOfDay(start), end: endOfDay(end) };
        }
      },
      {
        key: 'thisYear',
        label: t("header.presets.this_year"),
        getRange: () => ({ start: startOfYear(now), end: endOfYear(now) })
      },
    ];
  }, [t]); // Add t as dependency so labels update on language switch

  // 2. Initialize Flatpickr
  useEffect(() => {
    if (!pickerRef.current) return;

    fpInstance.current = flatpickr(pickerRef.current, {
      mode: "range",
      dateFormat: "M d, Y",
      defaultDate: [dateRange.start, dateRange.end],
      static: true, 
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          setDateRange({
            start: selectedDates[0],
            end: selectedDates[1], 
          });
        }
      },
    });

    return () => fpInstance.current?.destroy();
  }, []); 

  // 3. Sync Flatpickr
  useEffect(() => {
    if (fpInstance.current) {
      fpInstance.current.setDate([dateRange.start, dateRange.end], false); 
    }
  }, [dateRange]);

  // 4. Smart Active State
  const activePresetKey = useMemo(() => {
    const found = presets.find(p => {
      const range = p.getRange();
      return isSameDay(range.start, dateRange.start) && isSameDay(range.end, dateRange.end);
    });
    return found ? found.key : 'custom';
  }, [dateRange, presets]);

  // Helper for chip styling (DRY)
  const getChipStyle = (isActive: boolean) => `
    whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-normal transition-all duration-200 border flex items-center gap-1.5
    ${isActive 
      ? "bg-brand-600  text-white border-brand-600 " 
      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10"
    }
  `;

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        
        {/* Left Section: Title + Chips */}
        <div className="flex flex-col gap-4 w-full xl:w-auto overflow-hidden">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl tracking-tight">
              {t("header.title")}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("header.subtitle")}
            </p>
          </div>

          {/* Scrollable Chips */}
          <div 
            className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
          >
            {presets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => setDateRange(preset.getRange())}
                className={getChipStyle(activePresetKey === preset.key)}
              >
                {preset.label}
              </button>
            ))}

            <button
              onClick={() => fpInstance.current?.open()}
              className={getChipStyle(activePresetKey === 'custom')}
            >
              <HiOutlineAdjustmentsHorizontal className="size-3.5" />
              {t("header.custom_range")}
            </button>
          </div>
        </div>

        {/* Right Section: Date Input */}
        <div className="w-full md:flex md:justify-end xl:block xl:w-auto">
          <div className="relative w-full md:w-80"> 
            <HiOutlineCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
            
            <input
              ref={pickerRef}
              className="h-11 w-full cursor-pointer rounded-xl border bg-white pl-10 pr-10 text-sm font-medium outline-none transition-all 
                border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 
                focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 
                dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 dark:hover:border-gray-700 dark:hover:bg-white/5 
                placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={t("header.select_range")}
            />
            
            <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}