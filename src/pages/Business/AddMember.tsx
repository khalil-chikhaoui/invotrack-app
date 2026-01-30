/**
 * @fileoverview AddMember Component
 * Handles the logic for inviting new team members to a business entity.
 * Includes Permission Guard UI for unauthorized users.
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import CustomAlert from "../../components/common/CustomAlert";
import PermissionDenied from "../../components/common/PermissionDenied";
import { PaperPlaneIcon, ChevronLeftIcon } from "../../icons";
import { businessApi } from "../../apis/business";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";

export default function AddMember() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { canManageSettings } = usePermissions();

  // --- UI & Submission State ---
  const [loading, setLoading] = useState(false);
  const { alert, setAlert } = useAlert();

  // --- Form Data State ---
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "Viewer",
    title: "",
  });

  /**
   * Submission Handler
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setLoading(true);
    setAlert(null);

    try {
      await businessApi.inviteMember(businessId, formData);

      setAlert({
        type: "success",
        title: "Invitation Sent",
        message: `A secure invitation has been dispatched to ${formData.email}.`,
      });

      setTimeout(() => {
        navigate(`/business/${businessId}/members`);
      }, 1800);
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Invitation Failed",
        message:
          error.message || "We encountered a problem sending the invite.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canManageSettings) {
    return (
      <PermissionDenied
        title="Restricted Area"
        description="Only Administrators can invite new members to this organization. Please contact your team lead for assistance."
        actionText="Back"
      />
    );
  }

  return (
    <>
      <PageMeta
        title="Invite New Member | Invotrack"
        description="Expand your team by inviting a new member."
      />
      <PageBreadcrumb pageTitle="Add New Member" />

      <div className="w-full">
        {/* Navigation Control */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-[10px] font-semibold text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors uppercase tracking-widest"
        >
          <ChevronLeftIcon className="size-4" />
          Back
        </button>

        {/* Global Feedback Alert */}
        <CustomAlert data={alert} onClose={() => setAlert(null)} />

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 uppercase tracking-tight">
              Invite Team Member
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              New members will receive an activation link to set their password
              and join your organization.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {/* Full Name */}
              <div className="sm:col-span-1">
                <Label>
                  Full Name <span className="text-error-500 dark:text-error-400">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Email Address */}
              <div className="sm:col-span-1">
                <Label>
                  Email Address <span className="text-error-500 dark:text-error-400">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              {/* Work Title */}
              <div className="sm:col-span-1">
                <Label>Professional Title</Label>
                <Input
                  type="text"
                  placeholder="e.g. Sales Director"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Role Selection */}
              <div className="sm:col-span-1">
                <Label>
                  Access Level <span className="text-error-500 dark:text-error-400">*</span>
                </Label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  >
                    <option value="Viewer">Viewer (Read Only)</option>
                    <option value="Deliver">
                      Deliver (Logistics & Delivery)
                    </option>
                    <option value="Manager">Manager (Billing & CRM)</option>
                    <option value="Admin">Administrator (Full Control)</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 13.3333L5 8.33333L6.16667 7.16667L10 11L13.8333 7.16667L15 8.33333L10 13.3333Z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button
              type="button"
                variant="outline"
                className="text-[10px] uppercase font-semibold tracking-widest px-6"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit"
                disabled={loading}
                className="flex items-center gap-2 shadow-lg shadow-brand-500/20 text-[10px] uppercase font-semibold tracking-widest px-6"
              >
                {loading ? "Transmitting..." : "Send Invitation"}
                <PaperPlaneIcon className="fill-current size-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
