import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; // <--- Hook
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import CountryInput from "../../components/form/input/CountryInput";
import Label from "../../components/form/Label";
import { clientApi, ClientData } from "../../apis/clients";

interface ClientAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientData | null;
  refresh: () => void;
  setAlert: (a: any) => void;
}

export default function ClientAddressModal({
  isOpen,
  onClose,
  client,
  refresh,
  setAlert,
}: ClientAddressModalProps) {
  const { t } = useTranslation("client_details");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "", 
    country: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        street: client.address?.street || "",
        city: client.address?.city || "",
        state: client.address?.state || "",
        zipCode: client.address?.zipCode || "",
        country: client.address?.country || "",
      });
    }
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setLoading(true);
    try {
      await clientApi.updateClient(client._id, { address: formData });
      setAlert({
        type: "success",
        title: "Success",
        message: t("messages.ADDRESS_UPDATED"),
      });
      refresh();
    } catch (error: any) {
      setAlert({ type: "error", title: t("errors.UPDATE_FAILED"), message: error.message });
    } finally {
      onClose();
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl text-start">
        <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
          {t("modals.address.title")}
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>{t("modals.address.fields.street")}</Label>
              <Input
                placeholder=""
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>

            <div>
              <Label>{t("modals.address.fields.city")}</Label>
              <Input
                placeholder=""
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("modals.address.fields.state")}</Label>
              <Input
                placeholder=""
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("modals.address.fields.zip")}</Label>
              <Input
                placeholder=""
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>

            <div>
              <Label>{t("modals.address.fields.country")}</Label>
              <CountryInput
                value={formData.country}
                onChange={(val) => setFormData({ ...formData, country: val })}
                placeholder=""
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-[10px] font-semibold uppercase tracking-widest"
            >
              {t("modals.address.actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="text-[10px] font-semibold uppercase tracking-widest"
            >
              {loading ? t("modals.address.actions.saving") : t("modals.address.actions.save")}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}