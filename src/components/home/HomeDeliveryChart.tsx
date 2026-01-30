import { useEffect, useState } from "react";
import { dashboardApi, DeliveryStatsResponse } from "../../apis/dashboard";
import { DashboardDateRange } from "./HomeHeader";
import { BusinessData } from "../../apis/business";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "date-fns";
import DeliveryAnalyticsCard from "../../components/charts/DeliveryAnalyticsCard";
import ChartSkeleton from "./ChartSkeleton";

interface HomeDeliveryChartProps {
  business: BusinessData | null;
  dateRange: DashboardDateRange;
  loadingBusiness?: boolean; // ✅ Add optional prop
}
 
export default function HomeDeliveryChart({ 
  business, 
  dateRange, 
  loadingBusiness 
}: HomeDeliveryChartProps) {
  const { user } = useAuth();
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
          dateRange.end
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

  const rangeLabel = `${formatDate(dateRange.start, "MMM d")} - ${formatDate(dateRange.end, "MMM d")}`;


   if (loadingBusiness || internalLoading) {
    return <ChartSkeleton />;
  }

  
  return (
    <DeliveryAnalyticsCard
      stats={stats}
      loading={false} // Already handled loading above
      title="Logistics"
      subtitle={`Delivery Performance • ${rangeLabel}`}
      emptyTitle="No Shipments"
      emptyDescription="No delivery data found for this period."
    />
  );
}