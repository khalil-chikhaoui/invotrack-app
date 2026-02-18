import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { itemApi, ItemData } from "../../apis/items";
import {
  invoiceApi,
  InvoiceData,
  InvoicePaginationMeta,
} from "../../apis/invoices";
import { businessApi, BusinessData } from "../../apis/business";
import { useModal } from "../../hooks/useModal";
import PageMeta from "../../components/common/PageMeta";
import CustomAlert from "../../components/common/CustomAlert";
import PermissionDenied from "../../components/common/PermissionDenied";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";

// Sub-Modals
import ItemFormModal from "../Items/ItemFormModal";
import StockInjectModal from "../Items/StockInjectModal";
import ConfirmModal from "../../components/common/ConfirmModal";

// Presentational Components
import ItemHeader from "../../components/items/details/ItemHeader";
import ItemIdentityCard from "../../components/items/details/ItemIdentityCard";
import ItemGeneralTab from "../../components/items/details/ItemGeneralTab";
import ItemHistoryTab from "../../components/items/details/ItemHistoryTab";
import ItemAnalyticsTab from "../../components/items/details/ItemAnalyticsTab";
import RecordNotFound from "../../components/common/RecordNotFound";
import LoadingState from "../../components/common/LoadingState";
import {
  HiOutlineChartPie,
  HiOutlineCube,
  HiOutlineDocumentText,
} from "react-icons/hi";

