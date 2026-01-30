import { Link } from "react-router";
import { HiOutlinePencil, HiOutlineUser } from "react-icons/hi2";
import { InvoiceData } from "../../../apis/invoices";
import Button from "../../ui/button/Button";

interface InvoicePartiesProps {
  invoice: InvoiceData;
  businessId: string | undefined;
  onEditClient?: () => void;
}

export default function InvoiceParties({
  invoice,
  businessId,
  onEditClient,
}: InvoicePartiesProps) {
  const showEditButton = onEditClient && !invoice.isDeleted;

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl py-4 px-6 shadow-sm">
      <div className="">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-[11px] font-semibold text-brand-500 dark:text-brand-300 uppercase tracking-wide flex items-center gap-2 mt-1.5">
            <HiOutlineUser className="size-6" /> Recipient Registry
          </h4>

          {/* Edit Button: Hidden on Cancelled */}
          {showEditButton && (
            <button
              type="button"
              onClick={onEditClient}
              className="group flex items-center bg-brand-500/7 hover:bg-brand-500/10 dark:bg-brand-50/10 dark:hover:bg-brand-50/20 py-1.5 px-3 rounded-md gap-1.5 text-[12px] font-medium  tracking-wide text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
            >
              <HiOutlinePencil className="size-3.5" /> Edit
            </button>
          )}
        </div>

        {/* Content */}
        <Link
          to={`/business/${businessId}/clients/${invoice.clientSnapshot.clientId}`}
          className="group inline-block"
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-white uppercase mb-1 group-hover:text-brand-500 transition-all underline decoration-gray-200 dark:decoration-white/10 underline-offset-4 group-hover:decoration-brand-500">
            {invoice.clientSnapshot.name}
          </p>
        </Link>
      {invoice.clientSnapshot.email &&  <p className="text-xs text-gray-500 font-semibold mb-4 uppercase tracking-tighter">
          {invoice.clientSnapshot.email}
        </p>}
      {invoice.clientSnapshot.phone?.number &&  <p className="text-xs text-gray-500 font-semibold mb-4 uppercase tracking-tighter">
          {invoice.clientSnapshot.phone?.number}
        </p>}
     {invoice.clientSnapshot.address?.street &&   <div className="text-xs text-gray-400 font-medium leading-relaxed">
          {invoice.clientSnapshot.address?.street},
          {invoice.clientSnapshot.address?.city}
          <br />
          {invoice.clientSnapshot.address?.zipCode},{" "}
          {invoice.clientSnapshot.address?.country}
        </div>}
      </div>
    </div>
  );
}
