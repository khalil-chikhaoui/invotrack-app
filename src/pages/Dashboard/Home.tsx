import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next"; // <--- Import Hook
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
    start: startOfWeek(now, { weekStartsOn: 0 }),
    end: endOfWeek(now, { weekStartsOn: 0 }),
  };
};

export default function Home() {
  const { t } = useTranslation("home"); // <--- Load namespace
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
        title={t("errors.access_restricted")}
        description={t("errors.access_desc")}
        actionText={t("errors.return")}
      />
    );
  }

  return (
    <>
      <PageMeta
        title={`${t("meta_title")} | Invotrack`}
        description={t("meta_desc")}
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
          {/* 4. Logistics Chart */}
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
