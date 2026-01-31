import { useTranslation } from "react-i18next"; 
import ConfirmModal from "../../common/ConfirmModal";
import {
  InvoiceData,
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
} from "../../../apis/invoices";
import StatusUpdateModal from "../../common/StatusUpdateModal";

interface TransactionModalsProps {
  isStatusOpen: boolean;
  closeStatusModal: () => void;
  tempStatus: string;
  setTempStatus: (s: string) => void;
  handleStatusUpdate: (payload: any) => void;

  isDeliveryOpen: boolean;
  closeDeliveryModal: () => void;
  tempDelivery: DeliveryStatus;
  setTempDelivery: (s: DeliveryStatus) => void;

  isDeleteOpen: boolean;
  closeDeleteModal: () => void;
  confirmVoidInvoice: () => void;

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
  const { t } = useTranslation("client_details");
  const { t: tInv } = useTranslation("invoice"); 

  return (
    <>
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmVoidInvoice}
        title={t("modals.void.title")}
        description={t("modals.void.desc", { number: selectedInvoice?.invoiceNumber })}
        variant="danger"
        isLoading={deleting}
      />
 
      <StatusUpdateModal
        isOpen={isStatusOpen}
        onClose={closeStatusModal}
        title={tInv("status_modal.title_payment")}
        type="payment"
        options={PAYMENT_OPTIONS}
        currentValue={tempStatus}
        onValueChange={setTempStatus}
        onConfirm={() => handleStatusUpdate({ status: tempStatus })}
        isLoading={updating}
        confirmLabel={tempStatus === "Cancelled" ? tInv("status_modal.actions.confirm_void") : tInv("status_modal.actions.update")}
      />

      <StatusUpdateModal
        isOpen={isDeliveryOpen}
        onClose={closeDeliveryModal}
        title={tInv("status_modal.title_delivery")}
        type="delivery"
        options={DELIVERY_STATUS_OPTIONS}
        currentValue={tempDelivery}
        onValueChange={(val) => setTempDelivery(val)}
        onConfirm={() => handleStatusUpdate({ deliveryStatus: tempDelivery })}
        isLoading={updating}
        confirmLabel={tInv("status_modal.actions.update")}
      />
    </>
  );
}