import { invoiceApi } from "../../../apis/invoices";
import GenericStatsChart from "../../charts/GenericStatsChart";

interface ItemStatsChartProps {
  itemId: string;
  currency?: string;
}

export default function ItemStatsChart({ itemId, currency }: ItemStatsChartProps) {
  return (
    <GenericStatsChart
      entityId={itemId}
      currency={currency}
      fetchData={invoiceApi.getItemStats} // Pass the API function directly
      title="Item Performance"
      subtitle="Revenue & Units Sold"
      colors={["#465FFF","#34D399"]} // Blue & Orange
      secondaryLabel="Units Sold"
    />
  );
}