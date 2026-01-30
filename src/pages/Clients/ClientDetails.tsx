/**
 * @fileoverview ClientDetails Controller
 * Orchestrates client data, financial stats, and lifecycle management.
 * Secured with RBAC.
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";

// APIs & Types
import { clientApi, ClientData } from "../../apis/clients";
import { businessApi, BusinessData } from "../../apis/business";
import {
  invoiceApi,
  InvoiceData,
  DeliveryStatus,
  InvoicePaginationMeta,
  getInvoiceDisplayStatus,
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
import TransactionModals from "../../components/clients/details/TransactionModals";
import ClientAnalyticsTab from "../../components/clients/details/ClientAnalyticsTab";

// UI Components
import PageMeta from "../../components/common/PageMeta";
import CustomAlert from "../../components/common/CustomAlert";
import ClientIdentityModal from "../Clients/ClientIdentityModal";
import ClientAddressModal from "../Clients/ClientAddressModal";
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
  >("analytics");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Transaction State ---
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(
    null,
  );

  const [tempStatus, setTempStatus] = useState<string>("Open");
  const [tempDelivery, setTempDelivery] = useState<DeliveryStatus>("Pending");

  // Loading States
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  // --- Modals ---
  const statusModal = useModal();
  const deliveryModal = useModal();
  const deleteModal = useModal();
  const identityModal = useModal();
  const addressModal = useModal();
  const lifecycleModal = useModal();

  const canGoBack = location.key !== "default" && window.history.length > 1;

  const handleSmartBack = () => {
    if (canGoBack) navigate(-1);
    else navigate(`/business/${businessId}/clients`);
  };

  // ==========================================
  // --- DATA FETCHING (SPLIT) ---
  // ==========================================

  // 1. Fetch Client Profile (Critical)
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
      setAlert({ type: "error", title: "Profile Error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [clientId, businessId, canViewFinancials]);

  // 2. Fetch Invoices with Filters (Non-Critical)
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
          endDate
        };

        const invRes = await invoiceApi.getClientInvoices(clientId, filterParams);
        
        setClientInvoices(invRes.invoices);
        setFinancialStats(invRes.stats);
        setMeta(invRes.meta);
      } catch (error: any) {
        console.error("Invoice history fetch failed:", error);
        // We do NOT set client to null here, so the page stays visible
        setAlert({ 
          type: "error", 
          title: "History Error", 
          message: "Could not load transaction history." 
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
    endDate
  ]);

  // ==========================================
  // --- HANDLERS ---
  // ==========================================

  const handleStatusUpdate = async (payload: {
    status?: string;
    deliveryStatus?: DeliveryStatus;
  }) => {
    if (!selectedInvoice) return;
    setUpdating(true);
    try {
      // 1. Status Logic
      if (payload.status) {
        if (payload.status === "Cancelled") {
          await invoiceApi.deleteInvoice(selectedInvoice._id);
        } else if (payload.status === "Paid") {
          if (!selectedInvoice.isPaid)
            await invoiceApi.togglePayment(selectedInvoice._id);
        } else if (payload.status === "Open") {
          if (selectedInvoice.isDeleted) {
            await invoiceApi.restoreInvoice(selectedInvoice._id);
          } else if (selectedInvoice.isPaid) {
            await invoiceApi.togglePayment(selectedInvoice._id);
          }
        }
      }

      // 2. Delivery Update Logic
      if (payload.deliveryStatus) {
        await invoiceApi.updateInvoice(selectedInvoice._id, {
          deliveryStatus: payload.deliveryStatus,
        });
      }

      setAlert({
        type: "success",
        title: "Success",
        message: "Status updated.",
      });
      setRefreshKey((k) => k + 1);
      statusModal.closeModal();
      deliveryModal.closeModal();
    } catch (e: any) {
      setAlert({ type: "error", title: "Error", message: e.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleLifecycleConfirm = async () => {
    if (!client) return;
    setLifecycleLoading(true);
    try {
      if (client.isArchived) {
        await clientApi.restoreClient(client._id);
        setAlert({
          type: "success",
          title: "Restored",
          message: "Client reactivated.",
        });
      } else {
        await clientApi.deleteClient(client._id);
        setAlert({
          type: "success",
          title: "Archived",
          message: "Client archived.",
        });
      }
      setRefreshKey((k) => k + 1); // Refresh invoices/stats
      fetchProfile(); // Refresh client status
      lifecycleModal.closeModal();
    } catch (error: any) {
      setAlert({ type: "error", title: "Error", message: error.message });
    } finally {
      setLifecycleLoading(false);
    }
  };

  const confirmVoidInvoice = async () => {
    if (!selectedInvoice) return;
    setDeleting(true);
    try {
      await invoiceApi.deleteInvoice(selectedInvoice._id);
      setAlert({
        type: "success",
        title: "Voided",
        message: "Invoice cancelled.",
      });
      setRefreshKey((k) => k + 1);
      deleteModal.closeModal();
    } catch (e: any) {
      setAlert({ type: "error", title: "Error", message: e.message });
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!client) return;
    try {
      await clientApi.restoreClient(client._id);
      setAlert({
        type: "success",
        title: "Restored",
        message: "Client reactivated.",
      });
      fetchProfile();
    } catch (error: any) {
      setAlert({ type: "error", title: "Error", message: error.message });
    }
  };

  const TABS = [
    {
      id: "analytics",
      label: "Analytics",
      icon: <HiOutlineChartPie className="size-5" />,
    },
    {
      id: "profile",
      label: "Profile Overview",
      icon: <HiOutlineUser className="size-5" />,
    },
    {
      id: "history",
      label: "Invoices History",
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


  // ==========================================
  // --- RENDERING ---
  // ==========================================

  if (loading && !client) {
    return (
      <LoadingState message="Opening Client Dossier..." minHeight="60vh" />
    );
  }

  if (!canViewFinancials) {
    return (
      <PermissionDenied
        title="Restricted Access"
        description="You do not have permission to view client details."
        actionText="Return"
      />
    );
  }

  if (!client) {
    return (
      <RecordNotFound
        title="Client Not Found"
        description="The requested client dossier could not be located. It may have been archived or removed."
        actionText="Back"
        onAction={handleSmartBack}
      />
    );
  }

  return (
    <div className="pb-12">
      <PageMeta description="" title={`${client.name} | Details`} />

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

      {/* --- TAB NAVIGATION --- */}
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

      {/* --- TAB CONTENT --- */}
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
            loading={false} // We don't want to show global loading for table updates
            canManage={canManage}
            meta={meta}
            isArchived={client.isArchived}
            businessId={businessId!}
            clientId={clientId!}
            setPage={setPage}
            navigate={navigate}
            onOpenStatus={(inv) => {
              setSelectedInvoice(inv);
              setTempStatus(getInvoiceDisplayStatus(inv));
              statusModal.openModal();
            }}
            onOpenDelivery={(inv) => {
              setSelectedInvoice(inv);
              setTempDelivery(inv.deliveryStatus);
              deliveryModal.openModal();
            }}
            filterProps={{
                searchTerm, setSearchTerm,
                statusFilter, setStatusFilter,
                deliveryFilter, setDeliveryFilter,
                sortConfig, setSortConfig,
                dateRange, setDateRange,
                startDate, setStartDate,
                endDate, setEndDate,
                setPage,
                loading: false, // Local table loading
                canManage: false,
                onAdd: () => {}, 
                onRefresh: () => setRefreshKey(k => k + 1)
            }}
          />
        )}
      </div>

      {/* --- MODALS --- */}
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
        title={client.isArchived ? "Restore Account?" : "Archive Account?"}
        description={
          client.isArchived
            ? "This will restore full access for this client."
            : "This will remove the client from active lists."
        }
        variant={client.isArchived ? "primary" : "danger"}
        confirmText={client.isArchived ? "Restore Client" : "Archive Client"}
        isLoading={lifecycleLoading}
      />

      <TransactionModals
        isStatusOpen={statusModal.isOpen}
        closeStatusModal={statusModal.closeModal}
        tempStatus={tempStatus}
        setTempStatus={setTempStatus}
        handleStatusUpdate={handleStatusUpdate}
        isDeliveryOpen={deliveryModal.isOpen}
        closeDeliveryModal={deliveryModal.closeModal}
        tempDelivery={tempDelivery}
        setTempDelivery={setTempDelivery}
        isDeleteOpen={deleteModal.isOpen}
        closeDeleteModal={deleteModal.closeModal}
        confirmVoidInvoice={confirmVoidInvoice}
        selectedInvoice={selectedInvoice}
        updating={updating}
        deleting={deleting}
      />
    </div>
  );
}