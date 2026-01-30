import ClientStatsChart from "../charts/ClientStatsChart";
import MonthlySalesChart from "../charts/MonthlySalesChart";
import ClientProductPieChart from "../charts/ClientProductPieChart";
import ClientInvoiceStatusChart from "../charts/ClientInvoiceStatusChart";
import ClientAOVChart from "../charts/ClientAOVChart";
import ClientHealthMetrics from "../charts/ClientHealthMetrics";
import { BusinessData } from "../../../apis/business";

interface ClientAnalyticsTabProps {
  clientId: string;
  currency?: string;
  refreshKey: number;
  stats: { lifetimeValue: number; openBalance: number };
  business: BusinessData | null;
}

export default function ClientAnalyticsTab({
  clientId,
  currency,
  refreshKey,
  stats,
  business,
}: ClientAnalyticsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. Key Metrics (Health, Frequency, Lifetime Revenue, Open Balance) */}
      <ClientHealthMetrics
        clientId={clientId}
        financialStats={stats}
        business={business}
      />

      {/* 2. Product Pie & Invoice Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-full min-h-[350px]">
          <ClientProductPieChart
            key={`products-${refreshKey}`}
            clientId={clientId}
            currency={currency}
          />
        </div>
        <div className="h-full min-h-[350px]">
          <ClientInvoiceStatusChart
            key={`status-${refreshKey}`}
            clientId={clientId}
          />
        </div>
      </div>

      {/* 3. Performance & Monthly Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-full min-h-[350px]">
          <ClientStatsChart
            key={`stats-${refreshKey}`}
            clientId={clientId}
            currency={currency}
          />
        </div>
        <div className="h-full min-h-[350px]">
          <MonthlySalesChart
            key={`sales-${refreshKey}`}
            clientId={clientId}
            currency={currency}
          />
        </div>
      </div>

      {/* 4. AOV Trend (Now Half Width on XL) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="h-full min-h-[350px]">
          <ClientAOVChart
            key={`aov-${refreshKey}`}
            clientId={clientId}
            currency={currency}
          />
        </div>

        {/* Placeholder for future metric or symmetry */}
        <div className="hidden xl:block h-full min-h-[350px] rounded-2xl border border-dashed border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]"></div>
      </div>
    </div>
  );
}
