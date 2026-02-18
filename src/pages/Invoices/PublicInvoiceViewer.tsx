/**
 * @fileoverview Public Invoice Viewer
 * Zero-click mobile redirection to native PDF viewer.
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { PDFViewer, BlobProvider } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next"; 
import { HiOutlineExclamationTriangle, HiOutlineDocumentArrowDown } from "react-icons/hi2";

// APIs
import { invoiceApi, InvoiceData } from "../../apis/invoices";
import { BusinessData } from "../../apis/business";

// Components
import InvoicePDF from "../../components/invoices/templates/InvoicePDF";
import LoadingState from "../../components/common/LoadingState";

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
        <HiOutlineExclamationTriangle className="w-12 h-12 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {t("public_viewer.error_title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  // --- MOBILE AUTO-VIEWER ---
  if (isMobile) {
    return (
      <BlobProvider document={<InvoicePDF invoice={invoice} business={displayBusiness} />}>
        {({ url, loading: pdfLoading }) => {
          // As soon as the PDF is generated, we redirect the window directly
          if (!pdfLoading && url) {
            window.location.replace(url);
          }

          return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-950 p-8 text-center">
              <div className="relative">
                 <div className="w-24 h-24 bg-brand-500/10 rounded-full flex items-center justify-center animate-pulse">
                    <HiOutlineDocumentArrowDown className="w-10 h-10 text-brand-500" />
                 </div>
                 {/* Decorative Spinner */}
                 <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              
              <h2 className="mt-8 text-xl font-bold text-gray-900 dark:text-white">
                {t("public_viewer.preparing")}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {invoice.invoiceNumber} • {displayBusiness.name}
              </p>
            </div>
          );
        }}
      </BlobProvider>
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