import { invoiceApi } from "../../../apis/invoices";
import GenericStatsChart from "../../charts/GenericStatsChart";

interface ClientStatsChartProps {
  clientId: string;
  currency?: string;
}

export default function ClientStatsChart({ clientId, currency }: ClientStatsChartProps) {
  return (
    <GenericStatsChart
      entityId={clientId}
      currency={currency}
      fetchData={invoiceApi.getClientStats} // Pass the API function directly
      title="Client Growth"
      subtitle="Revenue & Invoice Volume"
      colors={["#465FFF", "#34D399"]} // Blue & Green
      secondaryLabel="Invoices"
    />
  );
}