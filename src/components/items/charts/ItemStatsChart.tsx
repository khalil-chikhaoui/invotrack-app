import { useTranslation } from "react-i18next";
import { invoiceApi } from "../../../apis/invoices";
import GenericStatsChart from "../../charts/GenericStatsChart";

interface ItemStatsChartProps {
  itemId: string;
  currency?: string;
}

export default function ItemStatsChart({
  itemId,
  currency,
}: ItemStatsChartProps) {
  const { t } = useTranslation("item_details");

  return (
    <GenericStatsChart
      entityId={itemId}
      currency={currency}
      fetchData={invoiceApi.getItemStats}
      title={t("analytics.stats.title")}
      subtitle={t("analytics.stats.subtitle")}
      colors={["#465FFF", "#34D399"]}
      secondaryLabel={t("analytics.stats.secondary_label")}
    />
  );
}
