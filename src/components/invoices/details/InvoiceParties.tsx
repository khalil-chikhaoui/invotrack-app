import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { HiOutlinePencil, HiOutlineUser } from "react-icons/hi2";
import { InvoiceData } from "../../../apis/invoices";
import ClipboardButton from "../../common/ClipboardButton";

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
  const { t } = useTranslation("invoice_details");

  // Logic check: only show if function exists AND invoice is active
  const showEditButton = !!onEditClient && !invoice.isDeleted;

  // Helper to format address for clipboard
  const address = invoice.clientSnapshot.address;
  const fullAddress = address
    ? `${address.street}, ${address.city}, ${address.zipCode}, ${address.country}`
    : "";

  return (
    <div className=" border border-gray-200 dark:border-white/[0.05] rounded-3xl py-4 px-6">
      <div>
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-[11px] font-semibold text-brand-500 dark:text-brand-300 uppercase tracking-wide flex items-center gap-2 mt-1.5">
            <HiOutlineUser className="size-6" /> {t("parties.recipient")}
          </h4>

          {showEditButton && (
            <button
              type="button"
              onClick={onEditClient}
              className="group flex items-center bg-brand-500/10 hover:bg-brand-500/20 dark:bg-white/5 dark:hover:bg-white/10 py-1.5 px-3 rounded-md gap-1.5 text-[12px] font-medium tracking-wide text-brand-600 dark:text-brand-400 transition-colors"
            >
              <HiOutlinePencil className="size-3.5" /> {t("parties.edit")}
            </button>
          )}
        </div>

        {/* --- Client Name Row --- */}
        <div className="flex items-center gap-2 mb-1">
          <Link
            to={`/business/${businessId}/clients/${invoice.clientSnapshot.clientId}`}
            className="group inline-block"
          >
            <p className="text-lg font-semibold text-gray-800 dark:text-white uppercase group-hover:text-brand-500 transition-all underline decoration-gray-200 dark:decoration-white/10 underline-offset-4 group-hover:decoration-brand-500">
              {invoice.clientSnapshot.name}
            </p>
          </Link>
          <ClipboardButton text={invoice.clientSnapshot.name} />
        </div>

        {/* --- Email Row --- */}
        {invoice.clientSnapshot.email && (
          <div className="flex items-center gap-2 my-2 group">
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium tracking-wide">
              {invoice.clientSnapshot.email}
            </p>
            <ClipboardButton
              text={invoice.clientSnapshot.email}
              label="Email"
            />
          </div>
        )}

        {/* --- Phone Row --- */}
        {invoice.clientSnapshot.phone?.number &&
          (() => {
            // Logic: Strip all non-numeric characters except '+'
            const cleanPhone = invoice.clientSnapshot.phone.number.replace(
              /[^\d+]/g,
              "",
            );

            // Check if it's actually a full number (more than 4 digits)
            const isActuallyAPhoneNumber = cleanPhone.length > 4;

            if (!isActuallyAPhoneNumber) return null;

            return (
              <div className="flex items-center gap-2 mb-2 group">
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium tracking-wide">
                  {invoice.clientSnapshot.phone.number}
                </p>
                <ClipboardButton
                  text={invoice.clientSnapshot.phone.number}
                  label="Phone"
                />
              </div>
            );
          })()}

        {/* --- Address Row --- */}
        {address?.street && (
          <div className="flex items-start justify-between group mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <div className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
              {address.street}, {address.city}
              <br />
              {address.zipCode}, {address.country}
            </div>
            <ClipboardButton
              text={fullAddress}
              label="Address"
              className="mt-1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
