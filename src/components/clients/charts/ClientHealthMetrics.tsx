import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineHeart,
  HiOutlineClock,
  HiArrowTrendingDown,
  HiExclamationTriangle,
  HiCheckCircle,
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
  const { t } = useTranslation("client_details");
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

  if (loading) {
    return (
      <div className="mb-8">
        <LoadingState
          message={t("analytics.health.loading")}
          minHeight="160px"
        />
      </div>
    );
  }

  if (!healthData) return null;

  const getRiskConfig = (level: string) => {
    switch (level) {
      case "Low":
        return {
          color: "success" as const,
          icon: <HiCheckCircle className="mr-1 size-3" />,
          text: t("analytics.health.risk.low"),
        };
      case "Medium":
        return {
          color: "warning" as const,
          icon: <HiExclamationTriangle className="mr-1 size-3" />,
          text: t("analytics.health.risk.medium"),
        };
      case "High":
        return {
          color: "error" as const,
          icon: <HiArrowTrendingDown className="mr-1 size-3" />,
          text: t("analytics.health.risk.high"),
        };
      default:
        return {
          color: "light" as const,
          icon: null,
          text: t("analytics.health.risk.new"),
        };
    }
  };

  const riskConfig = getRiskConfig(healthData.riskLevel);
  const safeLifetime = financialStats?.lifetimeValue || 0;
  const safeOpenBalance = financialStats?.openBalance || 0;

  // --- STYLES ---
  // Added 'overflow-hidden' to ensure nothing escapes the card border
  const cardClassName =
    "relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-brand-100 dark:hover:border-brand-500/20 transition-all flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0 min-h-0 sm:min-h-[160px]";

  const iconBaseClass =
    "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl shrink-0";

  // Added 'w-full' to ensure text truncates properly on desktop flex-col layout
  const contentWrapperClass = "min-w-0 flex-1 w-full";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 mb-8">
      
      {/* 1. Lifetime Revenue */}
      <div className={cardClassName}>
        {/* Header (Desktop) / Left Icon (Mobile) */}
        <div className="flex shrink-0 sm:w-full sm:justify-between sm:mb-4">
          <div className={`${iconBaseClass} bg-emerald-50 dark:bg-emerald-500/10`}>
            <HiOutlineBanknotes className="text-emerald-500 size-5 sm:size-6" />
          </div>
        </div>

        {/* Content */}
        <div className={contentWrapperClass}>
          <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 block truncate">
            {t("analytics.health.lifetime_title")}
          </span>
          <h4 className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-semibold text-gray-800 dark:text-white truncate">
            {formatMoney(safeLifetime, business?.currency, business?.currencyFormat)}
          </h4>
          <p className="mt-0.5 sm:mt-1 text-[10px] text-gray-400 uppercase tracking-wider font-semibold truncate">
            {t("analytics.health.lifetime_desc")}
          </p>
        </div>
      </div>

      {/* 2. Open Balance */}
      <div className={cardClassName}>
        <div className="flex shrink-0 sm:w-full sm:justify-between sm:items-start sm:mb-4">
          <div className={`${iconBaseClass} bg-orange-50 dark:bg-orange-500/10`}>
            <HiOutlineScale className="text-orange-500 size-5 sm:size-6" />
          </div>
          
          {/* Badge: Absolute top-right on mobile, Static in header on desktop */}
          {safeOpenBalance > 0 && (
            <div className="absolute top-3 right-3 sm:static">
              <Badge color="warning" size="sm">
                {t("analytics.health.balance_due")}
              </Badge>
            </div>
          )}
        </div>

        <div className={contentWrapperClass}>
          <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 block truncate pr-16 sm:pr-0">
            {t("analytics.health.balance_title")}
          </span>
          <h4
            className={`mt-0.5 sm:mt-1 text-lg sm:text-2xl font-semibold truncate ${
              safeOpenBalance > 0 ? "text-error-500" : "text-gray-800 dark:text-white"
            }`}
          >
            {formatMoney(safeOpenBalance, business?.currency, business?.currencyFormat)}
          </h4>
          <p className="mt-0.5 sm:mt-1 text-[10px] text-gray-400 uppercase tracking-wider font-semibold truncate">
            {t("analytics.health.balance_desc")}
          </p>
        </div>
      </div>

      {/* 3. Client Health Score */}
      <div className={cardClassName}>
        <div className="flex shrink-0 sm:w-full sm:justify-between sm:items-start sm:mb-4">
          <div className={`${iconBaseClass} bg-rose-50 dark:bg-rose-500/10`}>
            <HiOutlineHeart className="text-rose-500 size-5 sm:size-6" />
          </div>
          <div className="absolute top-3 right-3 sm:static">
            <Badge color={riskConfig.color} size="sm">
              <span className="flex items-center gap-1">
                {riskConfig.icon} {riskConfig.text}
              </span>
            </Badge>
          </div>
        </div>

        <div className={contentWrapperClass}>
          <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 block truncate pr-24 sm:pr-0">
            {t("analytics.health.score_title")}
          </span>
          <h4 className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-semibold text-gray-800 dark:text-white truncate">
            {healthData.healthScore}/100
          </h4>
          <p className="mt-0.5 sm:mt-1 text-[10px] text-gray-400 uppercase tracking-wider font-semibold truncate">
            {t("analytics.health.score_desc")}
          </p>
        </div>
      </div>

      {/* 4. Purchase Frequency */}
      <div className={cardClassName}>
        <div className="flex shrink-0 sm:w-full sm:justify-between sm:mb-4">
          <div className={`${iconBaseClass} bg-brand-50 dark:bg-brand-500/10`}>
            <HiOutlineClock className="text-brand-500 size-5 sm:size-6" />
          </div>
        </div>

        <div className={contentWrapperClass}>
          <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 block truncate">
            {t("analytics.health.freq_title")}
          </span>
          <h4 className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-semibold text-gray-800 dark:text-white truncate">
            {healthData.avgFrequency} {t("analytics.health.days")}
          </h4>
          <p className="mt-0.5 sm:mt-1 text-[10px] text-gray-400 uppercase tracking-wider font-semibold truncate">
            {t("analytics.health.days_ago", { days: healthData.daysSinceLast })}
          </p>
        </div>
      </div>
    </div>
  );
}