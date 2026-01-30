import { useState, useEffect } from "react";
import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionDenied from "../../components/common/PermissionDenied";
import HomeHeader, {
  DashboardDateRange,
} from "../../components/home/HomeHeader";
import HomeMetrics from "../../components/home/HomeMetrics";
import { businessApi, BusinessData } from "../../apis/business";
import TopSellingProductsChart from "../../components/home/TopSellingProductsChart";
import RevenueChart from "../../components/home/RevenueChart";
import { endOfWeek, startOfWeek } from "date-fns";
import HomeDeliveryChart from "../../components/home/HomeDeliveryChart";
import HomeClientProfitChart from "../../components/home/HomeClientProfitChart";

const getDefaultRange = (): DashboardDateRange => {
  const now = new Date();
  return {
    // Set weekStartsOn: 1 for Monday start, or 0 for Sunday
    start: startOfWeek(now, { weekStartsOn: 0 }), 
    end: endOfWeek(now, { weekStartsOn: 0 }),
  };
};

export default function Home() {
  const { businessId } = useParams();
  const { canViewFinancials } = usePermissions();

  const [dateRange, setDateRange] =
    useState<DashboardDateRange>(getDefaultRange());
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!businessId) return;
      try {
        setLoadingBusiness(true);
        const data = await businessApi.getBusiness(businessId);
        setBusiness(data);
      } catch (error) {
        console.error("Failed to fetch business details", error);
      } finally {
        setTimeout(() => {
          setLoadingBusiness(false);
        }, 400);
      }
    };
    fetchBusiness();
  }, [businessId]);

  if (!canViewFinancials) {
    return (
      <PermissionDenied
        title="Dashboard Access Restricted"
        description="You do not have the required permissions to view the financial performance dashboard."
        actionText="Return to Dashboard"
      />
    ); 
  }

  return (
    <>
      <PageMeta
        title="Dashboard | Invotrack"
        description="Business Intelligence and Performance Overview"
      />

      <div className="py-4 px-2 md:px-4">
        <div className="">
        <HomeHeader dateRange={dateRange} setDateRange={setDateRange} />

        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          {/* 1. Key Financial Metrics */}
          <div className="col-span-12">
            <HomeMetrics
              dateRange={dateRange}
              business={business}
              loadingBusiness={loadingBusiness}
            />
          </div>

          {/* 2. Main Chart: Revenue (Left) */}
          <div className="col-span-12 lg:col-span-7 h-[400px] min-w-0">
            <RevenueChart
              business={business}
              dateRange={dateRange}
              loadingBusiness={loadingBusiness}
            />
          </div>

          {/* 3. Secondary Chart: Top Products (Right) */}
          <div className="col-span-12 lg:col-span-5 h-[400px] min-w-0">
            <TopSellingProductsChart
              dateRange={dateRange}
              business={business}
              loadingBusiness={loadingBusiness}
            />
          </div>
          {/* 4. Main Chart: Revenue (Left) */}
          <div className="col-span-12 lg:col-span-5 h-[400px] min-w-0">
            <HomeDeliveryChart
              business={business}
              dateRange={dateRange}
              loadingBusiness={loadingBusiness}
            />
          </div>
          {/* 5. Profit Chart */}
          <div className="col-span-12 lg:col-span-7 h-[400px] min-w-0">
            <HomeClientProfitChart
              business={business}
              dateRange={dateRange}
              loadingBusiness={loadingBusiness}
            />
          </div>

          
        </div>
      </div>
    </>
  );
}
