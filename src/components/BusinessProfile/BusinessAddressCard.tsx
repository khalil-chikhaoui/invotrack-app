/**
 * @fileoverview BusinessAddressCard Component
 * Manages the physical and digital connectivity of the business.
 */

import { useState, useEffect } from "react";
import { BusinessData, businessApi } from "../../apis/business";
import { useModal } from "../../hooks/useModal";
import { usePermissions } from "../../hooks/usePermissions";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import CountryInput from "../form/input/CountryInput";
import Label from "../form/Label";
import {
  HiOutlinePencil,
  HiOutlineGlobeAlt,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { SocialIcon } from "../../icons/SocialIcons";
import PhoneInput from "../form/group-input/PhoneInput";

function SectionEditButton() {
  return (
    <div
      className="flex items-center justify-center w-8 h-8 text-gray-400 group-hover:text-brand-500 
    group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 rounded-full transition-all"
    >
      <HiOutlinePencil className="size-4" />
    </div>
  );
}

export default function BusinessAddressCard({
  business,
  refresh,
  setAlert,
}: {
  business: BusinessData;
  refresh: () => void;
  setAlert: (alert: any) => void;
}) {
  const { canManageSettings } = usePermissions();
  const canEdit = canManageSettings;

  const addressModal = useModal();
  const contactModal = useModal();
  const socialModal = useModal();

  const [loading, setLoading] = useState(false);

  // --- State Management ---
  // Ensure phone handles the object structure, providing defaults if missing
  const [formData, setFormData] = useState({
    address: { ...business.address },
    phone: (business.phoneNumber as any) || { country: "US", number: "" },
    website: business.website || "",
    socialLinks: { ...business.socialLinks },
  });

  // Sync state with prop updates
  useEffect(() => {
    setFormData({
      address: { ...business.address },
      phone: (business.phoneNumber as any) || { country: "US", number: "" },
      website: business.website || "",
      socialLinks: { ...business.socialLinks },
    });
  }, [business]);

  const handleSave = async (data: any, modal: any) => {
    setLoading(true);
    try {
      await businessApi.updateBusiness(business._id, data);
      setAlert({
        type: "success",
        title: "Updated Successfully",
        message: "Registry details synchronized.",
      });
      refresh();
      modal.closeModal();
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Update Failed",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 text-start">
      <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
        Location & Connectivity
      </h4>

      <div className="flex flex-col gap-4">
        {/* --- SECTION 1: PHYSICAL ADDRESS --- */}
        <div
          onClick={canEdit ? addressModal.openModal : undefined}
          className={`group flex justify-between items-start p-4 rounded-xl border border-transparent bg-gray-50/50 dark:bg-white/[0.02] transition-all
            ${canEdit ? "cursor-pointer hover:border-brand-500 hover:shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.03]" : ""}
          `}
        >
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-brand-50/50 text-brand-500 rounded-xl dark:bg-brand-500/10 flex-shrink-0 shadow-sm border border-brand-100 dark:border-brand-500/20">
              <HiOutlineLocationMarker className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white uppercase leading-snug">
                {business.address?.street || "Street Unset"}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {business.address?.city}, {business.address?.state}{" "}
                {business.address?.zipCode}
              </p>
              <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-widest">
                {business.address?.country || "International Registry"}
              </p>
            </div>
          </div>
          {canEdit && <SectionEditButton />}
        </div>

        {/* --- SECTION 2: TELECOMMUNICATIONS --- */}
        <div
          onClick={canEdit ? contactModal.openModal : undefined}
          className={`group flex justify-between items-start p-4 rounded-xl border border-transparent bg-gray-50/50 dark:bg-white/[0.02] transition-all
            ${canEdit ? "cursor-pointer hover:border-brand-500 hover:shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.03]" : ""}
          `}
        >
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-success-50/50 text-success-600 rounded-xl dark:bg-success-500/10 flex-shrink-0 shadow-sm border border-success-100 dark:border-success-500/20">
              <HiOutlinePhone className="size-6" />
            </div>
            <div>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">
                Official Contact
              </span>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {/* Access the .number property of the phone object */}
                {(business.phoneNumber as any)?.number || "No phone connected"}
              </p>
            </div>
          </div>
          {canEdit && <SectionEditButton />}
        </div>

        {/* --- SECTION 3: DIGITAL FOOTPRINT --- */}
        <div
          onClick={canEdit ? socialModal.openModal : undefined}
          className={`group flex flex-col gap-4 p-4 rounded-xl border border-transparent bg-gray-50/50 dark:bg-white/[0.02] transition-all
            ${canEdit ? "cursor-pointer hover:border-brand-500 hover:shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.03]" : ""}
          `}
        >
          <div className="flex justify-between items-start w-full">
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50/50 text-blue-600 rounded-xl dark:bg-blue-500/10 flex-shrink-0 shadow-sm border border-blue-100 dark:border-blue-500/20">
                <HiOutlineGlobeAlt className="size-6" />
              </div>
              <div>
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">
                  Online Presence
                </span>
                {business.website ? (
                  <a
                    href={
                      business.website.startsWith("http")
                        ? business.website
                        : `https://${business.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-semibold text-brand-500 hover:underline relative z-10"
                  >
                    {business.website}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No website configured
                  </p>
                )}
              </div>
            </div>
            {canEdit && <SectionEditButton />}
          </div>

          <div className="flex flex-wrap gap-3 pl-[64px]">
            {business.socialLinks?.facebook && (
              <SocialIcon
                href={business.socialLinks.facebook}
                type="facebook"
              />
            )}
            {business.socialLinks?.twitter && (
              <SocialIcon href={business.socialLinks.twitter} type="twitter" />
            )}
            {business.socialLinks?.linkedin && (
              <SocialIcon
                href={business.socialLinks.linkedin}
                type="linkedin"
              />
            )}
            {business.socialLinks?.instagram && (
              <SocialIcon
                href={business.socialLinks.instagram}
                type="instagram"
              />
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL SUITE --- */}
      {/* 1. Address Modal */}
      <Modal
        isOpen={addressModal.isOpen}
        onClose={addressModal.closeModal}
        className="max-w-[600px] m-4"
      >
        <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl text-start">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave({ address: formData.address }, addressModal);
            }}
            className="p-6 bg-white dark:bg-gray-900 rounded-3xl text-start"
          >
            <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
              Update Registry Location
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Street Address</Label>
                <Input
                  value={formData.address?.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={formData.address?.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>State / Province</Label>
                <Input
                  value={formData.address?.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Postal Code / ZIP</Label>
                <Input
                  value={formData.address?.zipCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label>Country</Label>
                <CountryInput
                  value={formData.address?.country || ""}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, country: val },
                    })
                  }
                  placeholder="Search country registry..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={addressModal.closeModal}
                className="text-[10px] font-semibold uppercase"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="text-[10px] font-semibold uppercase"
              >
                {loading ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* 2. Contact Modal */}
      <Modal
        isOpen={contactModal.isOpen}
        onClose={contactModal.closeModal}
        className="max-w-[450px] m-4"
      >
        <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl text-start">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave({ phoneNumber: formData.phone }, contactModal);
            }}
          >
            <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
              Update Registry Contact
            </h4>

            <Label>Official Phone Number</Label>

            {/* UPDATED: Uses PhoneInput component */}
            <PhoneInput
              country={formData.phone.country}
              value={formData.phone.number}
              onChange={(data) => setFormData({ ...formData, phone: data })}
              placeholder="Phone number"
            />

            <div className="flex justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={contactModal.closeModal}
                className="text-[10px] font-semibold uppercase"
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                className="text-[10px] font-semibold uppercase"
              >
                {loading ? "Saving..." : "Save Contact"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* 3. Socials Modal */}
      <Modal
        isOpen={socialModal.isOpen}
        onClose={socialModal.closeModal}
        className="max-w-[600px] m-2"
      >
        <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl text-start">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(
                {
                  website: formData.website,
                  socialLinks: formData.socialLinks,
                },
                socialModal,
              );
            }}
          >
            <h4 className="my-4 text-md  font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
              Update Digital Connectivity
            </h4>
            <div className="space-y-4">
              <div>
                <Label>Website URL</Label>
                <Input
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={formData.socialLinks?.facebook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          facebook: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Twitter / X</Label>
                  <Input
                    value={formData.socialLinks?.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={formData.socialLinks?.linkedin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          linkedin: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={formData.socialLinks?.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          instagram: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={socialModal.closeModal}
                className="text-[10px] font-semibold uppercase"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="text-[10px] font-semibold uppercase"
              >
                {loading ? "Saving..." : "Save Registry"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
