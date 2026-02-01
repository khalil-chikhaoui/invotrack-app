import { useTranslation } from "react-i18next";
import {
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
} from "../../../apis/invoices";
import StatusUpdateModal from "../../common/StatusUpdateModal";

interface InvoiceModalsProps {
  isStatusOpen: boolean;
  closeStatusModal: () => void;
  tempStatus: string;
  setTempStatus: (s: string) => void;

  tempDelivery: DeliveryStatus;
  setTempDelivery: (d: DeliveryStatus) => void;
  isDeliveryOpen: boolean;
  closeDeliveryModal: () => void;

  handleUpdate: (payload: any) => void;
  updating: boolean;
}

const PAYMENT_STATES = ["Paid", "Open", "Cancelled"];

export default function InvoiceModals({
  isStatusOpen,
  closeStatusModal,
  tempStatus,
  setTempStatus,
  tempDelivery,
  setTempDelivery,
  isDeliveryOpen,
  closeDeliveryModal,
  handleUpdate,
  updating,
}: InvoiceModalsProps) {
  const { t } = useTranslation("invoice_details");

  return (
    <>
      {/* Payment Modal */}
      <StatusUpdateModal
        isOpen={isStatusOpen}
        onClose={closeStatusModal}
        title={t("modals.payment.title")}
        type="payment"
        options={PAYMENT_STATES}
        currentValue={tempStatus}
        onValueChange={setTempStatus}
        onConfirm={() => handleUpdate({ status: tempStatus })}
        isLoading={updating}
        confirmLabel={t("modals.payment.apply")}
      />

      {/* Delivery Modal */}
      <StatusUpdateModal
        isOpen={isDeliveryOpen}
        onClose={closeDeliveryModal}
        title={t("modals.delivery.title")}
        type="delivery"
        options={DELIVERY_STATUS_OPTIONS}
        currentValue={tempDelivery}
        onValueChange={(val) => setTempDelivery(val as DeliveryStatus)}
        onConfirm={() => handleUpdate({ deliveryStatus: tempDelivery })}
        isLoading={updating}
        confirmLabel={t("modals.delivery.update")}
      />
    </>
  );
}
