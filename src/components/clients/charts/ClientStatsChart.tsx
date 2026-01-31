import { useTranslation } from "react-i18next"; // <--- Import Hook
import { invoiceApi } from "../../../apis/invoices";
import GenericStatsChart from "../../charts/GenericStatsChart";

interface ClientStatsChartProps {
  clientId: string;
  currency?: string;
}

export default function ClientStatsChart({ clientId, currency }: ClientStatsChartProps) {
  const { t } = useTranslation("client_details"); // <--- Load namespace

  return (
    <GenericStatsChart
      entityId={clientId}
      currency={currency}
      fetchData={invoiceApi.getClientStats} 
      title={t("analytics.stats.title")}
      subtitle={t("analytics.stats.subtitle")}
      colors={["#465FFF", "#34D399"]} 
      secondaryLabel={t("analytics.stats.secondary_label")}
    />
  );
}