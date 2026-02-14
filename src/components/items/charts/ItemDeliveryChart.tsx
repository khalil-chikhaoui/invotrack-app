import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; 
import { invoiceApi, DeliveryStatsResponse } from "../../../apis/invoices";
import DeliveryAnalyticsCard from "../../charts/DeliveryAnalyticsCard";

interface ItemDeliveryChartProps {
  itemId: string;
}

export default function ItemDeliveryChart({ itemId }: ItemDeliveryChartProps) {
  const { t } = useTranslation("item_details");
  const [stats, setStats] = useState<DeliveryStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) return;
      setLoading(true);
      try {
        const data = await invoiceApi.getItemDeliveryStats(itemId);
        setStats(data);
      } catch (error) {
        console.error("Failed to load delivery stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [itemId]);

  return (
    <DeliveryAnalyticsCard
      stats={stats}
      loading={loading}
      title={t("analytics.delivery.title")}
      subtitle={t("analytics.delivery.subtitle")}
      emptyTitle={t("analytics.delivery.empty_title")}
      emptyDescription={t("analytics.delivery.empty_desc")}
    />
  );
}
