import ItemStatsChart from "../charts/ItemStatsChart";
import ItemMonthlySalesChart from "../charts/ItemMonthlySalesChart";
import ItemDeliveryChart from "../charts/ItemDeliveryChart";
import ItemTopBuyersChart from "../charts/ItemTopBuyersChart";
import ItemProfitChart from "../charts/ItemProfitChart";
import ItemHealthMetrics from "../charts/ItemHealthMetrics";
import { BusinessData } from "../../../apis/business";
import { ItemData } from "../../../apis/items";

interface ItemAnalyticsTabProps {
  itemId: string;
  currency?: string;
  refreshKey: number;
  item: ItemData | null;
  stats: {
    totalRevenue: number;
    totalSold: number;
    currentStock: number;
    avgSalePrice: number;
    salesVelocity: number;
  }; 
  business: BusinessData | null;
}
 
export default function ItemAnalyticsTab({
  itemId,
  item,
  currency,
  refreshKey,
  stats, 
  business,
}: ItemAnalyticsTabProps) {
  // Logic-only wrapper, pass translations down if charts need them, or handle inside charts
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. Key Metrics Cards */}
      <ItemHealthMetrics stats={stats} business={business} item={item} />

      {/* 2. Row 1: Trends & Monthly */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-full min-h-[350px]">
          <ItemStatsChart
            key={`stats-${refreshKey}`}
            itemId={itemId}
            currency={currency}
          />
        </div>
        <div className="h-full min-h-[350px]">
          <ItemMonthlySalesChart
            key={`sales-${refreshKey}`}
            itemId={itemId}
            currency={currency}
          />
        </div>
      </div>

      {/* 3. Row 2: Delivery & Profitability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-full min-h-[350px]">
          <ItemDeliveryChart key={`delivery-${refreshKey}`} itemId={itemId} />
        </div>
        <div className="h-full min-h-[350px] lg:col-span-2">
          <ItemProfitChart
            key={`profit-${refreshKey}`}
            itemId={itemId}
            currency={currency}
          />
        </div>
      </div>

      {/* 4. Row 3: Top Buyers (Half Width) & Empty Placeholder */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-full min-h-[350px]">
          <ItemTopBuyersChart
            key={`buyers-${refreshKey}`}
            itemId={itemId}
            currency={currency}
          />
        </div>
        <div className="hidden xl:flex h-full min-h-[350px] rounded-2xl border border-dashed border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] items-center justify-center">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
           TODO MORE :D 
          </span>
        </div>
      </div>
    </div>
  );
}