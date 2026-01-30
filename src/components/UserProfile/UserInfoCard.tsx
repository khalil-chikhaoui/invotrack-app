/**
 * @fileoverview UserInfoCard Component
 * Manages the display and modification of core user attributes (Name, Email).
 */

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { authApi } from "../../apis/auth";

export default function UserInfoCard({
  setAlert,
}: {
  setAlert: (alert: any) => void;
}) {
  const { user, login, token } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  // Early return if user context isn't loaded yet
  if (!user) return null;

  /**
   * Name Parsing Logic:
   * Splits the full name from the DB into First and Last name parts
   * to populate the two-column edit form correctly.
   */
  const nameParts = user.name ? user.name.split(" ") : ["", ""];
  const [formData, setFormData] = useState({
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
  });

  /**
   * Handles the profile update submission.
   * Re-joins the name parts and synchronizes the global user state upon success.
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      };
      const data = await authApi.updateProfile(payload);

      // Update global context to reflect changes across the entire UI
      login(token!, data.user);

      setAlert({
        type: "success",
        title: "Details Saved",
        message: "Your personal information was updated successfully.",
      });
      closeModal();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Save Failed",
        message: error.message || "Failed to update profile info.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
      {/* --- View Mode --- */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 xl:gap-7">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.name}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 lg:inline-flex"
        >
          Edit
        </button>
      </div>

      {/* --- Edit Modal --- */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-11">
          <h4 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white/90">
            Edit Personal Information
          </h4>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <Label>First Name</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="e.g. John"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="e.g. Doe"
                />
              </div>

              <div className="lg:col-span-2">
                <Label>Email Address</Label>
                {/* Email is disabled as it's the primary account identifier/key */}
                <Input
                  value={user.email}
                  disabled
                  className="opacity-70 cursor-not-allowed bg-gray-50 dark:bg-white/[0.03]"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Contact support to change your account email.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button type="button" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
