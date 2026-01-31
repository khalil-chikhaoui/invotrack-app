import { useMemo } from "react";
import { useTranslation } from "react-i18next"; // <--- Hook
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
      icon: <HiOutlineScale className="size-6 text-emerald-500" />,
      color: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: t("stats.margin"),
      value: `${stats.margin.toFixed(1)}%`,
      description: t("stats.margin_desc"),
      icon: <HiOutlineReceiptPercent className="size-6 text-brand-500" />,
      color: "bg-brand-50 dark:bg-brand-500/10",
    },
    {
      label: t("stats.cost"),
      value: formatMoney(
        stats.totalCost,
        business.currency,
        business.currencyFormat,
      ),
      description: t("stats.cost_desc"),
      icon: <HiOutlinePresentationChartBar className="size-6 text-amber-500" />,
      color: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: t("stats.velocity"),
      value:
        stats.daysToPay !== null
          ? `${stats.daysToPay} ${t("stats.days")}`
          : "---",
      description: t("stats.velocity_desc"),
      icon: <HiOutlineClock className="size-6 text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-start">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xltransition-shadow"
          >
            <div
              className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}
            >
              {card.icon}
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">
              {card.label}
            </span>
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
              {card.value}
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
