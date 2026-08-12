import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { businessApi } from "../../apis/business";
import { useAuth, User, Membership } from "../../context/AuthContext";
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
      display: "symbol" as "symbol" | "code",
      position: "left" as "left" | "right",
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
        const newMembership: Membership = {
          businessId: {
            _id: newBusiness._id,
            name: newBusiness.name,
            logo: newBusiness.logo,
          },
          role: "Admin",
          title: "Owner",
        };
        const updatedUser: User = {
          ...(returnedUser as unknown as User),
          memberships: [...(user?.memberships || []), newMembership],
        };
        if (setUser) setUser(updatedUser);
        navigate(`/business/${newBusiness._id}`);
      } catch (err) {
        const errorCode = err instanceof Error ? err.message : String(err);
        const translatedError = t(
          `create.errors.${errorCode}`,
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
                <Label className="text-gray-700 dark:text-gray-300">
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
                <Label className="text-gray-700 dark:text-gray-300">
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
              <Label className="text-gray-700 dark:text-gray-300">
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
              <Label className="text-gray-700 dark:text-gray-300">
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
                <Label className="text-gray-700 dark:text-gray-300">
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
                  <Label className="text-gray-700 dark:text-gray-300">
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
                  <Label className="text-gray-700 dark:text-gray-300">
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
                <p className="mt-2 text-xs text-gray-500">
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
      
      {/* Main Layout Container */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
        
        {/* Top Actions Row */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-8 lg:mb-12">
          {canGoBack ? (
            <button
              type="button"
              onClick={() => navigate("/select-business")}
              className="flex items-center text-sm font-bold text-gray-500 hover:text-brand-500 transition-colors"
            >
              <ChevronLeftIcon className="size-5 mr-1" />
              {t("create.nav.back")}
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/signin");
            }}
            className="text-xs font-bold text-error-500 hover:text-error-600 tracking-widest transition-colors uppercase"
          >
            {t("create.nav.sign_out")}
          </button>
        </div>

        {/* Central Card */}
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 p-6 sm:p-10 lg:p-12">
          
          {/* Header Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight sm:text-4xl mb-3">
              {STEPS[currentStep - 1].title}
            </h1>
            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
              {currentStep === 1
                ? t("create.steps.header_desc_1")
                : currentStep === 2
                  ? t("create.steps.header_desc_2")
                  : t("create.steps.header_desc_3")}
            </p>
          </div>

          {/* Horizontal Stepper */}
          <div className="flex items-center justify-between mb-12 relative px-2 sm:px-6">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-gray-100 dark:bg-gray-800 rounded-full z-0" />
            <div 
              className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-brand-500 rounded-full z-0 transition-all duration-500" 
              style={{ width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 48px)` }}
            />
            
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 bg-white dark:bg-gray-900 px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                    ${isActive ? "border-brand-500 bg-brand-500 text-white" : 
                      isCompleted ? "border-brand-500 bg-white dark:bg-gray-900 text-brand-500" : 
                      "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500"}`}
                  >
                    {step.id}
                  </div>
                  <span className={`hidden sm:block text-xs font-bold uppercase tracking-wider
                    ${isActive || isCompleted ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"}`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="relative">
            {generalError && (
              <div className="mb-8 p-4 text-sm font-semibold text-white bg-error-500 rounded-xl">
                {generalError}
              </div>
            )}
            
            <div className="min-h-[250px]">
               {renderStepContent()}
            </div>

            {/* Footer Actions */}
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-6">
              <button
                type="button"
                onClick={currentStep === 1 ? () => navigate("/select-business") : handleBack}
                className="w-full sm:w-auto py-3 sm:px-2 sm:py-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {currentStep === 1 ? t("create.actions.cancel") : t("create.actions.back")}
              </button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-10 h-12"
              >
                {currentStep < 3 ? t("create.actions.next") : loading ? t("create.actions.loading") : t("create.actions.submit")}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="fixed z-50 bottom-8 right-8">
          <ThemeTogglerTwo />
        </div>
      </div>
    </>
  );
}