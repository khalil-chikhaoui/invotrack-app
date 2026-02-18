import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { HiOutlineDocumentText, HiOutlineTrash } from "react-icons/hi2";
import { InvoiceData, STATUS_COLORS } from "../../../apis/invoices";
import { BusinessData } from "../../../apis/business";
import Badge from "../../ui/badge/Badge";
import { formatMoney } from "../../../hooks/formatMoney";

interface DeliveryInvoiceListProps {
  invoices: InvoiceData[];
  business: BusinessData;
  businessId: string;
  onRemoveInvoice: (id: string) => void;
}

export default function DeliveryInvoiceList({
  invoices,
  business,
  businessId,
  onRemoveInvoice,
}: DeliveryInvoiceListProps) {
  const { t } = useTranslation("delivery");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest px-1">
        {t("list.invoices") || "Linked Invoices"}
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {invoices.map((inv) => (
          <div
            key={inv._id}
            onClick={() =>
              navigate(`/business/${businessId}/invoices/${inv._id}`)
            }
            className="group relative flex items-center justify-between p-4  border-2 border-gray-200 dark:border-white/5 rounded-2xl hover:border-brand-400 dark:hover:border-brand-300 hover:bg-brand-600/10 transition-all duration-300  cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl transition-colors duration-300
                ${
                  inv.deliveryStatus === "Shipped"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "bg-gray-50 text-gray-400 dark:bg-white/5"
                }`}
              >
                <HiOutlineDocumentText className="size-5" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {inv.invoiceNumber}
                  </span>
                  <Badge
                    color={STATUS_COLORS[inv.deliveryStatus] || "light"}
                    size="sm"
                    className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-wide"
                  >
                    {tCommon(
                      `status.${inv.deliveryStatus.toLowerCase()}` as any,
                    ) || inv.deliveryStatus}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {inv.clientSnapshot.name} 
                  {/*format(new Date(inv.issueDate), "dd MMM yyyy")*/}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="font-mono font-medium text-sm text-gray-900 dark:text-white">
                {formatMoney(
                  inv.grandTotal,
                  business.currency,
                  business.currencyFormat,
                )}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveInvoice(inv._id);
                }}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all  group-hover:opacity-100 focus:opacity-100"
                title="Remove from manifest"
              >
                <HiOutlineTrash className="size-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}