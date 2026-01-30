import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { clientApi, ClientData } from "../../apis/clients";
import { itemApi, ItemData } from "../../apis/items";
import { invoiceApi } from "../../apis/invoices";
import { businessApi, BusinessData } from "../../apis/business";
import { useModal } from "../../hooks/useModal";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CustomAlert from "../../components/common/CustomAlert";
import PermissionDenied from "../../components/common/PermissionDenied";
import ClientFormModal from "../Clients/ClientFormModal";
import ItemFormModal from "../Items/ItemFormModal";
import ClientSelector from "../../components/invoices/create/ClientSelector";
import ItemManager from "../../components/invoices/create/ItemManager";
import InvoiceNotes from "../../components/invoices/create/InvoiceNotes";
import InvoiceDates from "../../components/invoices/create/InvoiceDates";
import InvoiceTaxDiscount from "../../components/invoices/create/InvoiceTaxDiscount";
import InvoiceSummary from "../../components/invoices/create/InvoiceSummary";
import EditItemModal from "../../components/invoices/details/EditItemModal"; 
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { scrollToTopAppLayout } from "../../layout/AppLayout";
import LoadingState from "../../components/common/LoadingState";

export default function CreateInvoice() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { alert, setAlert } = useAlert();
  const { canManage } = usePermissions();

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [availableItems, setAvailableItems] = useState<ItemData[]>([]);

  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [issueDate, setIssueDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(0);

  const [clientSearch, setClientSearch] = useState("");

  const [selectedItem, setSelectedItem] = useState<any>(null); 
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const clientModal = useModal();
  const itemModal = useModal();
  const editItemModal = useModal();

  const queryParams = new URLSearchParams(location.search);
  const queryClientId = queryParams.get("clientId");

// Inside CreateInvoice.tsx

useEffect(() => {
  if (!businessId || !canManage) return;

  const loadData = async () => {
    try {
      // 1. Start fetching basic needs
      const [biz, cls, its] = await Promise.all([
        businessApi.getBusiness(businessId),
        clientApi.getClients(businessId, { limit: 20 }), // Only 10 for suggestions
        itemApi.getItems(businessId, { limit: 20 }),   // Only 10 for suggestions
      ]);

      setBusiness(biz);
      setClients(cls.clients);
      setAvailableItems(its.items);
      setTaxRate(biz.defaultTaxRate || 0);
      setDiscountValue(biz.defaultDiscount?.value || 0);
      setDiscountType(biz.defaultDiscount?.type || "percentage");

      // 2. ✅ FIXED: Keep query parameter logic working
      if (queryClientId) {
        try {
          // Instead of finding in a local list, fetch the specific client
          const specificClient = await clientApi.getClientById(queryClientId);
          setSelectedClient(specificClient);
        } catch (err) {
          console.error("Query Client ID invalid or not found");
        }
      }
    } catch (err) {
      setAlert({ type: "error", title: "Load Error", message: "Failed to load builder data." });
    } finally {
      setInitialLoading(false);
    }
  };

  loadData();
}, [businessId, queryClientId, canManage]);

  if (!canManage) {
    return (
      <PermissionDenied
        title="Restricted Access"
        description="You do not have permissions."
        actionText="Back" 
      />
    );
  }

  const totals = useMemo(() => {
    const subTotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const totalDiscount =
      discountType === "percentage"
        ? subTotal * (discountValue / 100)
        : discountValue;
    const taxableAmount = Math.max(0, subTotal - totalDiscount);
    const totalTax = taxableAmount * (taxRate / 100);
    const grandTotal = taxableAmount + totalTax;
    return { subTotal, totalDiscount, totalTax, grandTotal };
  }, [invoiceItems, discountType, discountValue, taxRate]);

  // --- ITEM HANDLERS (UPDATED) ---

  // 1. Trigger Add (from Search)
  const handleSelectProduct = (item: ItemData) => {
    // Check if item already exists in local list
    const existingIndex = invoiceItems.findIndex((i) => i.itemId === item._id);

    if (existingIndex >= 0) {
      // Edit existing
      setSelectedItem(invoiceItems[existingIndex]);
      setEditingIndex(existingIndex);
    } else {
      // Add new
      setSelectedItem({
        itemId: item._id,
        name: item.name,
        quantity: 1,
        price: item.price,
        costPrice: item.cost,
        sku: item.sku,
      });
      setEditingIndex(null); // Indicates new item
    }
    editItemModal.openModal();
  };

  // 2. Trigger Edit (from Table)
  const handleEditItemRequest = (index: number) => {
    setSelectedItem(invoiceItems[index]);
    setEditingIndex(index);
    editItemModal.openModal();
  };

  // 3. Save Item (Local State Update)
  const handleItemModalSave = async (_ignoredId: string, data: any) => {
    const quantity = Number(data.quantity);
    const price = Number(data.price);
    const costPrice = Number(data.costPrice);
    const total = quantity * price;

    if (editingIndex !== null) {
      // Update existing
      setInvoiceItems((prev) => {
        const newArr = [...prev];
        newArr[editingIndex] = {
          ...newArr[editingIndex],
          quantity,
          price,
          costPrice,
          total,
        };
        return newArr;
      });
    } else {
      // Add new
      const newItem = {
        itemId: selectedItem.itemId,
        name: selectedItem.name,
        quantity,
        price,
        costPrice,
        sku: selectedItem.sku,
        total,
      };
      setInvoiceItems((prev) => [...prev, newItem]);
    }

    // We don't need async/await here as it's local state,
    // but the Modal interface expects a Promise, so we return one.
    return Promise.resolve();
  };

  const removeItem = (index: number) => {
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClientSuccess = (newClient: ClientData) => {
    setClients((prev) => [newClient, ...prev]);
    setSelectedClient(newClient);
    setClientSearch("");
  }; 

  const handleQuickItemSuccess = (newItem: ItemData) => {
    setAvailableItems((prev) => [newItem, ...prev]);
    handleSelectProduct(newItem); // Auto-open modal for the new item
  };

  const handleSubmit = async () => {
    if (!selectedClient || invoiceItems.length === 0) {
      setAlert({
        type: "error",
        title: "Missing Data",
        message: "Please select a client and add at least one item.",
      });
       scrollToTopAppLayout();
      return;
    }

    setLoading(true);
    try {
      const clientId = selectedClient._id || (selectedClient as any).clientId;
      const payload = {
        businessId,
       clientSnapshot: { 
          clientId: clientId,
          name: selectedClient.name,
          email: selectedClient.email,
          address: selectedClient.address,
          phone: selectedClient.phone 
        },
        items: invoiceItems, // Items are already in correct format
        issueDate,
        dueDate,
        notes,
        discountType,
        discountValue: Number(discountValue),
        taxRate: Number(taxRate),
      };

      const newInvoice = await invoiceApi.createInvoice(payload);
      navigate(`/business/${businessId}/invoices/${newInvoice._id}`);
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Creation Failed",
        message: error.message,
      });
      scrollToTopAppLayout();
    } finally {
      setLoading(false);
    }
  };

