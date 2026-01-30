import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import ConfirmModal from "../../common/ConfirmModal";
import { HiOutlineCheckCircle, HiOutlineTruck } from "react-icons/hi2";
import {
  InvoiceData,
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
} from "../../../apis/invoices";
import StatusUpdateModal from "../../common/StatusUpdateModal";

interface ItemTransactionModalsProps {
  // Delete Modal
  isDeleteOpen: boolean;
  closeDeleteModal: () => void;
  confirmVoidInvoice: () => void;
  selectedInvoice: InvoiceData | null;
  deleting: boolean;

  // Status Modal
  isStatusOpen: boolean;
  closeStatusModal: () => void;
  tempStatus: string;
  setTempStatus: (s: string) => void;
  handleStatusUpdate: (payload: any) => void;

  // Delivery Modal
  isDeliveryOpen: boolean;
  closeDeliveryModal: () => void;
  tempDelivery: DeliveryStatus;
  setTempDelivery: (s: DeliveryStatus) => void;

  updating: boolean;
}

const PAYMENT_OPTIONS = ["Open", "Paid", "Cancelled"];

export default function ItemTransactionModals({
  isDeleteOpen,
  closeDeleteModal,
  confirmVoidInvoice,
  selectedInvoice,
  deleting,
  isStatusOpen,
  closeStatusModal,
  tempStatus,
  setTempStatus,
  handleStatusUpdate,
  isDeliveryOpen,
  closeDeliveryModal,
  tempDelivery,
  setTempDelivery,
  updating,
}: ItemTransactionModalsProps) {
  // Helper for dynamic styling
  const getOptionStyle = (option: string, current: string) => {
    const isSelected = option === current;
    let base =
      "flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ";

    if (isSelected) {
      if (option === "Cancelled") {
        return (
          base +
          "border-red-500 bg-red-50 dark:bg-red-500/20 ring-1 ring-red-500 text-red-600 dark:text-red-400"
        );
      }
      return (
        base +
        "border-brand-500 bg-brand-50 dark:bg-brand-500/20 ring-1 ring-brand-500 text-brand-600 dark:text-brand-400"
      );
    }

    return (
      base +
      "border-gray-100 dark:border-white/[0.08] text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
    );
  };

  return (
    <>
      {/* Delete/Void Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmVoidInvoice}
        title="Void Invoice?"
        description={`Permanently cancel invoice ${selectedInvoice?.invoiceNumber}? Stock will be returned.`}
        variant="danger"
        isLoading={deleting}
      />

     {/* 2. Reusable Status Update Modal (For Payment)  */}
      <StatusUpdateModal
        isOpen={isStatusOpen}
        onClose={closeStatusModal}
        title="Payment Status"
        type="payment"
        options={PAYMENT_OPTIONS}
        currentValue={tempStatus}
        onValueChange={setTempStatus}
        onConfirm={() => handleStatusUpdate({ status: tempStatus })}
        isLoading={updating}
        // Dynamic label logic passed here
        confirmLabel={tempStatus === "Cancelled" ? "Confirm Void" : "Update"}
      />

      {/* 3. Reusable Status Update Modal (For Delivery)  */}
      <StatusUpdateModal
        isOpen={isDeliveryOpen}
        onClose={closeDeliveryModal}
        title="Logistics Status"
        type="delivery"
        options={DELIVERY_STATUS_OPTIONS}
        currentValue={tempDelivery}
        onValueChange={(val) => setTempDelivery(val)}
        onConfirm={() => handleStatusUpdate({ deliveryStatus: tempDelivery })}
        isLoading={updating}
        confirmLabel="Update"
      />
    </>
  );
}
