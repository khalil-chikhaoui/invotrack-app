/**
 * @fileoverview Public Invoice Viewer
 * Allows external users to view/download invoices via a shared link/QR code.
 * Supports style override via query param: ?style=Modern
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { PDFViewer } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next"; 
import { invoiceApi, InvoiceData } from "../../apis/invoices";
import { BusinessData } from "../../apis/business";
import InvoicePDF from "../../components/invoices/templates/InvoicePDF";
import LoadingState from "../../components/common/LoadingState";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

export default function PublicInvoiceViewer() {
  const { t } = useTranslation("invoice"); 
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // 1. Handle Style Override (Existing)
  const styleParam = searchParams.get("style");
  const formattedStyle = styleParam 
    ? styleParam.charAt(0).toUpperCase() + styleParam.slice(1).toLowerCase() 
    : null;
  const isValidStyle = ["Classic", "Modern", "Minimal"].includes(formattedStyle || "");

  // 2. Handle Language Override (New)
  const langParam = searchParams.get("lang")?.toLowerCase(); // e.g., ?lang=fr
  const isValidLang = ["en", "de", "fr"].includes(langParam || "");

  // Create the override object
  return {
    ...business,
    // Override language if valid param exists, otherwise use database value
    language: isValidLang ? langParam : business.language,
    
    invoiceSettings: {
      ...business.invoiceSettings,
      template: isValidStyle && formattedStyle ? formattedStyle : business.invoiceSettings?.template,
    },
  } as BusinessData;
}, [business, searchParams]);


  // 4. Translate Loading State
  if (loading) return <LoadingState message={t("public_viewer.loading")} minHeight="100vh" />;
  
  if (error || !invoice || !displayBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 text-center transition-colors duration-300">
        <div className=" mb-6 animate-in zoom-in duration-300">
            <HiOutlineExclamationTriangle className="w-12 h-12 text-red-500 dark:text-red-400" />
        </div>
        {/* 5. Translate Error Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            {t("public_viewer.error_title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            {error}
        </p>
        <div className="mt-8 h-1 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-900 overflow-hidden">
      <PDFViewer width="100%" height="100%" className="border-none">
        <InvoicePDF invoice={invoice} business={displayBusiness} />
      </PDFViewer>
    </div>
  );
}