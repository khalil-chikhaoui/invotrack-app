import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlinePresentationChartBar,
  HiOutlineReceiptPercent,
  HiOutlineScale,
  HiOutlineClock,
} from "react-icons/hi2";
import { InvoiceData } from "../../apis/invoices";
import { BusinessData } from "../../apis/business";
import { formatMoney } from "../../hooks/formatMoney";

interface InvoiceStatsTabProps {
  invoice: InvoiceData;
  business: BusinessData;
}

export default function InvoiceStatsTab({
  invoice,
  business,
}: InvoiceStatsTabProps) {
  const { t } = useTranslation("invoice_details");

  const stats = useMemo(() => {
    const totalCost = invoice.items.reduce(
      (sum, item) => sum + (item.costPrice || 0) * item.quantity,
      0,
    );
    const totalRevenue = invoice.grandTotal;
    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    let daysToPay = null;
    if (invoice.isPaid && invoice.paidAt) {
      const issue = new Date(invoice.issueDate);
      const paid = new Date(invoice.paidAt);
      const diffTime = Math.abs(paid.getTime() - issue.getTime());
      daysToPay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return { totalCost, profit, margin, daysToPay };
  }, [invoice]);

  const cards = [
    {
      label: t("stats.profit"),
      value: formatMoney(
        stats.profit,
        business.currency,
        business.currencyFormat,
      ),
      description: t("stats.profit_desc"),
      icon: <HiOutlineScale className="size-5 sm:size-6 text-emerald-500" />,
      bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: t("stats.margin"),
      value: `${stats.margin.toFixed(1)}%`,
      description: t("stats.margin_desc"),
      icon: <HiOutlineReceiptPercent className="size-5 sm:size-6 text-brand-500" />,
      bgClass: "bg-brand-50 dark:bg-brand-500/10",
    },
    {
      label: t("stats.cost"),
      value: formatMoney(
        stats.totalCost,
        business.currency,
        business.currencyFormat,
      ),
      description: t("stats.cost_desc"),
      icon: <HiOutlinePresentationChartBar className="size-5 sm:size-6 text-amber-500" />,
      bgClass: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: t("stats.velocity"),
      value:
        stats.daysToPay !== null
          ? `${stats.daysToPay} ${t("stats.days")}`
          : "---",
      description: t("stats.velocity_desc"),
      icon: <HiOutlineClock className="size-5 sm:size-6 text-purple-500" />,
      bgClass: "bg-purple-50 dark:bg-purple-500/10",
    },
  ];

  // Shared classes matching your ItemHealthMetrics example
  const cardClassName =
    "rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-white/[0.05] dark:bg-white/[0.03] group hover:border-brand-100 dark:hover:border-brand-500/20 transition-all flex flex-row sm:flex-col items-center sm:items-start justify-start sm:justify-between gap-4 sm:gap-0 min-h-0 sm:min-h-[160px]";

  const iconContainerClass = (colorClass: string) =>
    `flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl shrink-0 sm:mb-4 ${colorClass}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 text-start">
        {cards.map((card, idx) => (
          <div key={idx} className={cardClassName}>
            {/* Icon Wrapper */}
            <div className={iconContainerClass(card.bgClass)}>
              {card.icon}
            </div>

            {/* Text Content */}
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 block">
                {card.label}
              </span>
              <h4 className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                {card.value}
              </h4>
              <p className="mt-0.5 sm:mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}