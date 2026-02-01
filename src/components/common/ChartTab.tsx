interface ChartTabProps {
  selected: string;
  onChange: (value: "monthly" | "quarterly" | "annually") => void;
}

const ChartTab: React.FC<ChartTabProps> = ({ selected, onChange }) => {
  const getButtonClass = (option: string) =>
    selected === option
      ? " text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-1 rounded-lg bg-transparent  p-0.5 ">
      <button
      type="button"
        onClick={() => onChange("monthly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-xs hover:text-gray-900 dark:hover:text-white 
          transition-all ${getButtonClass("monthly")}`}
      >
        Monthly
      </button>

      <button
      type="button"
        onClick={() => onChange("quarterly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-xs hover:text-gray-900 dark:hover:text-white 
          transition-all ${getButtonClass("quarterly")}`}
      >
        Quarterly
      </button>

      <button
      type="button"
        onClick={() => onChange("annually")}
        className={`px-3 py-2 font-medium w-full rounded-md text-xs hover:text-gray-900 dark:hover:text-white 
          transition-all ${getButtonClass("annually")}`}
      >
        Annually
      </button>
    </div>
  );
};

export default ChartTab;
