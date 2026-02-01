import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { businessApi } from "../../apis/business";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import CountryInput from "../../components/form/input/CountryInput";
import CurrencySelect from "../../components/form/CurrencySelect";
import LanguageInput from "../../components/form/LanguageInput";
import { CURRENCIES } from "../../hooks/currencies";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { ChevronLeftIcon } from "../../icons";
import PhoneInput from "../../components/form/group-input/PhoneInput";

// --- Icons ---
const IconIdentity = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);
const IconPresence = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const IconFiscal = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function CreateBusiness() {
  const { t } = useTranslation("business");
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState(1);

  const canGoBack = user?.memberships && user.memberships.length > 0;

  const STEPS = [
    {
      id: 1,
      title: t("create.steps.identity_title"),
      subtitle: t("create.steps.identity_sub"),
      icon: IconIdentity,
    },
    {
      id: 2,
      title: t("create.steps.presence_title"),
      subtitle: t("create.steps.presence_sub"),
      icon: IconPresence,
    },
    {
      id: 3,
      title: t("create.steps.fiscal_title"),
      subtitle: t("create.steps.fiscal_sub"),
      icon: IconFiscal,
    },
  ];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: { country: "US", number: "" },
    address: { street: "", city: "", state: "", zipCode: "", country: "" },
    taxId: "",
    currency: "USD",
    language: "en",
    currencyFormat: {
      digits: 2,
      groupSep: ",",
      decimalSep: ".",
      display: "symbol",
      position: "left",
    },
  });

  const handlePhoneChange = (data: { country: string; number: string }) => {
    setFormData((prev) => ({ ...prev, phone: data }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleCurrencyChange = (newCode: string) => {
    const selected = CURRENCIES.find((c) => c.code === newCode);
    setFormData((prev) => ({
      ...prev,
      currency: newCode,
      currencyFormat: {
        ...prev.currencyFormat,
        digits: selected?.digits ?? 2,
        groupSep: selected?.groupSep ?? ",",
        decimalSep: selected?.decimalSep ?? ".",
      },
    }));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const validateStep = (step: number) => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.name.trim()) {
        errors.name = t("create.errors.name_required");
        isValid = false;
      } else if (formData.name.length < 3) {
        errors.name = t("create.errors.name_short");
        isValid = false;
      }
    }
    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateStep(currentStep)) return;

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setLoading(true);
      try {
        const { business: newBusiness, user: returnedUser } =
          await businessApi.createBusiness(formData);

        const newMembership = {
          businessId: {
            _id: newBusiness._id,
            name: newBusiness.name,
            logo: newBusiness.logo,
          },
          role: "Admin",
          title: "Owner",
        };

        const updatedUser = {
          ...returnedUser,
          memberships: [...(user?.memberships || []), newMembership],
        };

        if (setUser) setUser(updatedUser);
        navigate(`/business/${newBusiness._id}`);
      } catch (err: any) {
        const errorCode = err.message;
        const translatedError = t(
          `create.errors.${errorCode}` as any,
          t("create.errors.generic"),
        );
        setGeneralError(translatedError);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setGeneralError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getInputClass = (field: string) =>
    fieldErrors[field] ? "border-error-500 focus:border-error-500" : "";

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>
                  {t("create.form.name_label")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="name"
                  placeholder={t("create.form.name_placeholder")}
                  value={formData.name}
                  onChange={handleChange}
                  className={getInputClass("name")}
                  autoFocus
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs font-medium text-error-500">
                    {fieldErrors.name}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label>{t("create.form.desc_label")}</Label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder={t("create.form.desc_placeholder")}
                  className="w-full px-4 py-3 text-sm text-gray-700 bg-transparent border border-gray-300 rounded-xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 resize-none"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label>{t("create.form.email_label")}</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("create.form.email_placeholder")}
                />
              </div>
              <div>
                <Label>{t("create.form.phone_label")}</Label>
                <PhoneInput
                  country={formData.phone.country}
                  value={formData.phone.number}
                  onChange={handlePhoneChange}
                  placeholder={t("create.form.phone_placeholder")}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>{t("create.form.address_label")}</Label>
                <Input
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  placeholder={t("create.form.address_placeholder")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                <div>
                  <Label>{t("create.form.city_label")}</Label>
                  <Input
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                  />
                </div>
                <div>
                  <Label>{t("create.form.zip_label")}</Label>
                  <Input
                    name="zipCode"
                    value={formData.address.zipCode}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
              <div>
                <Label>{t("create.form.state_label")}</Label>
                <Input
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                />
              </div>
              <div>
                <Label>{t("create.form.country_label")}</Label>
                <CountryInput
                  value={formData.address.country}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, country: val },
                    })
                  }
                  placeholder={t("create.form.country_label")}
                  className="h-11"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label>{t("create.form.tax_label")}</Label>
                <Input
                  name="taxId"
                  placeholder={t("create.form.tax_placeholder")}
                  value={formData.taxId}
                  onChange={handleChange}
                />
                <p className="mt-2 text-xs text-gray-400">
                  {t("create.form.tax_help")}
                </p>
              </div>

              <div>
                <Label>{t("create.form.currency_label")}</Label>
                <CurrencySelect
                  value={formData.currency}
                  onChange={handleCurrencyChange}
                  className="dark:bg-gray-900"
                />
              </div>

              {/* NEW FORM COMPONENT */}
              <div className="sm:col-span-2">
                <LanguageInput
                  value={formData.language}
                  onChange={(lang) =>
                    setFormData((prev) => ({ ...prev, language: lang }))
                  }
                  label={t("create.form.language_label")}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <PageMeta
        title={t("create.meta.title")}
        description={t("create.meta.description")}
      />
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }`}</style>

      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            {canGoBack && (
              <button
                type="button"
                onClick={() => navigate("/select-business")}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-500"
              >
                <ChevronLeftIcon className="size-5 mr-1" />{" "}
                {t("create.nav.back")}
              </button>
            )}
            <div className="font-black text-xl tracking-tighter text-gray-900 dark:text-white ml-4">
              InvoTrack
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/signin");
            }}
            className="text-xs font-medium text-red-600 uppercase tracking-widest"
          >
            {t("create.nav.sign_out")}
          </button>
        </div>
      </nav>

      <div className="flex flex-col items-center min-h-screen p-6 pt-28 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight sm:text-4xl">
              {STEPS[currentStep - 1].title}
            </h1>
            <p className="mt-2 text-base font-medium text-gray-500">
              {currentStep === 1
                ? t("create.steps.header_desc_1")
                : currentStep === 2
                  ? t("create.steps.header_desc_2")
                  : t("create.steps.header_desc_3")}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-64 flex-shrink-0 sticky top-24 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 p-6">
              {STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 ${idx !== STEPS.length - 1 ? "mb-8" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step.id <= currentStep ? "border-brand-500 text-brand-500 font-semibold" : "border-gray-300 text-gray-400"}`}
                  >
                    {step.id < currentStep ? "✓" : step.id}
                  </div>
                  <span
                    className={`text-sm font-semibold uppercase ${step.id === currentStep ? "text-brand-500" : "text-gray-500"}`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex-1 w-full">
              <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-800 sm:p-10 relative overflow-hidden">
                <form onSubmit={handleSubmit}>
                  {generalError && (
                    <div className="mb-6 p-4 text-sm font-semibold text-white bg-error-500 rounded-xl">
                      {generalError}
                    </div>
                  )}

                  {renderStepContent()}

                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={
                        currentStep === 1
                          ? () => navigate("/select-business")
                          : handleBack
                      }
                      className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-500"
                    >
                      {currentStep === 1
                        ? t("create.actions.cancel")
                        : t("create.actions.back")}
                    </button>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-8 h-12"
                    >
                      {currentStep < 3
                        ? t("create.actions.next")
                        : loading
                          ? t("create.actions.loading")
                          : t("create.actions.submit")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed z-50 bottom-8 right-8">
          <ThemeTogglerTwo />
        </div>
      </div>
    </>
  );
}
