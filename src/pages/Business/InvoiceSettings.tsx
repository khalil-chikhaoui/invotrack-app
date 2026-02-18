import { useState, useEffect, useMemo, memo } from "react";
import { useParams } from "react-router";
import { BlobProvider } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import {
  businessApi,
  InvoiceSettings as IInvoiceSettings,
  BusinessData,
} from "../../apis/business";
import { InvoiceData } from "../../apis/invoices";
import InvoicePDF from "../../components/invoices/templates/InvoicePDF";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import CustomAlert from "../../components/common/CustomAlert";
import PermissionDenied from "../../components/common/PermissionDenied";
import LoadingState from "../../components/common/LoadingState";
import { HiOutlineCheckCircle, HiArrowPath } from "react-icons/hi2";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";
import TextArea from "../../components/form/input/TextArea";

// Constants
export const DEFAULT_COLORS = {
  primary: "#231f70",
  secondary: "#5c16b1",
  accent: "#bc1010",
};
const DEFAULT_VISIBILITY = {
  showLogo: true,
  showTaxId: true,
  showDueDate: true,
  showDiscount: true,
  showNotes: false,
  showPaymentTerms: true,
  showFooter: false,
};

const DUMMY_LOGO_URL =
  "https://placehold.co/200x200/231f70/FFFFFF.png?text=LOGO";

const ResetButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 hover:text-brand-500 transition-colors cursor-pointer"
    title={label}
  >
    <HiArrowPath className="size-3.5 group-hover:rotate-180 transition-transform duration-500" />
    {label}
  </button>
);

const MemoizedPDFPreview = memo(
  ({
    business,
    invoice,
    loadingText,
    errorText,
  }: {
    business: any;
    invoice: any;
    loadingText: string;
    errorText: string;
  }) => {
    return (
      <BlobProvider
        document={<InvoicePDF invoice={invoice} business={business} />}
      >
        {({ url, loading, error }) => {
          if (loading)
            return <LoadingState message={loadingText} minHeight="30vh" />;
          if (error)
            return (
              <div className="w-full h-full flex items-center justify-center text-red-500 text-sm font-semibold uppercase tracking-widest">
                {errorText}
              </div>
            );
          return (
            <iframe
              src={`${url}#toolbar=0&navpanes=0&view=FitH`}
              className="w-full h-full border-0 rounded-sm"
              title="Invoice Preview"
            />
          );
        }}
      </BlobProvider>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.business.invoiceSettings) ===
        JSON.stringify(nextProps.business.invoiceSettings) &&
      prevProps.business.language === nextProps.business.language &&
      prevProps.business.logo === nextProps.business.logo
    );
  },
);

