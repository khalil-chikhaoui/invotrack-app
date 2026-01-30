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
  onOpenStatus: (inv: InvoiceData) => void;
  onOpenDelivery: (inv: InvoiceData) => void;

  // Accept the filter props object
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
  onOpenStatus,
  onOpenDelivery,
  filterProps, // Destructure
}: ClientHistoryTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. Header with Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white tracking-widest text-sm md:text-md uppercase flex items-center gap-2">
            <HiOutlineDocumentText className="size-4" /> Transaction Ledger
          </h3>

          {!isArchived && (
            <Button
              onClick={() =>
                navigate(
                  `/business/${businessId}/invoices/create?clientId=${clientId}`,
                )
              }
              // Updated Design Classes
              className="group flex items-center gap-2 h-9 pl-3 pr-4 
    bg-brand-500 hover:bg-brand-600 text-white 
    dark:bg-brand-500 dark:hover:bg-brand-400 
    border border-transparent rounded-xl 
    shadow-sm shadow-brand-500/20 hover:shadow-brand-500/40 
    transition-all duration-200 ease-in-out"
            >
              {/* Icon with a subtle translucent background for depth */}
              <div className="flex items-center justify-center size-5 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                <HiPlus className="size-3.5 stroke-[3]" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest">
                New Invoice
              </span>
            </Button>
          )}
        </div>

        {/* 2. Insert The Filter Component */}
        <InvoiceFilters {...filterProps} />
      </div>

      {/* 3. Table */}
      {clientInvoices.length > 0 ? (
        <InvoiceTable
          invoices={clientInvoices}
          business={business}
          loading={loading}
          canManage={canManage}
          meta={meta}
          onPageChange={setPage}
          onOpenStatus={onOpenStatus}
          onOpenDelivery={onOpenDelivery}
          showClient={false}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-gray-200 dark:border-white/[0.05] rounded-3xl bg-gray-50/30 dark:bg-white/[0.01]">
          <HiOutlineDocumentText className="size-8 text-gray-300 mb-2" />
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {filterProps.statusFilter === "Cancelled"
              ? "No cancelled records found"
              : "No transaction history matches criteria"}
          </p>
        </div>
      )}
    </div>
  );
}
