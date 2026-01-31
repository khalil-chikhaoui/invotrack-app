import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // <--- Hook
import { dashboardApi, ProfitStat } from "../../apis/dashboard";
import { DashboardDateRange } from "./HomeHeader";
import { BusinessData } from "../../apis/business";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "date-fns";
import ProfitAnalyticsCard from "../../components/charts/ProfitAnalyticsCard";
import ChartSkeleton from "./ChartSkeleton";
import { useDateLocale } from "../../hooks/useDateLocale"; // <--- Import Date Locale Hook

interface HomeClientProfitChartProps {
  business: BusinessData | null;
  dateRange: DashboardDateRange;
  loadingBusiness?: boolean;
}
 
export default function HomeClientProfitChart({
  business,
  dateRange,
  loadingBusiness
}: HomeClientProfitChartProps) {
  const { t } = useTranslation("home"); // <--- Load namespace
  const { user } = useAuth();
  const dateLocale = useDateLocale(); // <--- Get current date locale

  const businessId = business?._id || user?.memberships[0]?.businessId._id;
  const currency = business?.currency || "USD";

  const [profitData, setProfitData] = useState<ProfitStat[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) return;

      setInternalLoading(true);
      try {
        const data = await dashboardApi.getClientProfitability(
          businessId,
          dateRange.start,
          dateRange.end
        );
        setProfitData(data.stats);
      } catch (error) {
        console.error("Failed to load client profitability", error);
        setProfitData([]);
      } finally {
        setInternalLoading(false);
      }
    };

    fetchData();
  }, [businessId, dateRange]);

  if (loadingBusiness || internalLoading) {
    return <ChartSkeleton />;
  }

  // Pass locale option to formatDate
  const formattedRange = `${formatDate(dateRange.start, "MMM dd", { locale: dateLocale })} - ${formatDate(dateRange.end, "MMM dd", { locale: dateLocale })}`;

  return (
    <ProfitAnalyticsCard
      data={profitData}
      loading={false}
      currency={currency}
      title={t("charts.profit.title")}
      subtitle={t("charts.profit.subtitle", { range: formattedRange })}
    />
  );
}