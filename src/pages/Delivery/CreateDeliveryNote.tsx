import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { useLocation, useNavigate, useParams } from "react-router";

// --- Components ---
import PageMeta from "../../components/common/PageMeta";
import CustomAlert from "../../components/common/CustomAlert";
import CreateDeliveryHeader from "../../components/delivery/CreateDeliveryHeader";
import ManifestNotesInput from "../../components/delivery/ManifestNotesInput";
import ManifestPreviewList from "../../components/delivery/ManifestPreviewList";

// --- Context & Hooks ---
import { useAlert } from "../../hooks/useAlert";
import { scrollToTopAppLayout } from "../../layout/AppLayout";

// --- APIs ---
import { invoiceApi, InvoiceData } from "../../apis/invoices";
import { businessApi, BusinessData } from "../../apis/business";

export default function CreateDeliveryNote() {
  const { t } = useTranslation("delivery");
  const { businessId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- UI Feedback State ---
  const { alert, setAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Data State ---
  const [candidates, setCandidates] = useState<InvoiceData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedInvoicesCache, setSelectedInvoicesCache] = useState<
    InvoiceData[]
  >([]);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [manifestNotes, setManifestNotes] = useState("");

  const triggerAlert = (data: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }) => {
    setAlert(data);
    scrollToTopAppLayout();
  };

  // --- Initialization ---
  const initData = async (showLoading = true) => {
    if (!businessId) return;
    if (showLoading) setLoading(true);
    try {
      const [candidatesData, businessData] = await Promise.all([
        invoiceApi.getDeliveryCandidates(businessId, ""),
        businessApi.getBusiness(businessId),
      ]);
      setCandidates(candidatesData);
      setBusiness(businessData);
    } catch (err) {
      console.error("Initialization Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, [businessId]);

  const fetchCandidates = async (search = "") => {
    if (!businessId) return;
    try {
      const data = await invoiceApi.getDeliveryCandidates(businessId, search);
      setCandidates(data);
    } catch (err) {
      console.error("Search Error:", err);
    }
  };

  // --- Handlers ---
  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
    const newItems = candidates.filter((c) => ids.includes(c._id));
    setSelectedInvoicesCache((prev) => {
      const combined = [...prev, ...newItems];
      return Array.from(
        new Map(combined.map((item) => [item._id, item])).values(),
      );
    });
  };

  const selectedList = useMemo(() => {
    return selectedInvoicesCache.filter((i) => selectedIds.includes(i._id));
  }, [selectedInvoicesCache, selectedIds]);

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleGenerateAndShip = async () => {
    if (selectedIds.length === 0 || !businessId) return;
    setIsUpdating(true);
    setAlert(null);

    try {
      // 1. Call API and expect it to return the new Manifest/Note object
      const response: any = await invoiceApi.batchUpdateStatus(
        selectedIds,
        "Shipped",
        businessId,
        manifestNotes,
      );

      // 2. Optimistic UI Update (Visual feedback for "Shipped" status)
      setSelectedInvoicesCache((prev) =>
        prev.map((inv) =>
          selectedIds.includes(inv._id)
            ? { ...inv, deliveryStatus: "Shipped" }
            : inv,
        ),
      );

      triggerAlert({
        type: "success",
        title: t("messages.success_title"),
        message: t("messages.manifest_shipped"),
      });

      // 3. OPEN THE NEW TAB
      const newNoteId = response?.note?._id || response?._id;

      if (newNoteId) {
        const baseUrl = window.location.origin;
        const lang = business?.language || "en";
        const url = `${baseUrl}/delivery/${newNoteId}/view?lang=${lang}`;
        window.open(url, "_blank");
      }

      // 4. Cleanup & Reset (Short delay to let the UI settle)
      setTimeout(async () => {
        setSelectedIds([]);
        setSelectedInvoicesCache([]);
        setManifestNotes("");
        await initData(false);
      }, 1000);
    } catch (error: any) {
      triggerAlert({
        type: "error",
        title: t("messages.error_title"),
        message: error.message || "Failed to update delivery status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const canGoBack = location.key !== "default" && window.history.length > 1;

  return (
    <>
      <PageMeta title={t("meta.title")} description={t("meta.description")} />

      {canGoBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center mt-4 gap-2 text-[10px] font-semibold uppercase text-gray-600 hover:text-brand-500 dark:text-gray-400 hover:dark:text-brand-400 transition-colors tracking-widest cursor-pointer"
        >
          <HiOutlineArrowLeft className="size-4" />
          {t("back")}
        </button>
      )}

      <div className="mx-auto w-full space-y-6 mt-8 px-4 md:px-2">
        <CustomAlert data={alert} onClose={() => setAlert(null)} />

        <div className="rounded-3xl p-6 border border-gray-200 dark:border-white/5 ">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <CreateDeliveryHeader
              candidates={candidates}
              selectedIds={selectedIds}
              selectedInvoicesCache={selectedInvoicesCache}
              loading={loading}
              isUpdating={isUpdating}
              onSelectionChange={handleSelectionChange}
              onSearch={fetchCandidates}
            />

            <ManifestNotesInput
              manifestNotes={manifestNotes}
              setManifestNotes={setManifestNotes}
              selectedList={selectedList}
              business={business}
              isUpdating={isUpdating}
              onGenerate={handleGenerateAndShip}
              onReset={() => {
                setSelectedIds([]);
                setSelectedInvoicesCache([]);
                setManifestNotes("");
              }}
            />
          </div>
        </div>

        <ManifestPreviewList
          selectedList={selectedList}
          business={business}
          onRemove={handleRemove}
        />
      </div>
    </>
  );
}
