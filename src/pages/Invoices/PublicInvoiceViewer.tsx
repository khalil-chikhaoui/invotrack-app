/**
 * @fileoverview Public Invoice Viewer
 * Optimized for both Desktop (Inline Viewer) and Mobile (Native Viewer).
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { PDFViewer, BlobProvider } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next"; 
import { 
  HiOutlineExclamationTriangle, 
  HiOutlineDocumentText, 
  HiOutlineArrowTopRightOnSquare 
} from "react-icons/hi2";

// APIs
import { invoiceApi, InvoiceData } from "../../apis/invoices";
import { BusinessData } from "../../apis/business";

// Components
import InvoicePDF from "../../components/invoices/templates/InvoicePDF";
import LoadingState from "../../components/common/LoadingState";
import Button from "../../components/ui/button/Button";

export default function PublicInvoiceViewer() {
  const { t } = useTranslation("invoice"); 
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 

  // --- MOBILE DETECTION ---
  const isMobile = useMemo(() => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const data: any = await invoiceApi.getPublicInvoice(id);
        
        const businessData = data.businessId; 
        const invoiceData = { ...data, businessId: businessData._id };

        setInvoice(invoiceData);
        setBusiness(businessData);
      } catch (err: any) {
        console.error(err);
        if (err.message && err.message.includes("CANCELLED")) {
            setError(t("public_viewer.error_cancelled"));
        } else {
            setError(t("public_viewer.error_not_found"));
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, t]); 

  const displayBusiness = useMemo(() => {
    if (!business) return null;

    const styleParam = searchParams.get("style");
    const formattedStyle = styleParam 
      ? styleParam.charAt(0).toUpperCase() + styleParam.slice(1).toLowerCase() 
      : null;
    const isValidStyle = ["Classic", "Modern", "Minimal", "Receipt"].includes(formattedStyle || "");

    const langParam = searchParams.get("lang")?.toLowerCase();
    const isValidLang = ["en", "de", "fr"].includes(langParam || "");

    return {
      ...business,
      language: isValidLang ? langParam : business.language,
      invoiceSettings: {
        ...business.invoiceSettings,
        template: isValidStyle && formattedStyle ? formattedStyle : business.invoiceSettings?.template,
      },
    } as BusinessData;
  }, [business, searchParams]);

  if (loading) return <LoadingState message={t("public_viewer.loading")} minHeight="100vh" />;
  
  if (error || !invoice || !displayBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <div className="mb-6">
            <HiOutlineExclamationTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            {t("public_viewer.error_title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
            {error}
        </p>
      </div>
    );
  }

  // --- MOBILE RENDER: Landing Card + Native PDF Trigger ---
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-6 text-center">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-white/5 max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <HiOutlineDocumentText className="w-10 h-10 text-brand-500" />
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
            {invoice.invoiceNumber}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            {displayBusiness.name}
          </p>

          <BlobProvider document={<InvoicePDF invoice={invoice} business={displayBusiness} />}>
            {({ url, loading: pdfLoading }) => (
              <Button
                className="w-full py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                onClick={() => url && window.open(url, '_blank')}
                disabled={pdfLoading}
              >
                {pdfLoading ? t("public_viewer.preparing") : t("public_viewer.view_full_pdf")}
                <HiOutlineArrowTopRightOnSquare className="w-5 h-5" />
              </Button>
            )}
          </BlobProvider>
          
          <p className="mt-8 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
            {t("public_viewer.mobile_hint")}
          </p>
        </div>
      </div>
    );
  }

  // --- DESKTOP RENDER: Standard PDFViewer ---
  return (
    <div className="w-screen h-screen bg-gray-900 overflow-hidden">
      <PDFViewer width="100%" height="100%" className="border-none">
        <InvoicePDF invoice={invoice} business={displayBusiness} />
      </PDFViewer>
    </div>
  );
}