export default function InvoiceSettings() {
  const { t } = useTranslation("business");
  const { businessId } = useParams();
  const { canManageSettings } = usePermissions();
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { alert, setAlert } = useAlert();

  const [realBusinessData, setRealBusinessData] = useState<BusinessData | null>(
    null,
  );

  const [settings, setSettings] = useState<IInvoiceSettings>({
    template: "Classic",
    color: DEFAULT_COLORS,
    logoSize: "Medium",
    visibility: DEFAULT_VISIBILITY,
    paymentTerms: "",
    footerNote: "",
  });

  const previewInvoice: InvoiceData = useMemo(
    () => ({
      _id: "preview_id",
      businessId: "preview_biz",
      invoiceNumber: "INV-001",
      clientSnapshot: {
        name: "preview.client_name",
        email: "billing@acme.com",
        address: {
          street: "42 Innovation Dr",
          city: "San Francisco",
          zipCode: "94103",
          country: "USA",
        },
      },
      items: [
        {
          itemId: "1",
          name: "preview.items.consulting",
          quantity: 10,
          price: 150,
          total: 1500,
        },
        {
          itemId: "2",
          name: "preview.items.ui_ux",
          quantity: 1,
          price: 2500,
          total: 2500,
        },
        {
          itemId: "3",
          name: "preview.items.maintenance",
          quantity: 5,
          price: 100,
          total: 500,
        },
        {
          itemId: "4",
          name: "preview.items.product",
          quantity: 2,
          price: 250,
          total: 500,
        },
        {
          itemId: "5",
          name: "preview.items.development",
          quantity: 6,
          price: 200,
          total: 1200,
        },
      ],
      subTotal: 6200,
      discountType: "percentage",
      discountValue: 10,
      totalDiscount: 620,
      taxRate: 10,
      totalTax: 558,
      grandTotal: 6138,
      isPaid: false,
      isDeleted: false,
      deliveryStatus: "Pending",
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      issueDate: new Date(Date.now()).toISOString(),
      createdBy: { _id: "user", name: "Admin" },
      updatedAt: new Date().toISOString(),
      notes: "preview.notes",
    }),
    [],
  );

  useEffect(() => {
    if (!businessId || !canManageSettings) return;
    businessApi
      .getBusiness(businessId)
      .then((data) => {
        setRealBusinessData(data);
        if (data.invoiceSettings) {
          setSettings((prev) => ({
            ...prev,
            ...data.invoiceSettings,
            visibility: {
              ...prev.visibility,
              ...(data.invoiceSettings?.visibility || {}),
            },
          }));
        }
      })
      .catch((err) => {
        setAlert({
          type: "error",
          title: t("errors.GENERIC_ERROR"),
          message: t(`errors.${err.message}` as any, t("errors.GENERIC_ERROR")),
        });
      })
      .finally(() => setInitialLoading(false));
  }, [businessId, canManageSettings, t, setAlert]);

  if (!canManageSettings)
    return (
      <PermissionDenied
        title={t("errors.ACCESS_DENIED_ADMIN_ONLY")}
        description={t("settings.general.locked_desc")}
        actionText={t("create.nav.back")}
      />
    );

  const saveSettings = async (newSettings: IInvoiceSettings) => {
    if (!businessId) return;
    setSaving(true);
    setSettings(newSettings);
    try {
      await businessApi.updateInvoiceSettings(businessId, newSettings);
      setAlert({
        type: "success",
        title: t("messages.SETTINGS_SAVED"),
        message: t("messages.INVOICE_SETTINGS_UPDATED"),
      });
      setTimeout(() => setAlert(null), 1500);
    } catch (error: any) {
      setAlert({
        type: "error",
        title: t("errors.UPDATE_FAILED"),
        message: t(`errors.${error.message}` as any, t("errors.GENERIC_ERROR")),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (template: any) =>
    saveSettings({ ...settings, template });
  const handleColorChange = (
    key: "primary" | "secondary" | "accent",
    value: string,
  ) => {
    setSettings({ ...settings, color: { ...settings.color, [key]: value } });
  };
  const saveColorFinal = () => saveSettings(settings);
  const toggleVisibility = (field: keyof IInvoiceSettings["visibility"]) => {
    const newVisibility = {
      ...settings.visibility,
      [field]: !settings.visibility[field],
    };
    saveSettings({ ...settings, visibility: newVisibility });
  };
  const handleFooterChange = (val: string) => {
    if (val.length <= 100) setSettings({ ...settings, footerNote: val });
  };
  const resetBranding = () =>
    saveSettings({ ...settings, color: DEFAULT_COLORS, logoSize: "Medium" });
  const resetVisibility = () =>
    saveSettings({ ...settings, visibility: DEFAULT_VISIBILITY });

  const previewBusinessObject = useMemo(() => {
    if (!realBusinessData) return null;
    return {
      ...realBusinessData,
      logo: realBusinessData.logo || DUMMY_LOGO_URL,
      invoiceSettings: settings,
    };
  }, [realBusinessData, settings]);

  if (initialLoading)
    return (
      <LoadingState
        message={t("settings.invoice_design.loading_config")}
        minHeight="50vh"
      />
    );

  const getVisibilityLabel = (key: string) => {
    const cleanKey = key.replace("show", "");
    return t(`settings.invoice_design.visibility.${cleanKey}` as any, cleanKey);
  };

  return (
    <>
      <PageMeta
        title={t("settings.invoice_design.title") + " | Invotrack"}
        description={t("settings.invoice_design.description")}
      />
      <PageBreadcrumb pageTitle={t("settings.invoice_design.breadcrumb")} />
      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-start">
        <div className="xl:col-span-4 space-y-6">
          {/* Template Selection */}
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/5 ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
                {t("settings.invoice_design.style_title")}
              </h3>
              {saving && (
                <span className="text-[10px] font-semibold text-brand-500 animate-pulse uppercase tracking-widest">
                  {t("settings.invoice_design.actions.saving")}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {["Classic", "Minimal", "Modern", "Receipt"].map(
                (templateName) => (
                  <div
                    key={templateName}
                    onClick={() => handleTemplateChange(templateName)}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all ${
                      settings.template === templateName
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-500"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${settings.template === templateName ? "text-brand-600 dark:text-brand-400" : "text-gray-600 dark:text-gray-300"}`}
                    >
                      {t(
                        `settings.invoice_design.templates.${templateName}` as any,
                        templateName,
                      )}
                    </span>
                    {settings.template === templateName && (
                      <HiOutlineCheckCircle className="size-5 text-brand-500" />
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Hide Branding, Footer, and Visibility sections if Receipt is selected */}
          {settings.template !== "Receipt" && (
            <>
              {/* Branding */}
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
                    {t("settings.invoice_design.branding_title")}
                  </h3>
                  <ResetButton
                    onClick={resetBranding}
                    label={t("settings.invoice_design.actions.reset")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("settings.invoice_design.colors.primary")}</Label>
                    <div className="flex items-center gap-3 h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent">
                      <input
                        type="color"
                        value={settings.color.primary}
                        onChange={(e) =>
                          handleColorChange("primary", e.target.value)
                        }
                        onBlur={saveColorFinal}
                        className="h-6 w-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-medium uppercase text-gray-900 dark:text-white">
                        {settings.color.primary}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>{t("settings.invoice_design.colors.accent")}</Label>
                    <div className="flex items-center gap-3 h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent">
                      <input
                        type="color"
                        value={settings.color.accent}
                        onChange={(e) =>
                          handleColorChange("accent", e.target.value)
                        }
                        onBlur={saveColorFinal}
                        className="h-6 w-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-medium uppercase text-gray-900 dark:text-white">
                        {settings.color.accent}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
                    {t("settings.invoice_design.footer_title")}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${(settings.footerNote?.length || 0) >= 100 ? "bg-red-50 text-red-600 border-red-100" : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400"}`}
                  >
                    {settings.footerNote?.length || 0} / 100
                  </span>
                </div>
                <Label>{t("settings.invoice_design.footer_note_label")}</Label>
                <TextArea
                  value={settings.footerNote || ""}
                  onChange={handleFooterChange}
                  onBlur={() => saveSettings(settings)}
                  rows={3}
                  placeholder={t(
                    "settings.invoice_design.footer_placeholder",
                    "e.g. Thank you for your business!",
                  )}
                  error={(settings.footerNote?.length || 0) >= 100}
                />
                <p className="mt-1.5 text-[10px] text-gray-400">
                  {t("settings.invoice_design.footer_helper")}
                </p>
              </div>

              {/* Visibility Controls */}
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/5 ">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
                    {t("settings.invoice_design.fields_title")}
                  </h3>
                  <ResetButton
                    onClick={resetVisibility}
                    label={t("settings.invoice_design.actions.reset")}
                  />
                </div>
                <div className="space-y-2">
                  {Object.keys(settings.visibility)
                    .filter((k) => k !== "showSignature")
                    .map((key) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase truncate pr-2">
                          {getVisibilityLabel(key)}
                        </span>
                        <button
                          onClick={() => toggleVisibility(key as any)}
                          className={`shrink-0 p-1.5 rounded-md transition-colors ${settings.visibility[key as keyof typeof settings.visibility] ? "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400" : "bg-gray-100 text-gray-400 dark:bg-white/10"}`}
                        >
                          {settings.visibility[
                            key as keyof typeof settings.visibility
                          ] ? (
                            <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                          ) : (
                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                          )}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Preview PDF */}
        <div className="xl:col-span-8 flex justify-center">
          <div className="w-full sticky top-6">
            <div
              className={`w-full bg-white dark:bg-gray-800 rounded-sm  border border-gray-200 dark:border-gray-700 overflow-hidden relative transition-all duration-500 ${settings.template === "Receipt" ? "max-w-[320px] aspect-[80/160]" : "aspect-[210/297]"}`}
            >
              {previewBusinessObject ? (
                <MemoizedPDFPreview
                  invoice={previewInvoice}
                  business={previewBusinessObject}
                  loadingText={t("settings.invoice_design.loading_pdf")}
                  errorText={t("settings.invoice_design.preview_error")}
                />
              ) : (
                <LoadingState
                  message={t("settings.invoice_design.preparing_config")}
                  minHeight="full"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
