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
  
  // New Filter Props
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* 1. Header & Filters */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-semibold text-gray-800 dark:text-white tracking-widest text-sm md:text-md uppercase flex items-center gap-2">
            <HiOutlineDocumentText className="size-4" /> Transaction Ledger
          </h3>
        </div>
        
        {/* Render Filters */}
        <InvoiceFilters {...filterProps} />
      </div>

      {/* 2. Table */}
      {invoices.length > 0 ? (
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
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-gray-200 dark:border-white/[0.05] rounded-3xl bg-gray-50/30 dark:bg-white/[0.01]">
          <HiOutlineInformationCircle className="size-8 text-gray-300 mb-2" />
          <p className="text-[10px] font-semibold text-center text-gray-400 uppercase tracking-widest">
            {filterProps.statusFilter 
              ? "No invoices match the selected filters"
              : "No invoices found containing this item"}
          </p>
        </div>
      )}
    </div>
  );
}