if (initialLoading) {
  return (
    <LoadingState
      message="Initializing Invoice Builder..." 
      minHeight="60vh" 
    />
  );
}
 
  return (
    <>
      <PageMeta
        description="Draft and dispatch new financial documents."
        title="New Invoice"
      />
     <button
        onClick={()=> navigate(-1)}
        className="flex items-center mt-2 gap-2 text-[10px] font-semibold uppercase text-gray-600 hover:text-brand-500 dark:text-gray-400 hover:dark:text-brand-400 transition-colors tracking-widest cursor-pointer"
      >
        <HiOutlineArrowLeft className="size-4" /> Back
      </button>
      <div className="mt-4"/>
      <PageBreadcrumb  pageTitle="New Invoice" />

      <div className="px-2 sm:px-6 pb-20 space-y-4">
        <CustomAlert data={alert} onClose={() => setAlert(null)} />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 space-y-4">
            <ClientSelector
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              clients={clients}
              search={clientSearch}
              setSearch={setClientSearch}
              onNewClient={clientModal.openModal}
              isEdit={false}
            />
            <ItemManager
              items={invoiceItems}
              availableItems={availableItems}
              onSelectProduct={handleSelectProduct}
              onEditItem={handleEditItemRequest}
              onRemoveItem={removeItem}
              onNewItem={itemModal.openModal}
              currency={business?.currency}
              currencyFormat={business?.currencyFormat as any}
            />
          </div>
          <div className="xl:col-span-4 space-y-4">
            <InvoiceDates
              issueDate={issueDate}
              setIssueDate={setIssueDate}
              dueDate={dueDate}
              setDueDate={setDueDate}
            />
            <InvoiceTaxDiscount
              discountValue={discountValue}
              setDiscountValue={setDiscountValue}
              discountType={discountType}
              setDiscountType={setDiscountType}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
            />
            <InvoiceSummary
              totals={totals}
              taxRate={taxRate}
              currency={business?.currency}
              currencyFormat={business?.currencyFormat}
              loading={loading}
              isEdit={false}
              onSubmit={handleSubmit}
              hasDiscount={discountValue > 0}
            />
          </div>
        </div>
        <div className="w-full">
          <InvoiceNotes notes={notes} setNotes={setNotes} />
        </div>
      </div>

      <ClientFormModal
        isOpen={clientModal.isOpen}
        onClose={clientModal.closeModal}
        businessId={businessId!}
        onSuccess={handleClientSuccess}
        setAlert={setAlert}
      />
      <ItemFormModal
        isOpen={itemModal.isOpen}
        onClose={itemModal.closeModal}
        businessId={businessId!}
        onSuccess={handleQuickItemSuccess}
        refresh={() => {}}
        setAlert={setAlert}
        item={null}
      />

      {/* Reused Edit Item Modal */}
      <EditItemModal
        isOpen={editItemModal.isOpen}
        onClose={editItemModal.closeModal}
        item={selectedItem}
        onSave={handleItemModalSave}
        currency={business?.currency}
  currencyFormat={business?.currencyFormat}
      />
    </>
  );
}
