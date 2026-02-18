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
import { CountryData } from "../../hooks/countries";

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
    },
    {
      id: 2,
      title: t("create.steps.presence_title"),
      subtitle: t("create.steps.presence_sub"),
    },
    {
      id: 3,
      title: t("create.steps.fiscal_title"),
      subtitle: t("create.steps.fiscal_sub"),
    },
  ];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: { country: "DE", number: "+49" },
    address: { street: "", city: "", state: "", zipCode: "", country: "DE" },
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
  const placeholderClass =
    "!bg-transparent !placeholder-gray-500 dark:placeholder-gray-400";

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-gray-600 dark:text-gray-300">
                  {t("create.form.name_label")}{" "}
                  <span className="text-error-600 dark:text-error-500">*</span>
                </Label>
                <Input
                  name="name"
                  placeholder={t("create.form.name_placeholder")}
                  value={formData.name}
                  onChange={handleChange}
                  className={` ${getInputClass("name")} ${placeholderClass}`}
                  autoFocus
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs font-mono text-error-600 dark:text-error-400">
                    {fieldErrors.name}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label className="text-gray-600 dark:text-gray-300">
                  {t("create.form.desc_label")}
                </Label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder={t("create.form.desc_placeholder")}
                  className={`w-full px-4 py-3 text-sm text-gray-700 bg-transparent border border-gray-300 rounded-xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all dark:border-gray-700 dark:text-gray-300 resize-none ${placeholderClass}`}
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
            <div>
              <Label className="text-gray-600 dark:text-gray-300">
                {t("create.form.email_label")}
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("create.form.email_placeholder")}
                className={placeholderClass}
              />
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-300">
                {t("create.form.phone_label")}
              </Label>
              <PhoneInput
                country={formData.phone.country}
                value={formData.phone.number}
                onChange={handlePhoneChange}
                placeholder={t("create.form.phone_placeholder")}
                className={placeholderClass}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-gray-600 dark:text-gray-300">
                  {t("create.form.address_label")}
                </Label>
                <Input
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  placeholder={t("create.form.address_placeholder")}
                  className={placeholderClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                <div>
                  <Label className="text-gray-600 dark:text-gray-300">
                    {t("create.form.city_label")}
                  </Label>
                  <Input
                    name="city"
                    value={formData.address.city}
                    onChange={handleAddressChange}
                    className={placeholderClass}
                  />
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-gray-300">
                    {t("create.form.zip_label")}
                  </Label>
                  <Input
                    name="zipCode"
                    value={formData.address.zipCode}
                    onChange={handleAddressChange}
                    className={placeholderClass}
                  />
                </div>
              </div>
              <div>
                <Label>{t("create.form.state_label")}</Label>
                <Input
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  className={placeholderClass}
                />
              </div>
              <div>
                <Label>{t("create.form.country_label")}</Label>
                <CountryInput
                  value={formData.address.country}
                  onChange={(countryData: CountryData) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, country: countryData.code },
                    }))
                  }
                  placeholder={t("create.form.country_label")}
                  className={`h-11 ${placeholderClass}`}
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
                  className={placeholderClass}
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
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } } 
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <nav className="fixed top-0 left-0 right-0 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            {canGoBack && (
              <button
                type="button"
                onClick={() => navigate("/select-business")}
                className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-500"
              >
                <ChevronLeftIcon className="size-5 mr-1" />{" "}
                {t("create.nav.back")}
              </button>
            )}
            <div className="font-black text-xl text-gray-900 dark:text-white ml-4">
              InvoTrack
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/signin");
            }}
            className="text-xs font-medium text-red-600 dark:text-red-400 tracking-widest"
          >
            {t("create.nav.sign_out")}
          </button>
        </div>
      </nav>

      <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 pt-24 lg:pt-32">
        <div className="w-full max-w-7xl">
          <div className="mb-8 lg:mb-12 text-center max-w-2xl mx-auto px-4">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight sm:text-4xl mb-3">
              {STEPS[currentStep - 1].title}
            </h1>
            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300">
              {currentStep === 1
                ? t("create.steps.header_desc_1")
                : currentStep === 2
                  ? t("create.steps.header_desc_2")
                  : t("create.steps.header_desc_3")}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">
            
            {/* Steps Navigation */}
            <div className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-32">
              <div className="flex flex-row lg:flex-col items-center lg:items-start justify-center lg:justify-start gap-4 lg:gap-8 overflow-x-auto no-scrollbar pb-4 lg:pb-0 lg:pl-4 lg:border-l-2 lg:border-gray-100 lg:dark:border-gray-800">
                {STEPS.map((step) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  
                  return (
                    <div
                      key={step.id}
                      className={`relative flex flex-col items-center lg:items-start transition-all duration-300 shrink-0 
                        ${isActive ? "opacity-100 scale-100" : isCompleted ? "opacity-60" : "opacity-40"}`}
                    >
                      {isActive && (
                        <div className="hidden lg:block absolute left-[-18px] top-0 bottom-0 w-[2px] bg-brand-500 rounded-full" />
                      )}
                      
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`lg:hidden flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold 
                          ${isActive ? "bg-brand-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                          {step.id}
                        </div>
                        <div className={`text-[10px] lg:text-sm font-bold uppercase tracking-wider ${isActive ? "text-brand-500" : "text-gray-600 dark:text-gray-300"}`}>
                          {t(`create.steps.step_label`, { step: step.id })}
                        </div>
                      </div>
                      
                      <div className="hidden lg:block text-sm font-semibold text-gray-900 dark:text-white">
                        {step.title}
                      </div>
                      
                      {isActive && (
                        <div className="lg:hidden w-full h-[2px] bg-brand-500 mt-1 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Section */}
            <div className="flex-1 w-full max-w-2xl bg-white dark:bg-gray-900/50 p-4 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none">
              <form onSubmit={handleSubmit} className="relative">
                {generalError && (
                  <div className="mb-6 p-4 text-sm font-semibold text-white bg-error-500 rounded-xl shadow-sm">
                    {generalError}
                  </div>
                )}
                
                <div className="min-h-[300px]">
                   {renderStepContent()}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={
                      currentStep === 1
                        ? () => navigate("/select-business")
                        : handleBack
                    }
                    className="w-full sm:w-auto px-6 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    {currentStep === 1
                      ? t("create.actions.cancel")
                      : t("create.actions.back")}
                  </button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-10 h-12 shadow-lg shadow-brand-500/25"
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
        
        <div className="fixed z-50 bottom-8 right-8">
          <ThemeTogglerTwo />
        </div>
      </div>
    </>
  );
}