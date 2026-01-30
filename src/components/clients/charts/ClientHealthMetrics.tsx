import { useEffect, useState } from "react";
import {
  HiOutlineHeart,
  HiOutlineClock,
  HiArrowTrendingDown,
  HiExclamationTriangle,
  HiCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineBanknotes,
  HiOutlineScale,
} from "react-icons/hi2";
import { invoiceApi } from "../../../apis/invoices";
import { BusinessData } from "../../../apis/business";
import { formatMoney } from "../../../hooks/formatMoney";
import Badge from "../../ui/badge/Badge";
import LoadingState from "../../common/LoadingState";

interface ClientHealthMetricsProps {
  clientId: string;
  financialStats: {
    lifetimeValue: number;
    openBalance: number;
  };
  business: BusinessData | null;
}

export default function ClientHealthMetrics({
  clientId,
  financialStats = { lifetimeValue: 0, openBalance: 0 },
  business,
}: ClientHealthMetricsProps) {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await invoiceApi.getClientHealth(clientId);
        setHealthData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId]);

  // --- INTEGRATED LOADER ---
  if (loading) {
    return (
      <div className="mb-8">
        <LoadingState message="Analyzing Health Metrics..." minHeight="144px" />
      </div>
    );
  }

  if (!healthData) return null;

  const getRiskConfig = (level: string) => {
    switch (level) {
      case "Low":
        return {
          color: "success" as const,
          icon: <HiCheckCircle className="mr-1 size-3.5" />,
          text: "Active",
        };
      case "Medium":
        return {
          color: "warning" as const,
          icon: <HiExclamationTriangle className="mr-1 size-3.5" />,
          text: "At Risk",
        };
      case "High":
        return {
          color: "error" as const,
          icon: <HiArrowTrendingDown className="mr-1 size-3.5" />,
          text: "Churned",
        };
      default:
        return { color: "light" as const, icon: null, text: "New" };
    }
  };

  const riskConfig = getRiskConfig(healthData.riskLevel);
  const safeLifetime = financialStats?.lifetimeValue || 0;
  const safeOpenBalance = financialStats?.openBalance || 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 mb-8">
      {/* 1. Lifetime Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-brand-100 dark:hover:border-brand-500/20 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl dark:bg-emerald-500/10">
            <HiOutlineBanknotes className="text-emerald-500 size-6" />
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Lifetime Revenue
          </span>
          <h4 className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
            {formatMoney(safeLifetime, business?.currency, business?.currencyFormat)}
          </h4>
          <p className="mt-2 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
            Total value of paid invoices to date.
          </p>
        </div>
      </div>

      {/* 2. Open Balance */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-orange-100 dark:hover:border-orange-500/20 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-xl dark:bg-orange-500/10">
            <HiOutlineScale className="text-orange-500 size-6" />
          </div>
          {safeOpenBalance > 0 && <Badge color="warning">Due</Badge>}
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Open Balance
          </span>
          <h4 className={`mt-1 text-2xl font-semibold ${safeOpenBalance > 0 ? "text-error-500" : "text-gray-800 dark:text-white"}`}>
            {formatMoney(safeOpenBalance, business?.currency, business?.currencyFormat)}
          </h4>
          <p className="mt-2 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
            Outstanding amount waiting for payment.
          </p>
        </div>
      </div>

      {/* 3. Client Health Score */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-rose-100 dark:hover:border-rose-500/20 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-rose-50 rounded-xl dark:bg-rose-500/10">
            <HiOutlineHeart className="text-rose-500 size-6" />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">
            <HiOutlineInformationCircle className="size-3" />
            <span>AI Score</span>
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Retention Probability
          </span>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {healthData.healthScore}/100
            </h4>
            <Badge color={riskConfig.color}>
              {riskConfig.icon} {riskConfig.text}
            </Badge>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
            Likelihood of placing another order.
          </p>
        </div>
      </div>

      {/* 4. Purchase Frequency */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-brand-100 dark:hover:border-brand-500/20 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl dark:bg-brand-500/10">
            <HiOutlineClock className="text-brand-500 size-6" />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">
            <HiOutlineInformationCircle className="size-3" />
            <span>Average</span>
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Avg. Purchase Cycle
          </span>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {healthData.avgFrequency} Days
            </h4>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
            Last Order:{" "}
            <span className="text-gray-800 dark:text-gray-200 font-semibold">
              {healthData.daysSinceLast}d ago
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}