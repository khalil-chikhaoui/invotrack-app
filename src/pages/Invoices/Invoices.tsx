import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import flatpickr from "flatpickr";
import { useTranslation } from "react-i18next";
import {
  invoiceApi,
  InvoiceData,
  InvoicePaginationMeta,
  DeliveryStatus,
} from "../../apis/invoices";
import { businessApi, BusinessData } from "../../apis/business";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CustomAlert from "../../components/common/CustomAlert";
import PermissionDenied from "../../components/common/PermissionDenied";
import { useAlert } from "../../hooks/useAlert";
import InvoiceTable from "./InvoiceTable";
import { usePermissions } from "../../hooks/usePermissions";
import InvoiceFilters from "../../components/invoices/InvoiceFilters";

export default function Invoices() {
  const { t } = useTranslation("invoice");
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { alert, setAlert } = useAlert();
  const { canManage, canViewFinancials } = usePermissions();

  const datePickerRef = useRef<HTMLInputElement>(null);

  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [meta, setMeta] = useState<InvoicePaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Filter & Query States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Paid" | "Unpaid" | "Cancelled" | ""
  >("");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryStatus | "">("");
  const [sortConfig, setSortConfig] = useState("issueDate:desc");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // --- Flatpickr Effect ---
  useEffect(() => {
    if (dateRange === "custom" && datePickerRef.current) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);

      const fp = flatpickr(datePickerRef.current, {
        mode: "range",
        static: true,
        monthSelectorType: "static",
        dateFormat: "M d, Y",
        defaultDate:
          startDate && endDate ? [startDate, endDate] : [sevenDaysAgo, today],
        clickOpens: true,
        prevArrow:
          '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        nextArrow:
          '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        onClose: (selectedDates, _, instance) => {
          if (selectedDates.length === 2) {
            setStartDate(instance.formatDate(selectedDates[0], "Y-m-d"));
            setEndDate(instance.formatDate(selectedDates[1], "Y-m-d"));
          }
        },
      });

      return () => {
        fp.destroy();
      };
    }
  }, [dateRange]);

  const fetchData = async () => {
    if (!businessId || !canViewFinancials) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [invRes, bizRes] = await Promise.all([
        invoiceApi.getInvoices(businessId, {
          page,
          limit: 10,
          search: searchTerm,
          status: statusFilter as any,
          deliveryStatus: deliveryFilter || undefined,
          sort: sortConfig,
          dateRange,
          startDate: dateRange === "custom" ? startDate : undefined,
          endDate: dateRange === "custom" ? endDate : undefined,
        }),
        businessApi.getBusiness(businessId),
      ]);
      setInvoices(invRes.invoices);
      setMeta(invRes.meta);
      setBusiness(bizRes);
    } catch (error: any) {
      const errorCode = error.message;
      setAlert({
        type: "error",
        title: t("errors.SYNC_ERROR"),
        message: t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const d = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(d);
  }, [
    searchTerm,
    statusFilter,
    deliveryFilter,
    page,
    businessId,
    sortConfig,
    dateRange,
    startDate,
    endDate,
    canViewFinancials,
  ]);

  if (!canViewFinancials) {
    return (
      <PermissionDenied
        title={t("errors.ACCESS_RESTRICTED")}
        description={t("errors.ACCESS_RESTRICTED_DESC")}
        actionText={t("common:actions.back", { defaultValue: "Go Back" })}
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

      <div className="flex flex-col h-full   animate-in fade-in slide-in-from-bottom-2 duration-300">
        <InvoiceFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          deliveryFilter={deliveryFilter}
          setDeliveryFilter={setDeliveryFilter}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          dateRange={dateRange}
          setDateRange={setDateRange}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          setPage={setPage}
          loading={loading}
          canManage={canManage}
          onAdd={() => navigate(`/business/${businessId}/invoices/create`)}
          onRefresh={fetchData}
          placeholder={t("filters.search_placeholder")}
        />

        <InvoiceTable
          invoices={invoices}
          business={business}
          canManage={canManage}
          meta={meta}
          loading={loading}
          onPageChange={setPage}
        />
      </div>
    </>
  );
} 
