import { useState, useEffect } from "react";
import { useParams } from "react-router";
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

export default function Items() {
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
      setAlert({ type: "error", title: "Sync Error", message: error.message });
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
      setAlert({
        type: res.action === "ARCHIVED" ? "warning" : "success",
        title: res.action === "ARCHIVED" ? "Archived" : "Deleted",
        message: res.message,
      });
      fetchData();
      closeDeleteModal();
    } catch (error: any) {
      setAlert({ type: "error", title: "Failed", message: error.message });
    } finally {
      setDeleting(false);
    }
  };

  if (!canViewFinancials) {
    return (
      <PermissionDenied
        title="Inventory Access Restricted"
        description="Your current role does not have permission to view inventory data."
        actionText="Return to Dashboard"
      />
    );
  }

  return (
    <>
      <PageMeta description="Manage catalog." title="Inventory | Invotrack" />
      <PageBreadcrumb pageTitle="Inventory Management" />
      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      {/* --- MASTER UNIFIED CARD --- */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* 1. Filters Header */}
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

        {/* 2. Table Body (Handles Empty/Loading States Internally) */}
        <ItemsTable
          items={items}
          business={business}
          canManage={canManage}
          meta={meta}
          loading={loading} // Pass loading state
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
        setAlert={setAlert}
      />
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Item"
        description={`Remove ${selectedItem?.name}?`}
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