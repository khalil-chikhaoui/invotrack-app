import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

// APIs & Types
import { clientApi, ClientData } from "../../apis/clients";
import { businessApi, BusinessData } from "../../apis/business";
import {
  invoiceApi,
  InvoiceData,
  InvoicePaginationMeta,
} from "../../apis/invoices";

// Hooks & Context
import { useModal } from "../../hooks/useModal";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";

// Sub-Components
import ClientHeader from "../../components/clients/details/ClientHeader";
import ClientIdentityCard from "../../components/clients/details/ClientIdentityCard";
import ClientProfileTab from "../../components/clients/details/ClientProfileTab";
import ClientHistoryTab from "../../components/clients/details/ClientHistoryTab";
import ClientAnalyticsTab from "../../components/clients/details/ClientAnalyticsTab";

// UI Components
import PageMeta from "../../components/common/PageMeta";
import CustomAlert from "../../components/common/CustomAlert";
import ClientIdentityModal from "./ClientIdentityModal";
import ClientAddressModal from "./ClientAddressModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import PermissionDenied from "../../components/common/PermissionDenied";
import {
  HiOutlineChartPie,
  HiOutlineDocumentText,
  HiOutlineUser,
} from "react-icons/hi";
import RecordNotFound from "../../components/common/RecordNotFound";
import LoadingState from "../../components/common/LoadingState";

