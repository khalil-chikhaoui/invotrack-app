import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
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
import ClientFormModal from "./ClientFormModal";
import ClientsTable from "./ClientTable";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionDenied from "../../components/common/PermissionDenied";
import ClientFilters from "../../components/clients/ClientFilters";
import { scrollToTopAppLayout } from "../../layout/AppLayout";

export default function Clients() {
  const { t } = useTranslation("client");
  const { businessId } = useParams();
  const navigate = useNavigate();

  const { canManage, canViewFinancials } = usePermissions();

  const [clients, setClients] = useState<ClientData[]>([]);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [meta, setMeta] = useState<ClientPaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState("name:asc");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const {
    isOpen: isFormOpen,
    openModal: openFormModal,
    closeModal: closeFormModal,
  } = useModal();

  /**
   * WRAPPER FUNCTION for Alerts
   */
  const triggerAlert = (data: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }) => {
    setAlert(data);
    scrollToTopAppLayout();
  };

  const fetchClients = async () => {
    if (!businessId || !canViewFinancials) return;
    setLoading(true);
    try {
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
      setBusiness(businessRes);
    } catch (error: any) {
      const errorCode = error.message;
      triggerAlert({
        type: "error",
        title: t("errors.GENERIC_ERROR"),
        message: t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")),
      });
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
        title={t("errors.UNAUTHORIZED_ACCESS", {
          defaultValue: "Restricted Access",
        })}
        description={t("errors.UNAUTHORIZED_ACCESS_DESC", {
          defaultValue:
            "Your current role does not have permission to view the client directory.",
        })}
        actionText={t("common:actions.return_dashboard", {
          defaultValue: "Return to Dashboard",
        })}
      />
    );
  }

  return (
    <>
      <PageMeta
        title={`${t("list.title")} | Invotrack`}
        description={t("list.meta_desc")}
      />
      <PageBreadcrumb pageTitle={t("list.breadcrumb")} />
      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      {/* THE UNIFIED MASTER CARD */}
      <div className=" border border-gray-200 dark:border-white/[0.05] rounded-2xl  overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* 1. Header Section */}
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

        {/* 2. Data Section (Handles Loading & Empty States internally) */}
        <ClientsTable
          clients={clients}
          business={business}
          meta={meta}
          loading={loading}
          onPageChange={(p) => setPage(p)}
          onView={handleViewClient}
        />
      </div>

      <ClientFormModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        businessId={businessId!}
        setAlert={triggerAlert}
        // Prioritize phone country, fall back to address country, fall back to US
        defaultCountry={
          (business?.phoneNumber as any)?.country ||
          business?.address?.country ||
          "US"
        }
      />
    </>
  );
}
