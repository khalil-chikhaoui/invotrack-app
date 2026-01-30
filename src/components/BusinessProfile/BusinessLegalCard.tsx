/**
 * @fileoverview BusinessLegalCard Component
 * Manages the organization's sensitive financial and legal identifiers.
 * Features:
 * 1. Regulatory Tracking: Handles Tax ID (VAT) and official Company Registration numbers.
 * 2. Communication Hub: Manages the designated billing email for financial outreach.
 * 3. Permission Guarding: Ensures only users with the 'Admin' role can modify legal standing.
 * 4. Data Integrity: Provides a mono-spaced visual treatment for Tax IDs to ensure character clarity.
 */

import { useState } from "react";
import { BusinessData, businessApi } from "../../apis/business";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { usePermissions } from "../../hooks/usePermissions";

export default function BusinessLegalCard({
  business,
  refresh,
  setAlert,
}: {
  business: BusinessData;
  refresh: () => void;
  setAlert: (alert: any) => void;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const { isAdmin } = usePermissions();

  // --- Local Form State ---
  const [formData, setFormData] = useState({
    taxId: business.taxId || "",
    registrationNumber: business.registrationNumber || "",
    email: business.email || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await businessApi.updateBusiness(business._id, formData);
      setAlert({
        type: "success",
        title: "Registry Updated",
        message: "Financial and registration details have been synchronized.",
      });
      refresh();
      closeModal();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Sync Failed",
        message: error.message || "Failed to update legal information.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 text-start">
      {/* --- Card Header --- */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
          Legal & Finance Registry
        </h4>
        {isAdmin && (
          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 uppercase tracking-widest transition-all"
          >
            Edit
          </button>
        )}
      </div>

      {/* --- Visual Data Display --- */}
      <div className="space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-800">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Tax ID / VAT
          </span>
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {business.taxId || "UNSET"}
          </span>
        </div>

        <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-800">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Registration #
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {business.registrationNumber || "NOT REGISTERED"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Billing Email
          </span>
          <span className="text-sm font-semibold text-brand-500 dark:text-brand-300 hover:underline cursor-pointer">
            {business.email}
          </span>
        </div>
      </div>

      {/* --- Edit Modal --- */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="p-6 lg:p-11 bg-white dark:bg-gray-900 rounded-3xl text-start">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
            Update Registry
          </h4>
          <p className="text-xs font-medium text-gray-500 mb-8 uppercase tracking-widest">
            Modify official identification and contact details
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-4"
          >
            <div>
              <Label>Tax ID / VAT Number</Label>
              <Input
                placeholder="e.g. VAT123456789"
                value={formData.taxId}
                onChange={(e) =>
                  setFormData({ ...formData, taxId: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Company Registration Number</Label>
              <Input
                placeholder="Official business ID"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationNumber: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Designated Billing Email</Label>
              <Input
                type="email"
                placeholder="accounts@business.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <p className="mt-2 text-[10px] text-gray-400 font-medium italic">
                Invoices and payment receipts will be synchronized with this
                address.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-10">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="text-[10px] font-semibold uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="text-[10px] font-semibold uppercase tracking-widest"
              >
                {loading ? "Synchronizing..." : "Apply Updates"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
