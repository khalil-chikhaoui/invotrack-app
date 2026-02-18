/**
 * @fileoverview Public Delivery Note Viewer
 * Optimized for Mobile Auto-Redirect and Desktop Inline Viewing.
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { PDFViewer, BlobProvider } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import { HiOutlineExclamationTriangle, HiOutlineDocumentArrowDown } from "react-icons/hi2";

// APIs
import { deliveryApi, DeliveryNoteData } from "../../apis/deliveries";
import { BusinessData } from "../../apis/business";
import { InvoiceData } from "../../apis/invoices";

// Components
import DeliveryNotePDF from "../../components/delivery/DeliveryNotePDF";
import LoadingState from "../../components/common/LoadingState";

export default function PublicDeliveryNoteViewer() {
  const { t } = useTranslation("delivery");
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [note, setNote] = useState<DeliveryNoteData | null>(null);
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
        const noteData = await deliveryApi.getDeliveryNoteById(id);
        setNote(noteData);
        setBusiness(noteData.businessId as unknown as BusinessData);
      } catch (err: any) {
        console.error(err);
        setError(t("public_viewer.error_not_found"));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, t]);

  const displayBusiness = useMemo(() => {
    if (!business) return null;
    const langParam = searchParams.get("lang")?.toLowerCase();
    const isValidLang = ["en", "de", "fr"].includes(langParam || "");

    return {
      ...business,
      language: isValidLang ? langParam : business.language,
    } as BusinessData;
  }, [business, searchParams]);

  if (loading) return <LoadingState message={t("public_viewer.loading")} minHeight="100vh" />;

  if (error || !note || !displayBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <HiOutlineExclamationTriangle className="w-12 h-12 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t("public_viewer.error_title") || "Error"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  const invoices = note.invoices as InvoiceData[];
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const pdfDocument = (
    <DeliveryNotePDF
      invoices={invoices}
      business={displayBusiness}
      deliveryNumber={note.deliveryNumber}
      createdDate={note.createdAt}
      notes={note.notes}
      baseUrl={baseUrl}
    />
  );

  // --- MOBILE AUTO-REDIRECT ---
  if (isMobile) {
    return (
      <BlobProvider document={pdfDocument}>
        {({ url, loading: pdfLoading }) => {
          // Redirect to native viewer as soon as ready
          if (!pdfLoading && url) {
            window.location.replace(url);
          }
          return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-950 p-8 text-center">
              <div className="relative">
                <div className="w-24 h-24 bg-brand-500/10 rounded-full flex items-center justify-center animate-pulse">
                  <HiOutlineDocumentArrowDown className="w-10 h-10 text-brand-500" />
                </div>
                <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="mt-8 text-xl font-bold text-gray-900 dark:text-white">
                {t("public_viewer.preparing")}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {note.deliveryNumber} • {displayBusiness.name}
              </p>
            </div>
          );
        }}
      </BlobProvider>
    );
  }

  // --- DESKTOP RENDER ---
  return (
    <div className="w-screen h-screen bg-gray-900 overflow-hidden">
      <PDFViewer width="100%" height="100%" className="border-none">
        {pdfDocument}
      </PDFViewer>
    </div>
  );
}