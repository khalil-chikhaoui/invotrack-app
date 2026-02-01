import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { itemApi, ItemData, ItemPaginationMeta } from "../../apis/items";
import { businessApi, BusinessData } from "../../apis/business";
import { useModal } from "../../hooks/useModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomAlert from "../../components/common/CustomAlert";
import ItemFormModal from "./ItemFormModal";
import StockInjectModal from "./StockInjectModal";
import ItemsTable from "./ItemsTable";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionDenied from "../../components/common/PermissionDenied";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ItemFilters from "../../components/items/ItemFilters";
import { scrollToTopAppLayout } from "../../layout/AppLayout";

export default function Items() {
  const { t } = useTranslation("item");
  const { businessId } = useParams();
  const { canManage, canViewFinancials } = usePermissions();
  const { alert, setAlert } = useAlert();

  // --- STATE ---
  const [items, setItems] = useState<ItemData[]>([]);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [meta, setMeta] = useState<ItemPaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState("name:asc");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(1);

  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modals
  const {
    isOpen: isFormOpen,
    openModal: openFormModal,
    closeModal: closeFormModal,
  } = useModal();
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const {
    isOpen: isStockOpen,
    openModal: openStockModal,
    closeModal: closeStockModal,
  } = useModal();

  const triggerAlert = (data: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }) => {
    setAlert(data);
    scrollToTopAppLayout();
  };

  const fetchData = async () => {
    if (!businessId || !canViewFinancials) return;
    setLoading(true);
    try {
      const [biz, res] = await Promise.all([
        businessApi.getBusiness(businessId),
        itemApi.getItems(businessId, {
          page,
          limit: 10,
          search: searchTerm,
          sort: sortConfig,
          type: typeFilter === "all" ? undefined : (typeFilter as any),
          isArchived: statusFilter === "archived",
        }),
      ]);
      setBusiness(biz);
      setItems(res.items);
      setMeta(res.meta);
    } catch (error: any) {
      triggerAlert({
        type: "error",
        title: t("errors.SYNC_ERROR"),
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(delay);
  }, [
    searchTerm,
    page,
    businessId,
    sortConfig,
    typeFilter,
    statusFilter,
    canViewFinancials,
  ]);

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      const res: any = await itemApi.deleteItem(selectedItem._id);

      // Determine correct translation keys based on backend action
      const titleKey =
        res.action === "ARCHIVED" ? "messages.ARCHIVED" : "messages.DELETED";
      // We assume backend returns a message key like 'ITEM_DELETED' now, or fallback
      // For safety, let's map the backend code or use generic success
      const msgKey =
        res.message === "ITEM_ARCHIVED_HISTORY"
          ? "messages.ITEM_ARCHIVED_HISTORY"
          : "messages.ITEM_DELETED";

      triggerAlert({
        type: res.action === "ARCHIVED" ? "warning" : "success",
        title: t(titleKey),
        message: t(msgKey),
      });
      fetchData();
      closeDeleteModal();
    } catch (error: any) {
      const errorCode = error.message;
      triggerAlert({
        type: "error",
        title: t("errors.FAILED"),
        message: t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")),
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!canViewFinancials) {
    return (
      <PermissionDenied
        title="Inventory Access Restricted" // Consider adding to translation if needed
        description="Your current role does not have permission to view inventory data."
        actionText="Return to Dashboard"
      />
    );
  }

  return (
    <>
      <PageMeta
        description={t("list.meta_desc")}
        title={`${t("list.title")} | Invotrack`}
      />
      <PageBreadcrumb pageTitle={t("list.breadcrumb")} />
      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      {/* --- MASTER UNIFIED CARD --- */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/*  Filters Header */}
        <ItemFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          setPage={setPage}
          loading={loading}
          canManage={canManage}
          onAdd={() => {
            setSelectedItem(null);
            openFormModal();
          }}
          onRefresh={fetchData}
        />

        <ItemsTable
          items={items}
          business={business}
          canManage={canManage}
          meta={meta}
          loading={loading}
          onPageChange={setPage}
          onOpenStock={(item) => {
            setSelectedItem(item);
            openStockModal();
          }}
          onOpenEdit={(item) => {
            setSelectedItem(item);
            openFormModal();
          }}
          onOpenDelete={(item) => {
            setSelectedItem(item);
            openDeleteModal();
          }}
        />
      </div>

      {/* --- MODALS --- */}
      <ItemFormModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        item={selectedItem}
        businessId={businessId!}
        refresh={fetchData}
        setAlert={triggerAlert}
      />
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title={t("modals.delete_title")}
        description={t("modals.delete_desc", { name: selectedItem?.name })}
        variant="danger"
        isLoading={deleting}
      />
      <StockInjectModal
        isOpen={isStockOpen}
        onClose={closeStockModal}
        item={selectedItem}
        refresh={fetchData}
      />
    </>
  );
}
