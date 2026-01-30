import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import flatpickr from "flatpickr";
import {
  invoiceApi,
  InvoiceData,
  InvoicePaginationMeta,
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
  getInvoiceDisplayStatus,
} from "../../apis/invoices";
import { businessApi, BusinessData } from "../../apis/business";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useModal } from "../../hooks/useModal";
import CustomAlert from "../../components/common/CustomAlert";
import PermissionDenied from "../../components/common/PermissionDenied";
import { useAlert } from "../../hooks/useAlert";
import InvoiceTable from "./InvoiceTable";
import { usePermissions } from "../../hooks/usePermissions";
import InvoiceFilters from "../../components/invoices/InvoiceFilters";
import LoadingState from "../../components/common/LoadingState";
// Import the new reusable component
import StatusUpdateModal from "../../components/common/StatusUpdateModal";

const PAYMENT_STATES = ["Open", "Paid", "Cancelled"];

export default function Invoices() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { alert, setAlert } = useAlert();
  const { canManage, canViewFinancials } = usePermissions();

  // Ref for the flatpickr input
  const datePickerRef = useRef<HTMLInputElement>(null);

  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [meta, setMeta] = useState<InvoicePaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Filter & Query States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Paid" | "Unpaid" | "Cancelled" | "">("");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryStatus | "">("");
  const [sortConfig, setSortConfig] = useState("issueDate:desc");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>("Open");
  const [targetDelivery, setTargetDelivery] = useState<DeliveryStatus>("Pending");
  const [updating, setUpdating] = useState(false);

  const statusModal = useModal();
  const deliveryModal = useModal();

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
        defaultDate: startDate && endDate ? [startDate, endDate] : [sevenDaysAgo, today],
        clickOpens: true,
        prevArrow: '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        nextArrow: '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
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
      setAlert({ type: "error", title: "Sync Error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const d = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(d);
  }, [searchTerm, statusFilter, deliveryFilter, page, businessId, sortConfig, dateRange, startDate, endDate, canViewFinancials]);

  const handleUpdate = async (type: "status" | "delivery") => {
    if (!selectedInvoice) return;
    setUpdating(true);
    try {
      if (type === "status") {
        if (targetStatus === "Cancelled") {
          await invoiceApi.deleteInvoice(selectedInvoice._id);
        } else if (targetStatus === "Paid") {
          if (!selectedInvoice.isPaid) await invoiceApi.togglePayment(selectedInvoice._id);
        } else if (targetStatus === "Open") {
          if (selectedInvoice.isDeleted) {
            await invoiceApi.restoreInvoice(selectedInvoice._id);
          } else if (selectedInvoice.isPaid) {
            await invoiceApi.togglePayment(selectedInvoice._id);
          }
        }
      } else {
        await invoiceApi.updateInvoice(selectedInvoice._id, {
          deliveryStatus: targetDelivery,
        });
      }

      setAlert({ type: "success", title: "Updated", message: "Ledger status synced." });
      fetchData();
      statusModal.closeModal();
      deliveryModal.closeModal();
    } catch (e: any) {
      setAlert({ type: "error", title: "Update Failed", message: e.message });
    } finally {
      setUpdating(false);
    }
  };

  if (!canViewFinancials) {
    return (
      <PermissionDenied
        title="Access Restricted"
        description="No permission to view invoices."
        actionText="Go Back"
      />
    );
  }

  return (
    <>
      <PageMeta description="Manage business billing and invoices" title="Invoices | Invotrack" />
      <PageBreadcrumb pageTitle="Billing & Invoices" />
      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="space-y-4">
        <InvoiceFilters
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          deliveryFilter={deliveryFilter} setDeliveryFilter={setDeliveryFilter}
          sortConfig={sortConfig} setSortConfig={setSortConfig}
          dateRange={dateRange} setDateRange={setDateRange}
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
          setPage={setPage} loading={loading} canManage={canManage}
          onAdd={() => navigate(`/business/${businessId}/invoices/create`)}
          onRefresh={fetchData}
        />

        {loading && invoices.length === 0 ? (
          <div className="py-20 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-2xl">
            <LoadingState message="Syncing Invoice Registry..." minHeight="100px" />
          </div>
        ) : (
          <InvoiceTable
            invoices={invoices}
            business={business}
            canManage={canManage}
            meta={meta}
            onPageChange={setPage}
            onOpenStatus={(inv) => {
              setSelectedInvoice(inv);
              setTargetStatus(getInvoiceDisplayStatus(inv));
              statusModal.openModal();
            }}
            onOpenDelivery={(inv) => {
              setSelectedInvoice(inv);
              setTargetDelivery(inv.deliveryStatus);
              deliveryModal.openModal();
            }}
          />
        )}
      </div>

      {/* 1. Payment Status */}
      <StatusUpdateModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.closeModal}
        title="Payment Status"
        type="payment"
        options={PAYMENT_STATES}
        currentValue={targetStatus}
        onValueChange={setTargetStatus}
        onConfirm={() => handleUpdate("status")}
        isLoading={updating}
        confirmLabel={targetStatus === "Cancelled" ? "Confirm Void" : "Update"}
      />

      {/* 2. Logistics/Delivery Status */}
      <StatusUpdateModal
        isOpen={deliveryModal.isOpen}
        onClose={deliveryModal.closeModal}
        title="Logistics Tracker"
        type="delivery"
        options={DELIVERY_STATUS_OPTIONS}
        currentValue={targetDelivery}
        onValueChange={(val) => setTargetDelivery(val)}
        onConfirm={() => handleUpdate("delivery")}
        isLoading={updating}
        confirmLabel="Update"
      />
    </>
  );
}