import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { dashboardApi, DeliveryStatsResponse } from "../../apis/dashboard";
import { DashboardDateRange } from "./HomeHeader";
import { BusinessData } from "../../apis/business";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "date-fns";
import DeliveryAnalyticsCard from "../../components/charts/DeliveryAnalyticsCard";
import ChartSkeleton from "./ChartSkeleton";
import { useDateLocale } from "../../hooks/useDateLocale";

interface HomeDeliveryChartProps {
  business: BusinessData | null;
  dateRange: DashboardDateRange;
  loadingBusiness?: boolean;
}

export default function HomeDeliveryChart({
  business,
  dateRange,
  loadingBusiness,
}: HomeDeliveryChartProps) {
  const { t } = useTranslation("home");
  const { user } = useAuth();
  const dateLocale = useDateLocale();

  const businessId = business?._id || user?.memberships[0]?.businessId._id;

  const [stats, setStats] = useState<DeliveryStatsResponse | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) return;

      setInternalLoading(true);
      try {
        const data = await dashboardApi.getDeliveryStats(
          businessId,
          dateRange.start,
          dateRange.end,
        );
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard delivery stats", error);
      } finally {
        setInternalLoading(false);
      }
    };
    fetchData();
  }, [businessId, dateRange]);

  // Pass locale option to formatDate
  const rangeLabel = `${formatDate(dateRange.start, "MMM d", { locale: dateLocale })} - ${formatDate(dateRange.end, "MMM d", { locale: dateLocale })}`;

  if (loadingBusiness || internalLoading) {
    return <ChartSkeleton />;
  }

  return (
    <DeliveryAnalyticsCard
      stats={stats}
      loading={false}
      title={t("charts.delivery.title")}
      subtitle={t("charts.delivery.subtitle", { range: rangeLabel })}
      emptyTitle={t("charts.delivery.empty_title")}
      emptyDescription={t("charts.delivery.empty_desc")}
    />
  );
}
