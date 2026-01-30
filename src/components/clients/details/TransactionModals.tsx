import { Modal } from "../../ui/modal";
import ConfirmModal from "../../common/ConfirmModal";
import Button from "../../ui/button/Button";
import { HiOutlineCheckCircle, HiOutlineTruck } from "react-icons/hi2";
import {
  InvoiceData,
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
} from "../../../apis/invoices";
import StatusUpdateModal from "../../common/StatusUpdateModal";

interface TransactionModalsProps {
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

  // Delete Modal
  isDeleteOpen: boolean;
  closeDeleteModal: () => void;
  confirmVoidInvoice: () => void;

  // States
  selectedInvoice: InvoiceData | null;
  updating: boolean;
  deleting: boolean;
}

const PAYMENT_OPTIONS = ["Open", "Paid", "Cancelled"];

export default function TransactionModals({
  isStatusOpen,
  closeStatusModal,
  tempStatus,
  setTempStatus,
  handleStatusUpdate,
  isDeliveryOpen,
  closeDeliveryModal,
  tempDelivery, 
  setTempDelivery,
  isDeleteOpen,
  closeDeleteModal,
  confirmVoidInvoice,
  selectedInvoice,
  updating,
  deleting,
}: TransactionModalsProps) {
  return (
    <>
      {/* Void Invoice Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmVoidInvoice}
        title="Void Invoice?"
        description={`Permanently cancel invoice ${selectedInvoice?.invoiceNumber}? Stock will be returned to inventory.`}
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
