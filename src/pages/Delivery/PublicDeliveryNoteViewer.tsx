/**
 * @fileoverview Public Delivery Note Viewer
 * Allows viewing the Manifest/BL in a dedicated full-screen tab.
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { PDFViewer } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

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

  // Handle overrides (Language, etc.) if needed in the future
  const displayBusiness = useMemo(() => {
    if (!business) return null;

    // Optional: Language Override via URL ?lang=fr
    const langParam = searchParams.get("lang")?.toLowerCase();
    const isValidLang = ["en", "de", "fr"].includes(langParam || "");

    return {
      ...business,
      language: isValidLang ? langParam : business.language,
    } as BusinessData;
  }, [business, searchParams]);

  if (loading)
    return (
      <LoadingState
        message={t("public_viewer.loading") || "Loading PDF..."}
        minHeight="100vh"
      />
    );

  if (error || !note || !displayBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <div className="mb-6">
          <HiOutlineExclamationTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t("public_viewer.error_title") || "Error"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
          {error}
        </p>
      </div>
    );
  }

  const invoices = note.invoices as InvoiceData[];

  return (
    <div className="w-screen h-screen bg-gray-900 overflow-hidden">
      <PDFViewer width="100%" height="100%" className="border-none">
        <DeliveryNotePDF
          invoices={invoices}
          business={displayBusiness}
          user={{ name: "System", email: "" }}
          deliveryNumber={note.deliveryNumber}
          createdDate={note.createdAt}
          notes={note.notes}
        />
      </PDFViewer>
    </div>
  );
}
