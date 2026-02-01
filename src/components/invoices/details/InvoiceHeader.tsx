import { PDFDownloadLink } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import {
  HiOutlineArrowLeft,
  HiOutlinePrinter,
  HiChevronDown,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import InvoicePDF from "../templates/InvoicePDF";
import { InvoiceData } from "../../../apis/invoices";
import { BusinessData } from "../../../apis/business";

interface InvoiceHeaderProps {
  invoice: InvoiceData;
  business: BusinessData;
  canManage: boolean;
  businessId: string | undefined;
  handleSmartBack: () => void;
  isStyleDropdownOpen: boolean;
  setIsStyleDropdownOpen: (v: boolean) => void;
  downloadingStyle: boolean;
  handleDownloadStyle: (style: "Classic" | "Minimal" | "Modern") => void;
}

export default function InvoiceHeader({
  invoice,
  business,
  handleSmartBack,
  isStyleDropdownOpen,
  setIsStyleDropdownOpen,
  downloadingStyle,
  handleDownloadStyle,
}: InvoiceHeaderProps) {
  const { t } = useTranslation("invoice_details");

  return (
    <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
      {/* Return Button */}
      <button
        onClick={handleSmartBack}
        className="flex items-center gap-2 text-[10px] font-semibold uppercase text-gray-600 hover:text-brand-500 dark:text-gray-400 hover:dark:text-brand-400 transition-colors tracking-widest cursor-pointer"
      >
        <HiOutlineArrowLeft className="size-4" /> {t("header.back")}
      </button>

      <div className="flex gap-3 ml-auto">
        {/* Export Group */}
        <div className="flex items-center bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-lg p-1">
          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} business={business} />}
            fileName={`${invoice.invoiceNumber}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <button
                disabled={pdfLoading || downloadingStyle}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-semibold uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <HiOutlinePrinter className="size-4" />{" "}
                {pdfLoading ? t("header.loading_pdf") : t("header.export_pdf")}
              </button>
            )}
          </PDFDownloadLink>

          <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1"></div>

          <div className="relative inline-block">
            <button
              onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
              className={`p-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 transition-colors ${
                isStyleDropdownOpen
                  ? "bg-gray-100 dark:bg-white/10 text-brand-500"
                  : ""
              }`}
            >
              <HiChevronDown className="size-4" />
            </button>
            <Dropdown
              isOpen={isStyleDropdownOpen}
              onClose={() => setIsStyleDropdownOpen(false)}
              className="w-64 p-2 right-0 origin-top-right absolute z-50 mt-2"
            >
              <div className="px-3 py-2 text-[10px] font-semibold uppercase text-gray-400 tracking-widest border-b border-gray-100 dark:border-white/5 mb-1">
                {t("header.export_alt")}
              </div>
              <DropdownItem
                onItemClick={() => handleDownloadStyle("Classic")}
                className="flex flex-col items-start w-full p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 group transition-colors"
              >
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {t("header.styles.classic")}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {t("header.styles.classic_desc")}
                </span>
              </DropdownItem>
              <DropdownItem
                onItemClick={() => handleDownloadStyle("Minimal")}
                className="flex flex-col items-start w-full p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 group transition-colors"
              >
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {t("header.styles.minimal")}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {t("header.styles.minimal_desc")}
                </span>
              </DropdownItem>
              <DropdownItem
                onItemClick={() => handleDownloadStyle("Modern")}
                className="flex flex-col items-start w-full p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 group transition-colors"
              >
                <span className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <HiOutlineSparkles className="size-3 text-brand-500" />{" "}
                  {t("header.styles.modern")}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {t("header.styles.modern_desc")}
                </span>
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
}