export default function ClientDetails() {
  const { t } = useTranslation("client_details");
  const { businessId, id: clientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { alert, setAlert } = useAlert();

  const { canManage, canViewFinancials } = usePermissions();

  // --- Core Data State ---
  const [client, setClient] = useState<ClientData | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [clientInvoices, setClientInvoices] = useState<InvoiceData[]>([]);
  const [financialStats, setFinancialStats] = useState({
    lifetimeValue: 0,
    openBalance: 0,
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
    "analytics" | "profile" | "history"
  >("profile");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Loading States
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  // --- Modals ---
  const identityModal = useModal();
  const addressModal = useModal();
  const lifecycleModal = useModal();

  const canGoBack = location.key !== "default" && window.history.length > 1;

  const handleSmartBack = () => {
    if (canGoBack) navigate(-1);
    else navigate(`/business/${businessId}/clients`);
  };

  // 1. Fetch Client Profile
  const fetchProfile = async () => {
    if (!clientId || !businessId || !canViewFinancials) return;

    try {
      const [clientData, bizData] = await Promise.all([
        clientApi.getClientById(clientId),
        businessApi.getBusiness(businessId),
      ]);
      setClient(clientData);
      setBusiness(bizData);
    } catch (error: any) {
      setAlert({
        type: "error",
        title: t("errors.PROFILE_LOAD_FAILED"),
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [clientId, businessId, canViewFinancials]);

  // 2. Fetch Invoices with Filters
  useEffect(() => {
    if (!clientId || !canViewFinancials) return;

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

        const invRes = await invoiceApi.getClientInvoices(
          clientId,
          filterParams,
        );

        setClientInvoices(invRes.invoices);
        setFinancialStats(invRes.stats);
        setMeta(invRes.meta);
      } catch (error: any) {
        console.error("Invoice history fetch failed:", error);
        setAlert({
          type: "error",
          title: t("errors.HISTORY_LOAD_FAILED"),
          message: t("errors.HISTORY_LOAD_DESC"),
        });
      }
    };

    fetchInvoices();
  }, [
    clientId,
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

  const handleLifecycleConfirm = async () => {
    if (!client) return;
    setLifecycleLoading(true);
    try {
      if (client.isArchived) {
        await clientApi.restoreClient(client._id);
        setAlert({
          type: "success",
          title: "Success",
          message: t("messages.CLIENT_RESTORED"),
        });
      } else {
        await clientApi.deleteClient(client._id);
        setAlert({
          type: "success",
          title: "Success",
          message: t("messages.CLIENT_ARCHIVED"),
        });
      }
      setRefreshKey((k) => k + 1);
      fetchProfile();
      lifecycleModal.closeModal();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: t("errors.UPDATE_FAILED"),
        message: error.message,
      });
    } finally {
      setLifecycleLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!client) return;
    try {
      await clientApi.restoreClient(client._id);
      setAlert({
        type: "success",
        title: "Success",
        message: t("messages.CLIENT_RESTORED"),
      });
      fetchProfile();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: t("errors.UPDATE_FAILED"),
        message: error.message,
      });
    }
  };

  const TABS = [
     {
      id: "profile",
      label: t("tabs.profile"),
      icon: <HiOutlineUser className="size-5" />,
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

  if (loading && !client) {
    return <LoadingState message={t("loading")} minHeight="60vh" />;
  }

  if (!canViewFinancials) {
    return (
      <PermissionDenied
        title={t("errors.RESTRICTED_ACCESS")}
        description={t("errors.RESTRICTED_DESC")}
        actionText={t("header.back")}
      />
    );
  }

  if (!client) {
    return (
      <RecordNotFound
        title={t("errors.NOT_FOUND_TITLE")}
        description={t("errors.NOT_FOUND_DESC")}
        actionText={t("header.back")}
        onAction={handleSmartBack}
      />
    );
  }

  return (
    <div className="pb-12">
      <PageMeta description="" title={t("meta_title", { name: client.name })} />

      <ClientHeader
        handleSmartBack={handleSmartBack}
        canGoBack={canGoBack}
        isArchived={client.isArchived}
        canManage={canManage}
        onRestore={handleRestore}
      />
      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <ClientIdentityCard
        client={client}
        canManage={canManage}
        isArchived={client.isArchived}
        onEdit={identityModal.openModal}
        refresh={fetchProfile}
        setAlert={setAlert}
      />

      <div className="flex gap-6 mb-8 overflow-x-auto w-full no-scrollbar px-1">
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

      <div className="min-h-[400px]">
        {activeTab === "profile" && (
          <ClientProfileTab
            client={client}
            canManage={canManage}
            isArchived={client.isArchived}
            onEditAddress={addressModal.openModal}
            onLifecycleAction={lifecycleModal.openModal}
          />
        )}

        {activeTab === "analytics" && (
          <ClientAnalyticsTab
            clientId={clientId!}
            currency={business?.currency}
            refreshKey={refreshKey}
            stats={financialStats}
            business={business}
          />
        )}
 
        {activeTab === "history" && (
          <ClientHistoryTab
            clientInvoices={clientInvoices}
            business={business}
            loading={false}
            canManage={canManage}
            meta={meta}
            isArchived={client.isArchived}
            businessId={businessId!}
            clientId={clientId!}
            setPage={setPage}
            navigate={navigate}
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
      </div>

      <ClientIdentityModal
        isOpen={identityModal.isOpen}
        onClose={identityModal.closeModal}
        client={client}
        businessId={businessId!}
        refresh={fetchProfile}
        setAlert={setAlert}
      />
      <ClientAddressModal
        isOpen={addressModal.isOpen}
        onClose={addressModal.closeModal}
        client={client}
        refresh={fetchProfile}
        setAlert={setAlert}
      />

      <ConfirmModal
        isOpen={lifecycleModal.isOpen}
        onClose={lifecycleModal.closeModal}
        onConfirm={handleLifecycleConfirm}
        title={
          client.isArchived
            ? t("modals.lifecycle.restore_title")
            : t("modals.lifecycle.archive_title")
        }
        description={
          client.isArchived
            ? t("modals.lifecycle.restore_desc")
            : t("modals.lifecycle.archive_desc")
        }
        variant={client.isArchived ? "primary" : "danger"}
        confirmText={
          client.isArchived
            ? t("modals.lifecycle.confirm_restore")
            : t("modals.lifecycle.confirm_archive")
        }
        isLoading={lifecycleLoading}
      />
    </div>
  );
}