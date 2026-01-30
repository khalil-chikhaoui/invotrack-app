import { useState, useEffect } from "react";
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
        title: "Address Sync",
        message: `Location details updated.`,
      });
      refresh();
    } catch (error: any) {
      setAlert({ type: "error", title: "Error", message: error.message });
    } finally {
      onClose();
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl text-start">
        <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
          Update Location Registry
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* --- Full Width Street Input --- */}
            <div className="md:col-span-2">
              <Label>Street Address</Label>
              <Input
                placeholder="123 Business St."
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
              />
            </div>

            {/* --- Geographic Details --- */}
            <div>
              <Label>City</Label>
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
            <div>
              <Label>State / Province</Label>
              <Input
                placeholder="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input
                placeholder="ZIP"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
              />
            </div>

            {/* --- Smart Country Autocomplete Picker --- */}
            <div>
              <Label>Country</Label>
              <CountryInput
                value={formData.country}
                onChange={(val) => setFormData({ ...formData, country: val })}
                placeholder="Search country registry..."
              />
            </div>
          </div>

          {/* --- Modal Actions --- */}
          <div className="flex justify-end gap-3 mt-8">
            <Button
            type="button"
              variant="outline"
              onClick={onClose}
              className="text-[10px] font-semibold uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
            type="submit"
              disabled={loading}
              className="text-[10px] font-semibold uppercase tracking-widest"
            >
              {loading ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
