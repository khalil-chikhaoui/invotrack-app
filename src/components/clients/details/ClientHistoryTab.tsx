import { useTranslation } from "react-i18next";
import { HiOutlineDocumentText, HiPlus } from "react-icons/hi2";
import Button from "../../ui/button/Button";
import { InvoiceData, InvoicePaginationMeta } from "../../../apis/invoices";
import { BusinessData } from "../../../apis/business";
import InvoiceTable from "../../../pages/Invoices/InvoiceTable";
import InvoiceFilters from "../../invoices/InvoiceFilters"; 

interface ClientHistoryTabProps {
  clientInvoices: InvoiceData[];
  business: BusinessData | null;
  loading: boolean;
  canManage: boolean;
  meta: InvoicePaginationMeta | null;
  isArchived: boolean;
  businessId: string;
  clientId: string;
  setPage: (p: number) => void;
  navigate: (path: string) => void;

  filterProps: any;
}

export default function ClientHistoryTab({
  clientInvoices,
  business,
  loading,
  canManage,
  meta,
  isArchived,
  businessId,
  clientId,
  setPage,
  navigate,

  filterProps,
}: ClientHistoryTabProps) {
  const { t } = useTranslation("client_details");

  const showTable = loading || clientInvoices.length > 0;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. Header  */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold text-gray-800 dark:text-white tracking-widest text-sm md:text-md uppercase flex items-center gap-2">
            <HiOutlineDocumentText className="size-4" />{" "}
            {t("history_tab.title")}
          </h3>

          {!isArchived && (
            <Button
              onClick={() =>
                navigate(
                  `/business/${businessId}/invoices/create?clientId=${clientId}`,
                )
              }
              className="group flex items-center gap-2 h-9 pl-3 pr-4 
                bg-brand-500 hover:bg-brand-600 text-white 
                dark:bg-brand-500 dark:hover:bg-brand-400 
                border border-transparent rounded-xl 
                transition-all duration-200 ease-in-out"
            >
              <div className="flex items-center justify-center size-5 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                <HiPlus className="size-3.5 stroke-[3]" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                {t("history_tab.new_invoice")}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. THE MASTER CARD */}
      <div className=" border border-gray-200 dark:border-white/[0.05] rounded-2xl  overflow-hidden">
        <InvoiceFilters placeholder="Invoice # ..." {...filterProps} />

        {showTable ? (
          <InvoiceTable
            invoices={clientInvoices}
            business={business}
            loading={loading}
            canManage={canManage}
            meta={meta}
            onPageChange={setPage}
            showClient={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 dark:bg-white/[0.01]">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-white/5 mb-3">
              <HiOutlineDocumentText className="size-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {filterProps.statusFilter === "Cancelled"
                ? t("history_tab.empty_cancelled")
                : t("history_tab.empty_generic")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
