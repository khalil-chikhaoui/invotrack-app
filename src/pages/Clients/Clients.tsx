import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  clientApi,
  ClientData,
  ClientPaginationMeta,
} from "../../apis/clients";
import { businessApi, BusinessData } from "../../apis/business";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useModal } from "../../hooks/useModal";
import CustomAlert from "../../components/common/CustomAlert";
import Button from "../../components/ui/button/Button";
import { HiOutlineUsers } from "react-icons/hi2";
import ClientFormModal from "./ClientFormModal";
import ClientsTable from "./ClientTable";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionDenied from "../../components/common/PermissionDenied";
import ClientFilters from "../../components/clients/ClientFilters";
import LoadingState from "../../components/common/LoadingState";

export default function Clients() {
  const { businessId } = useParams();
  const navigate = useNavigate();

  const { canManage, canViewFinancials } = usePermissions();

  // --- State Management ---
  const [clients, setClients] = useState<ClientData[]>([]);
  // 2. Add Business State
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [meta, setMeta] = useState<ClientPaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters ... (Keep existing filters state)
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState("name:asc");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  // --- Modals ---
  const {
    isOpen: isFormOpen,
    openModal: openFormModal,
    closeModal: closeFormModal,
  } = useModal();

  /**
   * Data Fetching Logic
   */
  const fetchClients = async () => {
    if (!businessId || !canViewFinancials) return;
    setLoading(true);
    try {
      // 3. Fetch Clients AND Business Data in parallel
      const [clientsRes, businessRes] = await Promise.all([
        clientApi.getClients(businessId, {
          page,
          limit: 10,
          search: searchTerm,
          sort: sortConfig,
          clientType: typeFilter === "all" ? undefined : (typeFilter as any),
          isArchived: statusFilter === "archived" ? true : false,
        } as any),
        businessApi.getBusiness(businessId),
      ]);

      setClients(clientsRes.clients);
      setMeta(clientsRes.meta);
      setBusiness(businessRes); // Save business data
    } catch (error: any) {
      setAlert({ type: "error", title: "Error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchClients(), 400);
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

  const handleViewClient = (client: ClientData) =>
    navigate(`/business/${businessId}/clients/${client._id}`);
  const handleAdd = () => {
    openFormModal();
  };

  if (!canViewFinancials) {
    return (
      <PermissionDenied
        title="Restricted Access"
        description="Your current role (Deliver) does not have permission to view the client directory."
        actionText="Return to Dashboard"
      />
    );
  }

  return (
    <>
      <PageMeta
        title="Clients | Invotrack"
        description="Manage your customers."
      />
      <PageBreadcrumb pageTitle="Client Directory" />
      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="space-y-6">
        <ClientFilters
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
          onAdd={handleAdd}
          onRefresh={fetchClients}
        />

        {/* --- CONDITIONAL RENDERING --- */}
        {loading ? (
          <div className="py-20">
            <LoadingState
              message="Fetching Client Registry..."
              minHeight="300px"
            />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-2xl text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <HiOutlineUsers className="size-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              No Clients Found
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
              {searchTerm
                ? `No results for "${searchTerm}". Try adjusting your filters.`
                : "Your client directory is currently empty. Add a client to get started."}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="uppercase tracking-widest text-[10px] font-bold"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <ClientsTable
            clients={clients}
            business={business}
            meta={meta}
            onPageChange={(p) => setPage(p)}
            onView={handleViewClient}
          />
        )}
      </div>

      <ClientFormModal
        isOpen={isFormOpen} 
        onClose={closeFormModal}
        businessId={businessId!}
        setAlert={setAlert}
      />
    </>
  ); 
}
