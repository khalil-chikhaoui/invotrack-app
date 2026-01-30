import { useState, useEffect, useRef } from "react"; // 1. Added useRef
import { useParams, useNavigate, useLocation } from "react-router";
import { pdf } from "@react-pdf/renderer";
import {
  invoiceApi,
  InvoiceData,
  DeliveryStatus,
  getInvoiceDisplayStatus,
} from "../../apis/invoices";
import { itemApi, ItemData } from "../../apis/items";
import { businessApi, BusinessData } from "../../apis/business";
import { useModal } from "../../hooks/useModal";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";
import PageMeta from "../../components/common/PageMeta";
import CustomAlert from "../../components/common/CustomAlert";
import PermissionDenied from "../../components/common/PermissionDenied";
import InvoicePDF from "../../components/invoices/templates/InvoicePDF";
import { DEFAULT_COLORS } from "../Business/InvoiceSettings";
import InvoiceIdentityCard from "../../components/invoices/details/InvoiceIdentityCard";
import InvoiceParties from "../../components/invoices/details/InvoiceParties";
import InvoiceLedger from "../../components/invoices/details/InvoiceLedger";
import InvoiceSidebar from "../../components/invoices/details/InvoiceSidebar";
import InvoiceModals from "../../components/invoices/details/InvoiceModals";
import InvoiceHeader from "../../components/invoices/details/InvoiceHeader";
import EditClientModal from "../../components/invoices/details/EditClientModal";
import EditItemModal from "../../components/invoices/details/EditItemModal";
import InvoiceStatsTab from "../../components/invoices/InvoiceStatsTab";
import RecordNotFound from "../../components/common/RecordNotFound";
import EditDatesModal from "../../components/invoices/details/EditDatesModal";
import ItemFormModal from "../Items/ItemFormModal";
import EditTaxDiscountModal from "../../components/invoices/details/EditTaxDiscountModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import LoadingState from "../../components/common/LoadingState";
import { HiOutlineChartPie, HiOutlineDocumentText } from "react-icons/hi";

