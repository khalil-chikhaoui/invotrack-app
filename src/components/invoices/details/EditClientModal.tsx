import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; // <--- Hook
import { Modal } from "../../ui/modal";
import Input from "../../form/input/InputField";
import CountryInput from "../../form/input/CountryInput";
import Button from "../../ui/button/Button";
import { InvoiceData } from "../../../apis/invoices";
import { HiOutlineUser } from "react-icons/hi2";
import Label from "../../form/Label";
import PhoneInput from "../../form/group-input/PhoneInput";

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  onSave: (data: any) => Promise<void>;
}

export default function EditClientModal({
  isOpen,
  onClose,
  invoice,
  onSave,
}: EditClientModalProps) {
  const { t } = useTranslation("invoice_details");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: { country: "US", number: "" },
    street: "",
    city: "", 
    state: "",
    zipCode: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice && isOpen) {
      const phoneSnapshot = (invoice.clientSnapshot as any).phone || {};

      setFormData({
        name: invoice.clientSnapshot.name || "",
        email: invoice.clientSnapshot.email || "",
        phone: {
          country: phoneSnapshot.country || "US",
          number: phoneSnapshot.number || "",
        },
        street: invoice.clientSnapshot.address?.street || "",
        city: invoice.clientSnapshot.address?.city || "",
        state: invoice.clientSnapshot.address?.state || "",
        zipCode: invoice.clientSnapshot.address?.zipCode || "",
        country: invoice.clientSnapshot.address?.country || "",
      });
    }
  }, [invoice, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      onClose();
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-500">
            <HiOutlineUser className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
              {t("modals.client.title")}
            </h3>
            <p className="text-xs text-gray-500">
              {t("modals.client.subtitle")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t("modals.client.fields.name")}</Label>
            <Input
              placeholder=""
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>{t("modals.client.fields.email")}</Label>
              <Input
                placeholder=""
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>{t("modals.client.fields.phone")}</Label>
              <PhoneInput
                country={formData.phone.country}
                value={formData.phone.number}
                onChange={(data) => setFormData({ ...formData, phone: data })}
                placeholder=""
              />
            </div>
          </div>

          <div>
            <Label className="mb-2">{t("modals.client.fields.billing")}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  placeholder={t("modals.client.fields.street")}
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                />
              </div>
              <Input
                placeholder={t("modals.client.fields.city")}
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
              <Input
                placeholder={t("modals.client.fields.state")}
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
              <Input
                placeholder={t("modals.client.fields.zip")}
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
              />
              <CountryInput
                placeholder={t("modals.client.fields.country")}
                value={formData.country}
                onChange={(val) => setFormData({ ...formData, country: val })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              {t("modals.client.actions.cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t("modals.client.actions.saving") : t("modals.client.actions.save")}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}