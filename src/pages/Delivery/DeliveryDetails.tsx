import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

// APIs & Types
import { deliveryApi, DeliveryNoteData } from "../../apis/deliveries";
import { businessApi, BusinessData } from "../../apis/business";
import { InvoiceData } from "../../apis/invoices";

// Components
import PageMeta from "../../components/common/PageMeta";
import CustomAlert from "../../components/common/CustomAlert";
import LoadingState from "../../components/common/LoadingState";
import ConfirmModal from "../../components/common/ConfirmModal";
import RecordNotFound from "../../components/common/RecordNotFound"; // Import this
import DeliveryDetailsHeader from "../../components/delivery/details/DeliveryDetailsHeader";
import DeliveryIdentityCard from "../../components/delivery/details/DeliveryIdentityCard";
import DeliveryInvoiceList from "../../components/delivery/details/DeliveryInvoiceList";

// Hooks
import { useAlert } from "../../hooks/useAlert";
import { useModal } from "../../hooks/useModal";

export default function DeliveryDetails() {
  const { t } = useTranslation("delivery");
  const { businessId, id } = useParams();
  const navigate = useNavigate();
  const { alert, setAlert } = useAlert();

  // --- State ---
  const [note, setNote] = useState<DeliveryNoteData | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Modals State ---
  const deleteManifestModal = useModal();
  const removeInvoiceModal = useModal();

  const [deleting, setDeleting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [targetInvoiceId, setTargetInvoiceId] = useState<string | null>(null);

  const targetInvoice = useMemo(() => {
    if (!note || !targetInvoiceId) return null;
    return (note.invoices as InvoiceData[]).find(
      (inv) => inv._id === targetInvoiceId,
    );
  }, [note, targetInvoiceId]);

  // 2. Determine the message
  const removeDescription =
    targetInvoice?.deliveryStatus === "Shipped"
      ? t("list.confirm_remove_shipped")
      : t("list.confirm_remove_generic");

  // --- Fetch Data ---
  const fetchData = async () => {
    if (!id || !businessId) return;
    setLoading(true);
    try {
      const [noteRes, bizRes] = await Promise.all([
        deliveryApi.getDeliveryNoteById(id),
        businessApi.getBusiness(businessId),
      ]);
      setNote(noteRes);
      setBusiness(bizRes);
    } catch (error) {
      setAlert({
        type: "error",
        title: t("errors.SYNC_ERROR") || "Sync Error",
        message: t("errors.GENERIC_ERROR") || "Failed to load details.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, businessId]);

  // --- Actions ---

  // 1. Delete Entire Manifest
  const handleDeleteManifest = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deliveryApi.deleteDeliveryNote(id);
      setAlert({
        type: "success",
        title: t("messages.success_title"),
        message: t("messages.delete_success"),
      });
      setTimeout(() => navigate(`/business/${businessId}/delivery`), 1000);
    } catch (e: any) {
      setAlert({
        type: "error",
        title: t("messages.error_title"),
        message: e.message || t("errors.GENERIC_ERROR"),
      });
      setDeleting(false);
      deleteManifestModal.closeModal();
    }
  };

  // 2. Remove Single Invoice
  const handleRemoveInvoiceClick = (invId: string) => {
    setTargetInvoiceId(invId);
    removeInvoiceModal.openModal();
  };

  const confirmRemoveInvoice = async () => {
    if (!id || !targetInvoiceId || !targetInvoice) return;

    setRemoving(true);
    try {
      await deliveryApi.removeInvoiceFromDelivery(id, targetInvoiceId);

      const successMessage =
        targetInvoice.deliveryStatus === "Shipped"
          ? t("messages.invoice_removed")
          : t("messages.invoice_removed_generic");

      setAlert({
        type: "success",
        title: t("messages.success_title"),
        message: successMessage,
      });

      fetchData(); // Refresh the list
      removeInvoiceModal.closeModal();
    } catch (e: any) {
      setAlert({
        type: "error",
        title: t("messages.error_title"),
        message: e.message || "Failed to remove invoice.",
      });
    } finally {
      setRemoving(false);
    }
  };

  // 3. Reprint
  const handleReprint = () => {
    if (!note || !business) return;
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/delivery/${note._id}/view?lang=${business.language || "en"}`;
    window.open(url, "_blank");
  };

  // --- Derived Data ---
  const totalValue = useMemo(() => {
    if (!note) return 0;
    return (note.invoices as InvoiceData[]).reduce(
      (sum, inv) => sum + (inv.grandTotal || 0),
      0,
    );
  }, [note]);

  const handleSaveNotes = async (newNotes: string) => {
    if (!note || !id) return;
    try {
      // 1. Call API
      const updatedNote = await deliveryApi.updateDeliveryNote(id, {
        notes: newNotes,
      });

      // 2. Update Local State
      setNote((prev) => (prev ? { ...prev, notes: updatedNote.notes } : null));

      // 3. Success Alert
      setAlert({
        type: "success",
        title: t("messages.success_title"),
        message: t("messages.notes_updated") || "Notes updated successfully",
      });
    } catch (e: any) {
      setAlert({
        type: "error",
        title: t("messages.error_title"),
        message: e.message || "Failed to save notes",
      });
      throw e;
    }
  };

  // --- RENDER STATES ---
  if (loading) return <LoadingState minHeight="80vh" />;

  // NOT FOUND STATE
  if (!note || !business || !businessId) {
    return (
      <RecordNotFound
        title={t("errors.NOT_FOUND_TITLE") || "Manifest Not Found"}
        description={
          t("errors.NOT_FOUND_DESC") ||
          "The delivery note you are looking for does not exist or has been deleted."
        }
        actionText={t("back") || "Back"}
        onAction={() => navigate(-1)}
      />
    );
  }

  return (
    <>
      <PageMeta
        description=""
        title={`${t("meta.title")} | ${note.deliveryNumber}`}
      />

      <div className="mx-auto w-full ">
        <CustomAlert data={alert} onClose={() => setAlert(null)} />

        {/* 1. Header Actions */}
        <DeliveryDetailsHeader
          onReprint={handleReprint}
          onDelete={deleteManifestModal.openModal}
        />

        {/* 2. Identity Card */}
        <DeliveryIdentityCard
          note={note}
          business={business}
          totalValue={totalValue}
          onSaveNotes={handleSaveNotes}
        />

        {/* 3. Invoice List */}
        <DeliveryInvoiceList
          invoices={note.invoices as InvoiceData[]}
          business={business}
          businessId={businessId}
          onRemoveInvoice={handleRemoveInvoiceClick}
        />

        {/* --- MODALS --- */}
        <ConfirmModal
          isOpen={deleteManifestModal.isOpen}
          onClose={deleteManifestModal.closeModal}
          onConfirm={handleDeleteManifest}
          title={t("actions.delete") || "Delete Manifest"}
          description={
            t("actions.confirm_delete") ||
            "Are you sure? This will revert all shipped invoices to pending."
          }
          confirmText={t("actions.delete")}
          variant="danger"
          isLoading={deleting}
        />

        <ConfirmModal
          isOpen={removeInvoiceModal.isOpen}
          onClose={removeInvoiceModal.closeModal}
          onConfirm={confirmRemoveInvoice}
          title={t("list.remove_hint_invoice")}
          description={removeDescription}
          confirmText={t("actions.remove")}
          variant="danger"
          isLoading={removing}
        />
      </div>
    </>
  );
}