export default function InvoiceDetails() {
  const { businessId, id: invoiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { canManage, canViewFinancials } = usePermissions();
  const { alert, setAlert } = useAlert();

  // --- Data State ---
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [availableItems, setAvailableItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- Tab State & Configuration ---
  const [activeTab, setActiveTab] = useState<"general" | "stats">("general");

  // Define the tabs configuration here
 const TABS = [
    { 
      id: "general", 
      label: "General Information",
      icon: <HiOutlineDocumentText  className="size-5" />
    },
    { 
      id: "stats", 
      label: "Performance Stats",
      icon: <HiOutlineChartPie className="size-5" />
    },
  ];

  // --- Modal Controllers ---
  const statusModal = useModal();
  const deliveryModal = useModal();
  const clientEditModal = useModal();
  const itemEditModal = useModal();
  const dateEditModal = useModal();
  const itemCreateModal = useModal();
  const taxModal = useModal();

  //  Delete Item Confirmation State
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);

  // --- Action States ---
  const [tempStatus, setTempStatus] = useState<string>("Open");
  const [tempDelivery, setTempDelivery] = useState<DeliveryStatus>("Pending");
  const [updating, setUpdating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Dropdown States
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [downloadingStyle, setDownloadingStyle] = useState(false);

  // --- Data Fetching ---
  const fetchData = async () => {
    if (!invoiceId || !businessId || !canViewFinancials) return;
    setLoading(true);
    try {
      const [invData, bizData, itemsData] = await Promise.all([
        invoiceApi.getInvoiceById(invoiceId),
        businessApi.getBusiness(businessId),
        itemApi.getItems(businessId, { limit: 100 }),
      ]);
      setInvoice(invData);
      setBusiness(bizData);
      setAvailableItems(itemsData.items);
      setTempStatus(getInvoiceDisplayStatus(invData));
      setTempDelivery(invData.deliveryStatus);
    } catch (error: any) {
      setAlert({ type: "error", title: "Sync Error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [invoiceId, businessId, canViewFinancials]);

  const handleSmartBack = () => {
    if (location.key !== "default" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/business/${businessId}/invoices`);
    }
  };

  // ==========================================
  // --- Ledger Logic ---
  // ==========================================

  const areIdsEqual = (id1: any, id2: any) => String(id1) === String(id2);

  const handleSelectProduct = (item: ItemData) => {
    if (!invoice) return;
    const existingLineItem = invoice.items.find((lineItem) =>
      areIdsEqual(lineItem.itemId, item._id),
    );

    if (existingLineItem) {
      setSelectedItem({
        itemId: existingLineItem.itemId,
        name: existingLineItem.name,
        quantity: existingLineItem.quantity,
        price: existingLineItem.price,
        costPrice: existingLineItem.costPrice,
        sku: existingLineItem.sku,
        total: existingLineItem.total,
      });
    } else {
      setSelectedItem({
        itemId: item._id,
        name: item.name,
        quantity: 1,
        price: item.price,
        costPrice: item.cost,
        sku: item.sku,
      });
    }
    itemEditModal.openModal();
  };

  const handleEditItemRequest = (item: any) => {
    setSelectedItem(item);
    itemEditModal.openModal();
  };

  //  Unified Save Handler
  const handleItemModalSave = async (_ignoredId: string, data: any) => {
    if (!invoice || !selectedItem) return;

    try {
      const targetItemId = selectedItem.itemId;

      // Create clean array for API
      const currentItems = invoice.items.map((i) => ({
        itemId: i.itemId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        costPrice: i.costPrice,
        sku: i.sku,
        total: i.total,
      }));

      const existingIndex = currentItems.findIndex(
        (i) => String(i.itemId) === String(targetItemId),
      );

      if (existingIndex >= 0) {
        //  UPDATE EXISTING LINE
        currentItems[existingIndex].quantity = Number(data.quantity);
        currentItems[existingIndex].price = Number(data.price);
        currentItems[existingIndex].costPrice = Number(data.costPrice);
        currentItems[existingIndex].total =
          Number(data.quantity) * Number(data.price);
      } else {
        currentItems.push({
          itemId: targetItemId,
          name: selectedItem.name,
          quantity: Number(data.quantity),
          price: Number(data.price),
          costPrice: Number(data.costPrice),
          sku: selectedItem.sku || "",
          total: Number(data.quantity) * Number(data.price),
        });
      }

      // Send full updated list to backend
      await invoiceApi.updateInvoice(invoice._id, { items: currentItems });

      setAlert({ type: "success", title: "Saved", message: "Ledger updated." });
      fetchData();
    } catch (e: any) {
      setAlert({ type: "error", title: "Error", message: e.message });
    }
  };
  const handleDeleteItem = (targetItemId: string) => {
    if (!invoice) return;
    setItemToDelete(targetItemId);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!invoice || !itemToDelete) return;
    setIsDeletingItem(true);
    try {
      const newItems = invoice.items.filter(
        (i) => !areIdsEqual(i.itemId, itemToDelete),
      );
      await invoiceApi.updateInvoice(invoice._id, { items: newItems });
      setAlert({
        type: "success",
        title: "Removed",
        message: "Item removed from ledger.",
      });
      fetchData();
      setIsConfirmDeleteOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      setAlert({ type: "error", title: "Error", message: error.message });
    } finally {
      setIsDeletingItem(false);
    }
  };

  const handleQuickItemSuccess = (newItem: ItemData) => {
    setAvailableItems((prev) => [newItem, ...prev]);
    handleSelectProduct(newItem);
  };

  const handleSaveNotes = async (newNotes: string) => {
    if (!invoice) return;
    try {
      await invoiceApi.updateInvoice(invoice._id, { notes: newNotes });
      setAlert({
        type: "success",
        title: "Saved",
        message: "Invoice notes updated.",
      });
      setInvoice({ ...invoice, notes: newNotes });
    } catch (e: any) {
      setAlert({ type: "error", title: "Error", message: e.message });
    }
  };

  const handleTaxUpdate = async (data: {
    taxRate: number;
    discountValue: number;
    discountType: "percentage" | "fixed";
  }) => {
    if (!invoice) return;
    try {
      await invoiceApi.updateInvoice(invoice._id, {
        taxRate: data.taxRate,
        discountValue: data.discountValue,
        discountType: data.discountType,
      });
      setAlert({
        type: "success",
        title: "Updated",
        message: "Tax and Discount updated.",
      });
      fetchData();
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const handleUpdate = async (payload: {
    status?: string;
    deliveryStatus?: DeliveryStatus;
  }) => {
    if (!invoice) return;
    setUpdating(true);
    try {
      if (payload.status) {
        if (payload.status === "Cancelled") {
          await invoiceApi.deleteInvoice(invoice._id);
        } else if (payload.status === "Paid" && !invoice.isPaid) {
          await invoiceApi.togglePayment(invoice._id);
        } else if (payload.status === "Open" && invoice.isPaid) {
          await invoiceApi.togglePayment(invoice._id);
        }
      }
      if (payload.deliveryStatus) {
        await invoiceApi.updateInvoice(invoice._id, {
          deliveryStatus: payload.deliveryStatus,
        });
      }
      setAlert({
        type: "success",
        title: "Synced",
        message: "Transaction state updated.",
      });
      fetchData();
      statusModal.closeModal();
      deliveryModal.closeModal();
    } catch (e: any) {
      setAlert({ type: "error", title: "Failed", message: e.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleDateUpdate = async (data: {
    issueDate: string;
    dueDate: string;
  }) => {
    if (!invoice) return;
    try {
      await invoiceApi.updateInvoice(invoice._id, {
        issueDate: data.issueDate,
        dueDate: data.dueDate,
      });
      setAlert({
        type: "success",
        title: "Success",
        message: "Dates updated successfully.",
      });
      fetchData();
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const handleDownloadStyle = async (
    templateStyle: "Classic" | "Minimal" | "Modern",
  ) => {
    if (!invoice || !business) return;
    setIsStyleDropdownOpen(false);
    setDownloadingStyle(true);
    try {
      const defaultColors = DEFAULT_COLORS;
      const tempBusinessData: BusinessData = {
        ...business,
        invoiceSettings: {
          template: templateStyle,
          color: business.invoiceSettings?.color || defaultColors,
          logoSize: business.invoiceSettings?.logoSize || "Medium",
          visibility: business.invoiceSettings?.visibility || {
            showLogo: true,
            showTaxId: true,
            showDueDate: true,
            showDiscount: true,
            showNotes: true,
            showPaymentTerms: true,
            showFooter: true,
          },
          paymentTerms: business.invoiceSettings?.paymentTerms || "",
          footerNote: business.invoiceSettings?.footerNote || "",
        },
      };
      const blob = await pdf(
        <InvoicePDF invoice={invoice} business={tempBusinessData} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber}_${templateStyle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setAlert({
        type: "success",
        title: "Downloaded",
        message: `${templateStyle} version exported.`,
      });
    } catch (error) {
      setAlert({
        type: "error",
        title: "Export Error",
        message: "Failed to generate specific style.",
      });
    } finally {
      setDownloadingStyle(false);
    }
  };

  // 2. Scroll Logic Added Here
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

  if (loading && !invoice) {
    return (
      <LoadingState
        message="Decrypting Financial Record..." 
        minHeight="60vh" 
      />
    );
  }

  if (!canViewFinancials) {
    return (
      <PermissionDenied
        title="Protected Document"
        description="You do not have permission to view the details of this financial record."
        actionText="Return to Dashboard"
      />
    );
  }

  if (!invoice || !business) {
    return (
      <RecordNotFound
        title="Invoice Not Found"
        description="This invoice record does not exist or has been permanently removed."
        actionText="Back"
        onAction={handleSmartBack}
      />
    );
  }

  return (
    <>
      <PageMeta
        title={`${invoice.invoiceNumber} | Details`}
        description="Invoice Registry Details"
      />

      <InvoiceHeader
        invoice={invoice}
        business={business}
        canManage={canManage}
        businessId={businessId}
        handleSmartBack={handleSmartBack}
        isStyleDropdownOpen={isStyleDropdownOpen}
        setIsStyleDropdownOpen={setIsStyleDropdownOpen}
        downloadingStyle={downloadingStyle}
        handleDownloadStyle={handleDownloadStyle}
      />

      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <InvoiceIdentityCard
        invoice={invoice}
        business={business}
        canManage={canManage}
        businessId={businessId}
        onEditDates={canManage ? dateEditModal.openModal : undefined}
      />

      {/* --- TABS (Updated) --- */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-white/5 mb-8 overflow-x-auto w-full no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            // 3. Added Ref and Scrollable CSS classes
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-start animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* This pushes the Ledger to the bottom on mobile, but keeps it first on desktop */}
          <div className="lg:col-span-2 space-y-8 order-last lg:order-none">
            <InvoiceParties
              invoice={invoice}
              businessId={businessId}
              onEditClient={canManage ? clientEditModal.openModal : undefined}
            />

            <InvoiceLedger
              invoice={invoice}
              business={business}
              businessId={businessId}
              availableItems={availableItems}
              isEditable={canManage && !invoice.isDeleted && !invoice.isPaid}
              onEditItem={canManage ? handleEditItemRequest : () => {}}
              onSelectProduct={handleSelectProduct}
              onAddItem={() => {}}
              onDeleteItem={handleDeleteItem}
              onNewItem={itemCreateModal.openModal}
              onEditTaxDiscount={taxModal.openModal}
              onSaveNotes={handleSaveNotes}
            />
          </div>

          <InvoiceSidebar
            invoice={invoice}
            openStatusModal={statusModal.openModal}
            openDeliveryModal={deliveryModal.openModal}
            handleSendRecord={()=>{}}
            sendingEmail={sendingEmail}
          />
        </div>
      ) : (
        <InvoiceStatsTab invoice={invoice} business={business} />
      )}

      {/* --- Modals --- */}
      <InvoiceModals
        isStatusOpen={statusModal.isOpen}
        closeStatusModal={statusModal.closeModal}
        tempStatus={tempStatus}
        setTempStatus={setTempStatus as any}
        isDeliveryOpen={deliveryModal.isOpen}
        closeDeliveryModal={deliveryModal.closeModal}
        tempDelivery={tempDelivery}
        setTempDelivery={setTempDelivery}
        handleUpdate={(payload) => handleUpdate(payload)}
        updating={updating}
      />
      <EditClientModal
        isOpen={clientEditModal.isOpen}
        onClose={clientEditModal.closeModal}
        invoice={invoice}
        onSave={async (d) => {
          await invoiceApi.updateClientSnapshot(invoice._id, d);
          fetchData();
        }}
      />
      <EditItemModal
        isOpen={itemEditModal.isOpen}
        onClose={itemEditModal.closeModal}
        item={selectedItem}
        onSave={handleItemModalSave}
        currency={business?.currency}
  currencyFormat={business?.currencyFormat}
      />
      <EditDatesModal
        isOpen={dateEditModal.isOpen}
        onClose={dateEditModal.closeModal}
        invoice={invoice}
        onSave={handleDateUpdate}
      />
      <ItemFormModal
        isOpen={itemCreateModal.isOpen}
        onClose={itemCreateModal.closeModal}
        businessId={businessId!}
        onSuccess={handleQuickItemSuccess}
        refresh={() => {}}
        setAlert={setAlert}
        item={null}
      />
      <EditTaxDiscountModal
        isOpen={taxModal.isOpen}
        onClose={taxModal.closeModal}
        invoice={invoice}
        onSave={handleTaxUpdate}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDeleteItem}
        title="Remove Item?"
        description="This will remove the item from the invoice ledger. This action cannot be undone."
        confirmText="Remove"
        variant="danger"
        isLoading={isDeletingItem}
      />
    </>
  );
}