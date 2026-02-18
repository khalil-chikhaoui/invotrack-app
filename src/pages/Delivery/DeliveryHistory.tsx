import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

// APIs & Types
import { deliveryApi, DeliveryNoteData } from "../../apis/deliveries";
import { businessApi, BusinessData } from "../../apis/business";
import { InvoicePaginationMeta } from "../../apis/invoices";

// Components
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CustomAlert from "../../components/common/CustomAlert";
import DeliveryFilters from "../../components/delivery/DeliveryFilters";
import DeliveryTable from "../../components/delivery/DeliveryTable";
import ConfirmModal from "../../components/common/ConfirmModal";

// Hooks
import { useAlert } from "../../hooks/useAlert";
import { useModal } from "../../hooks/useModal";

export default function DeliveryHistory() {
  const { t } = useTranslation("delivery");
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { alert, setAlert } = useAlert();

  // --- Modal & Delete State ---
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Data State ---
  const [notes, setNotes] = useState<DeliveryNoteData[]>([]);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [meta, setMeta] = useState<InvoicePaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Filter State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [delRes, bizRes] = await Promise.all([
        deliveryApi.getDeliveryNotes(businessId, {
          page,
          search: searchTerm,
          dateRange,
        }),
        businessApi.getBusiness(businessId),
      ]);

      setNotes(delRes.notes);
      setMeta(delRes.meta);
      setBusiness(bizRes);
    } catch (error) {
      setAlert({
        type: "error",
        title: t("errors.SYNC_ERROR"),
        message: t("errors.GENERIC_ERROR"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(timer);
  }, [searchTerm, dateRange, page, businessId]);

  // 1. Trigger: Open Modal
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    openDeleteModal();
  };

  // 2. Action: Perform Delete
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deliveryApi.deleteDeliveryNote(deleteId);
      setAlert({
        type: "success",
        title: t("messages.success_title"),
        message: t("messages.delete_success"),
      });
      fetchData(); // Refresh list
      closeDeleteModal();
    } catch (e) {
      setAlert({
        type: "error",
        title: t("messages.error_title"),
        message: t("errors.GENERIC_ERROR"),
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageMeta description="" title={`${t("meta.title")} | History`} />
      <PageBreadcrumb pageTitle={t("meta.title")} />
      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="border border-gray-200 dark:border-white/[0.05] rounded-3xl  animate-in fade-in slide-in-from-bottom-2 duration-300">
        <DeliveryFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          setPage={setPage}
          loading={loading}
          onAdd={() => navigate(`/business/${businessId}/delivery/create`)}
          onRefresh={fetchData}
        />
        <DeliveryTable
          notes={notes}
          meta={meta}
          loading={loading}
          onPageChange={setPage}
          onDelete={handleDeleteClick}
          business={business}
        />
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("actions.delete") || "Delete Manifest"}
        description={t("actions.confirm_delete")}
        confirmText={t("actions.delete")}
        variant="danger"
        isLoading={deleting}
      />
    </>
  );
}
