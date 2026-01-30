import {
  HiOutlineInformationCircle,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { InvoiceData, InvoicePaginationMeta } from "../../../apis/invoices";
import { BusinessData } from "../../../apis/business";
import InvoiceTable from "../../../pages/Invoices/InvoiceTable";
import InvoiceFilters from "../../invoices/InvoiceFilters";

interface ItemHistoryTabProps {
  invoices: InvoiceData[];
  business: BusinessData | null;
  loading: boolean;
  canManage: boolean;
  meta: InvoicePaginationMeta | null;
  setPage: (p: number) => void;
  onOpenStatus: (inv: InvoiceData) => void;
  onOpenDelivery: (inv: InvoiceData) => void;
  filterProps: any;
}
 
export default function ItemHistoryTab({
  invoices,
  business,
  loading,
  canManage,
  meta,
  setPage,
  onOpenStatus,
  onOpenDelivery,
  filterProps,
}: ItemHistoryTabProps) {

  const showTable = loading || invoices.length > 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
      
      {/* 1. Header */}
      <div className="px-1">
        <h3 className="font-semibold text-gray-800 dark:text-white tracking-widest text-sm md:text-md uppercase flex items-center gap-2">
          <HiOutlineDocumentText className="size-4" /> Transaction Ledger
        </h3>
      </div>

      {/* 2. THE MASTER CARD */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden">
        
        {/* A. Filters */}
        <InvoiceFilters placeholder="Invoice # ..." {...filterProps} />

        {/* B. Content Area */}
        {showTable ? (
          <InvoiceTable
            invoices={invoices}
            business={business}
            loading={loading}
            canManage={canManage}
            meta={meta}
            onPageChange={setPage}
            onOpenStatus={onOpenStatus}
            onOpenDelivery={onOpenDelivery}
          />
        ) : (
          /* C. Custom Empty State (Preserved Logic) */
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 dark:bg-white/[0.01]">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-white/5 mb-3">
              <HiOutlineInformationCircle className="size-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-xs font-semibold text-center text-gray-400 uppercase tracking-widest">
              {filterProps.statusFilter 
                ? "No invoices match the selected filters"
                : "No invoices found containing this item"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}