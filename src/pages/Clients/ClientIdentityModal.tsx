import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; // <--- Hook
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { clientApi, ClientData } from "../../apis/clients";
import PhoneInput from "../../components/form/group-input/PhoneInput";

interface ClientIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientData | null;
  businessId: string;
  refresh: () => void;
  setAlert: (a: any) => void;
}

export default function ClientIdentityModal({
  isOpen,
  onClose,
  client,
  businessId,
  refresh,
  setAlert,
}: ClientIdentityModalProps) {
  const { t } = useTranslation("client_details");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: { country: "US", number: "" },
    clientType: "Individual", 
    taxId: "",
  });

  useEffect(() => {
    if (client) {
      const phoneData = client.phone || { country: "US", number: "" };

      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: {
          country: phoneData.country || "US",
          number: phoneData.number || ""
        },
        clientType: client.clientType || "Individual",
        taxId: client.taxId || "",
      });
    }
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (client) {
        await clientApi.updateClient(client._id, { ...formData });
      } else {
        await clientApi.createClient({ ...formData, businessId });
      }
      setAlert({
        type: "success",
        title: "Success",
        message: t("messages.PROFILE_SAVED"),
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
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
            {t("modals.identity.title")}
          </h4>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
            {t("modals.identity.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t("modals.identity.fields.name")}</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("modals.identity.fields.type")}</Label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-brand-500 outline-none"
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
              >
                <option value="Individual">{t("identity_card.type_individual")}</option>
                <option value="Business">{t("identity_card.type_business")}</option>
              </select>
            </div>
            <div>
              <Label>{t("modals.identity.fields.tax_id")}</Label>
              <Input
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("modals.identity.fields.email")}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("modals.identity.fields.phone")}</Label>
              <PhoneInput
                country={formData.phone.country}
                value={formData.phone.number}
                onChange={(data) => setFormData({ ...formData, phone: data })}
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
              {t("modals.identity.actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="text-[10px] font-semibold uppercase tracking-widest"
            >
              {loading ? t("modals.identity.actions.saving") : t("modals.identity.actions.save")}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}