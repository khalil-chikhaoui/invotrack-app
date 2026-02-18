import { useTranslation } from "react-i18next";
import { HiOutlineArrowPath } from "react-icons/hi2";
import { PlusIcon } from "../../icons";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import SelectField from "../form/SelectField";

interface DeliveryFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  dateRange: string;
  setDateRange: (val: string) => void;
  setPage: (page: number) => void;
  loading: boolean;
  onAdd: () => void;
  onRefresh: () => void;
}

export default function DeliveryFilters({
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  setPage,
  loading,
  onAdd,
  onRefresh,
}: DeliveryFiltersProps) {
  const { t } = useTranslation("delivery");

  return (
    <div className="p-4 md:p-5 border-b border-gray-200 dark:border-white/[0.05] bg-transparent">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-end justify-between">
        <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-3 items-stretch md:items-end w-full">
          {/* Search Input*/}
          <div className="flex-1 w-full text-start">
            <label className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-1 md:mb-1.5 block px-1">
              {t("filters.search_label")}
            </label>
            <Input
              placeholder={t("filters.search_placeholder")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full !bg-transparent"
            />
          </div>

          {/* Date Range Select */}
          <div className="w-full md:w-48 text-start">
            <SelectField
              label={t("filters.date_range_label")}
              value={dateRange}
              onChange={(val) => {
                setDateRange(val);
                setPage(1);
              }}
              options={[
                { value: "all", label: t("filters.date_ranges.all") },
                { value: "today", label: t("filters.date_ranges.today") },
                { value: "lastweek", label: t("filters.date_ranges.lastweek") },
                {
                  value: "lastmonth",
                  label: t("filters.date_ranges.lastmonth"),
                },
              ]}
              isActive={dateRange !== "all"}
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons: 
            - Standardized gap-2
            - Items-stretch on mobile to fill width 
        */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="h-11 px-3 bg-white dark:bg-transparent border-gray-200 dark:border-white/10"
          >
            <HiOutlineArrowPath
              className={`size-5 text-gray-500 dark:text-gray-400 ${loading ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            onClick={onAdd}
            className="h-11 flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest px-6 shadow-lg shadow-brand-500/10"
          >
            <PlusIcon className="size-4 fill-current" />
            <span>{t("actions.generate")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