export default function ItemDetails() {
  const { t } = useTranslation("item_details");
  const { businessId, id: itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { alert, setAlert } = useAlert();

  const { canManage, canViewFinancials } = usePermissions();

  // --- Core Data State ---
  const [item, setItem] = useState<ItemData | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [itemInvoices, setItemInvoices] = useState<InvoiceData[]>([]);
  const [itemStats, setItemStats] = useState({
    totalRevenue: 0,
    totalSold: 0,
    currentStock: 0,
    avgSalePrice: 0,
    salesVelocity: 0,
  });
  const [meta, setMeta] = useState<InvoicePaginationMeta | null>(null);

  // --- Filter State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [sortConfig, setSortConfig] = useState("issueDate:desc");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // --- UI State ---
  const [activeTab, setActiveTab] = useState<
    "general" | "analytics" | "history"
  >("general");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Lifecycle Action States ---
  const [processingLifecycle, setProcessingLifecycle] = useState(false);

  // --- Modal Control Hooks ---
  const {
    isOpen: isEditOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();
  const {
    isOpen: isStockOpen,
    openModal: openStockModal,
    closeModal: closeStockModal,
  } = useModal();

  // Specific modals
  const lifecycleModal = useModal();

  const canGoBack = location.key !== "default" && window.history.length > 1;

  const handleSmartBack = () => {
    if (canGoBack) navigate(-1);
    else navigate(`/business/${businessId}/items`);
  };

  // 1. Fetch Item Profile
  const fetchProfile = async () => {
    if (!itemId || !businessId || !canViewFinancials) return;

    try {
      const [itemData, bizData] = await Promise.all([
        itemApi.getItemById(itemId),
        businessApi.getBusiness(businessId),
      ]);
      setItem(itemData);
      setBusiness(bizData);
    } catch (error: any) {
      setAlert({
        type: "error",
        title: t("errors.PROFILE_LOAD"),
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [itemId, businessId, canViewFinancials]);

  // 2. Fetch Invoices with Filters
  useEffect(() => {
    if (!itemId || !canViewFinancials) return;

    const fetchInvoices = async () => {
      try {
        const filterParams = {
          page,
          limit: 10,
          search: searchTerm,
          status: statusFilter,
          deliveryStatus: deliveryFilter,
          sort: sortConfig,
          dateRange,
          startDate,
          endDate,
        };

        const invRes = await invoiceApi.getItemInvoices(itemId, filterParams);

        setItemInvoices(invRes.invoices);
        setItemStats(invRes.stats);
        setMeta(invRes.meta);
      } catch (error: any) {
        console.error("Invoice history fetch failed:", error);
        setAlert({
          type: "error",
          title: t("errors.HISTORY_LOAD"),
          message: t("errors.HISTORY_DESC"),
        });
      }
    };

    fetchInvoices();
  }, [
    itemId,
    page,
    refreshKey,
    canViewFinancials,
    searchTerm,
    statusFilter,
    deliveryFilter,
    sortConfig,
    dateRange,
    startDate,
    endDate,
  ]);

  const handleLifecycleAction = () => {
    if (!canManage) return;
    lifecycleModal.openModal();
  };

  const confirmLifecycleChange = async () => {
    if (!item) return;
    setProcessingLifecycle(true);
    try {
      if (item.isArchived) {
        await itemApi.restoreItem(item._id);
        setAlert({
          type: "success",
          title: t("messages.RESTORED"),
          message: t("messages.RESTORED_DESC"),
        });
        fetchProfile();
        lifecycleModal.closeModal();
      } else {
        const res: any = await itemApi.deleteItem(item._id);
        if (res.action === "ARCHIVED") {
          setAlert({
            type: "warning",
            title: t("messages.ARCHIVED"),
            message: res.message,
          });
          fetchProfile();
          lifecycleModal.closeModal();
        } else {
          setAlert({
            type: "success",
            title: t("messages.DELETED"),
            message: t("messages.DELETED_DESC"),
          });
          navigate(`/business/${businessId}/items`);
        }
      }
    } catch (error: any) {
      setAlert({
        type: "error",
        title: t("errors.ACTION_FAILED"),
        message: error.message,
      });
      lifecycleModal.closeModal();
    } finally {
      setProcessingLifecycle(false);
    }
  };

  // Tabs Configuration
  const TABS = [
    {
      id: "general",
      label: t("tabs.general"),
      icon: <HiOutlineCube className="size-5" />,
    },
    {
      id: "analytics",
      label: t("tabs.analytics"),
      icon: <HiOutlineChartPie className="size-5" />,
    },

    {
      id: "history",
      label: t("tabs.history"),
      icon: <HiOutlineDocumentText className="size-5" />,
    },
  ];

  // Scroll Logic
  const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const currentTabElement = tabsRef.current[activeTab];
    if (currentTabElement) {
      currentTabElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeTab]);

  // --- Rendering Gates ---
  if (loading && !item) {
    return <LoadingState message={t("loading")} minHeight="60vh" />;
  }

  if (!canViewFinancials) {
    return (
      <PermissionDenied
        title={t("errors.RESTRICTED_ACCESS")}
        description={t("errors.RESTRICTED_DESC")}
        actionText={t("actions.return")}
      />
    );
  }

  if (!item) {
    return (
      <RecordNotFound
        title={t("errors.NOT_FOUND_TITLE")}
        description={t("errors.NOT_FOUND_DESC")}
        actionText={t("actions.back")}
        onAction={handleSmartBack}
      />
    );
  }

  return (
    <>
      <PageMeta
        title={t("meta_title", { name: item.name })}
        description={t("meta_desc")}
      />

      <ItemHeader
        handleSmartBack={handleSmartBack}
        canGoBack={canGoBack}
        item={item}
        canManage={canManage}
        onOpenStock={openStockModal}
        onRestore={() => lifecycleModal.openModal()}
      />
      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <ItemIdentityCard
        item={item}
        business={business}
        canManage={canManage}
        onEdit={openEditModal}
        refresh={fetchProfile}
        setAlert={setAlert}
      />

      {/* --- TABS --- */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-white/5 mb-8 overflow-x-auto w-full no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabsRef.current[tab.id] = el;
            }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all relative whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? "text-brand-500 dark:text-brand-300"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 dark:bg-brand-300 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "general" ? (
        <ItemGeneralTab
          item={item}
          business={business}
          canManage={canManage}
          onLifecycleAction={handleLifecycleAction}
        />
      ) : activeTab === "analytics" ? (
        <ItemAnalyticsTab
          item={item}
          itemId={itemId!}
          currency={business?.currency}
          refreshKey={refreshKey}
          stats={itemStats}
          business={business}
        />
      ) : (
        <ItemHistoryTab
          invoices={itemInvoices}
          business={business}
          loading={false}
          canManage={canManage}
          meta={meta}
          setPage={setPage}
          filterProps={{
            searchTerm,
            setSearchTerm,
            statusFilter,
            setStatusFilter,
            deliveryFilter,
            setDeliveryFilter,
            sortConfig,
            setSortConfig,
            dateRange,
            setDateRange,
            startDate,
            setStartDate,
            endDate,
            setEndDate,
            setPage,
            loading: false,
            canManage: false,
            onAdd: () => {},
            onRefresh: () => setRefreshKey((k) => k + 1),
          }}
        />
      )}

      {/* --- Modals --- */}
      <ItemFormModal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        item={item}
        businessId={businessId!}
        refresh={fetchProfile}
        setAlert={setAlert}
      />
      <StockInjectModal
        isOpen={isStockOpen}
        onClose={closeStockModal}
        item={item}
        refresh={fetchProfile}
      />

      <ConfirmModal
        isOpen={lifecycleModal.isOpen}
        onClose={lifecycleModal.closeModal}
        onConfirm={confirmLifecycleChange}
        title={
          item.isArchived
            ? t("modals.lifecycle.restore_title")
            : t("modals.lifecycle.archive_title")
        }
        description={
          item.isArchived
            ? t("modals.lifecycle.restore_desc")
            : t("modals.lifecycle.archive_desc")
        }
        variant={item.isArchived ? "warning" : "danger"}
        confirmText={
          item.isArchived
            ? t("modals.lifecycle.confirm_restore")
            : t("modals.lifecycle.confirm_proceed")
        }
        isLoading={processingLifecycle}
      />
    </>
  );
}
