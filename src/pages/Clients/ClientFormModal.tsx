import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import CountryInput from "../../components/form/input/CountryInput";
import Label from "../../components/form/Label";
import SelectField from "../../components/form/SelectField"; 
import { clientApi, ClientData } from "../../apis/clients";
import {
  HiOutlineUser,
  HiArrowRight,
  HiCheck,
  HiChevronLeft,
  HiOutlineEnvelope,
  HiMapPin,
  // HiChevronDown removed as it's handled by SelectField
} from "react-icons/hi2";
import PhoneInput from "../../components/form/group-input/PhoneInput";

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  setAlert: (alert: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }) => void;
  onSuccess?: (newClient: ClientData) => void;
}

const INITIAL_STATE = {
  name: "",
  email: "",
  phone: { country: "US", number: "" },
  clientType: "Individual" as "Individual" | "Business",
  taxId: "",
  website: "",
  address: { street: "", city: "", state: "", zipCode: "", country: "" },
};

export default function ClientFormModal({
  isOpen,
  onClose,
  businessId,
  setAlert,
  onSuccess,
}: ClientFormModalProps) {
  const { t } = useTranslation("client");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 3-Step Process
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Validation State
  const [errors, setErrors] = useState<{ name?: string }>({});

  const [formData, setFormData] = useState(INITIAL_STATE);

  // Define Options for SelectField
  const clientTypeOptions = [
    { value: "Individual", label: t("form.options.individual") },
    { value: "Business", label: t("form.options.business") },
  ];

  // Reset form and step when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_STATE);
      setStep(1);
      setErrors({});
    }
  }, [isOpen]);

  const handleNext = (e?: React.FormEvent) => {
    e?.preventDefault();

    // --- STEP 1 VALIDATION: Identity ---
    if (step === 1) {
      if (!formData.name.trim()) {
        setErrors({
          name: t("form.errors.name_required", {
            defaultValue: "Client Name is required.",
          }),
        });
        return;
      }
      setStep(2);
    }
    // --- STEP 2 TRANSITION: Contact -> Location ---
    else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step !== 3) {
      handleNext();
      return;
    }

    setLoading(true);

    try {
      // Create the client
      const result = await clientApi.createClient({ ...formData, businessId });

      setAlert({
        type: "success",
        title: t("messages.CLIENT_CREATED", { defaultValue: "Success" }),
        message: t("messages.CLIENT_CREATED_DESC", {
          defaultValue: "Client registry established successfully.",
        }),
      });

      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(`/business/${businessId}/clients/${result._id}`);
      }
    } catch (error: any) {
      const errorCode = error.message;
      setAlert({
        type: "error",
        title: t("errors.GENERIC_ERROR"),
        message: t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")),
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  // --- STEPPER VISUALS ---
  const renderStepper = () => (
    <div className="flex items-center justify-between mb-8 relative z-10 px-2 mt-2">
      {/* Step 1: Identity */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
            step >= 1
              ? "border-brand-500 bg-brand-500 text-white shadow-brand-500/30 shadow-sm"
              : "border-gray-300 text-gray-400"
          }`}
        >
          <span className="text-xs font-semibold">1</span>
        </div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-widest hidden sm:block ${
            step >= 1 ? "text-brand-500" : "text-gray-400"
          }`}
        >
          {t("form.steps.identity")}
        </span>
      </div>

      {/* Line 1-2 */}
      <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-700 mx-2 relative">
        <div
          className="absolute left-0 top-0 h-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: step >= 2 ? "100%" : "0%" }}
        />
      </div>

      {/* Step 2: Contact */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
            step >= 2
              ? "border-brand-500 bg-brand-500 text-white shadow-brand-500/30 shadow-sm"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400"
          }`}
        >
          <span className="text-xs font-semibold">2</span>
        </div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-widest hidden sm:block ${
            step >= 2 ? "text-brand-500" : "text-gray-400"
          }`}
        >
          {t("form.steps.contact")}
        </span>
      </div>

      {/* Line 2-3 */}
      <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-700 mx-2 relative">
        <div
          className="absolute left-0 top-0 h-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: step === 3 ? "100%" : "0%" }}
        />
      </div>

      {/* Step 3: Location */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
            step === 3
              ? "border-brand-500 bg-brand-500 text-white shadow-brand-500/30 shadow-sm"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400"
          }`}
        >
          <span className="text-xs font-semibold">3</span>
        </div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-widest hidden sm:block ${
            step === 3 ? "text-brand-500" : "text-gray-400"
          }`}
        >
          {t("form.steps.location")}
        </span>
      </div>
    </div>
  );

  const getHeaderIcon = () => {
    if (step === 2) return <HiOutlineEnvelope className="size-6" />;
    if (step === 3) return <HiMapPin className="size-6" />;
    return <HiOutlineUser className="size-6" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] w-full mx-4"
    >
      <div className="p-3 md:p-8 bg-white dark:bg-gray-900 rounded-3xl text-start flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
          <div className="p-3 hidden sm:inline-flex bg-brand-50 dark:bg-brand-500/10 rounded-xl text-brand-500">
            {getHeaderIcon()}
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white uppercase tracking-tight">
              {t("form.title")}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {step === 1 && t("form.subtitle_1")}
              {step === 2 && t("form.subtitle_2")}
              {step === 3 && t("form.subtitle_3")}
            </p>
          </div>
        </div>

        {renderStepper()}

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col relative z-10"
          noValidate={true}
        >
          {/* Step 1: Identity */}
          <div className={step === 1 ? "block fade-in" : "hidden"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.name")}{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </Label>

                <Input
                  autoFocus={isOpen && step === 1}
                  required
                  placeholder={t("form.placeholders.name")}
                  value={formData.name}
                  error={!!errors.name}
                  hint={errors.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                />
              </div>

              <div>
                {/* Replaced native Select with SelectField */}
                <SelectField
                  label={t("form.fields.classification")}
                  value={formData.clientType}
                  onChange={(val) =>
                    setFormData({ ...formData, clientType: val as any })
                  }
                  options={clientTypeOptions}
                />
              </div>

              <div>
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.tax_id")}
                </Label>
                <Input
                  placeholder={t("form.placeholders.tax_id")}
                  value={formData.taxId}
                  onChange={(e) =>
                    setFormData({ ...formData, taxId: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Step 2: Contact Details */}
          <div className={step === 2 ? "block fade-in" : "hidden"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.email")}
                </Label>
                <Input
                  autoFocus={step === 2}
                  type="email"
                  placeholder={t("form.placeholders.email")}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.phone")}
                </Label>
                <PhoneInput
                  country={formData.phone.country}
                  value={formData.phone.number}
                  onChange={(data) => setFormData({ ...formData, phone: data })}
                  placeholder={t("form.placeholders.phone")}
                />
              </div>

              <div className="md:col-span-2">
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.website")}
                </Label>
                <Input
                  placeholder={t("form.placeholders.website")}
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Step 3: Location (Address) */}
          <div className={step === 3 ? "block fade-in" : "hidden"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.street")}
                </Label>
                <Input
                  autoFocus={step === 3}
                  placeholder={t("form.placeholders.street")}
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.city")}
                </Label>
                <Input
                  placeholder={t("form.placeholders.city")}
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.state")}
                </Label>
                <Input
                  placeholder={t("form.placeholders.state")}
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.zip")}
                </Label>
                <Input
                  placeholder={t("form.placeholders.zip")}
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.country")}
                </Label>
                <CountryInput
                  value={formData.address.country}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, country: val },
                    })
                  }
                />
              </div>
            </div>
          </div>
          {/* Footer Actions */}
          <div className="mt-auto pt-6 flex justify-end gap-4 items-center">
            {step === 1 ? (
              <Button
                type="button"
                variant="outline"
                className="text-[10px] font-semibold uppercase tracking-widest px-6"
                onClick={onClose}
              >
                {t("common:actions.cancel", { defaultValue: "Cancel" })}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="text-[10px] font-semibold uppercase tracking-widest px-6 flex items-center gap-2 group"
                onClick={handleBack}
              >
                <HiChevronLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
                {t("common:actions.back", { defaultValue: "Back" })}
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="submit"
                onClick={handleNext}
                className="text-[10px] font-semibold uppercase tracking-widest px-8 flex items-center gap-2 group"
              >
                {t("form.actions.next")}{" "}
                <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="text-[10px] font-semibold uppercase tracking-widest px-8 flex items-center gap-2"
              >
                {loading ? (
                  t("form.actions.processing")
                ) : (
                  <>
                    {t("form.actions.submit")} <HiCheck className="text-lg" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}