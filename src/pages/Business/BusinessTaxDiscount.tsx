import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next"; 
import { businessApi, BusinessData } from "../../apis/business";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import NumericInput from "../../components/form/input/NumericInput";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import ComponentCard from "../../components/common/ComponentCard";
import CustomAlert from "../../components/common/CustomAlert";
import PermissionDenied from "../../components/common/PermissionDenied";
import LoadingState from "../../components/common/LoadingState";
import { formatMoney } from "../../hooks/formatMoney";
import { HiOutlineReceiptPercent, HiOutlineTicket } from "react-icons/hi2";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";
import { scrollToTopAppLayout } from "../../layout/AppLayout";

export default function BusinessTaxDiscount() {
  const { t } = useTranslation("business");
  const { businessId } = useParams();
  const { canManageSettings } = usePermissions();

  // --- UI & Data States ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const { alert, setAlert } = useAlert();

  // --- Fiscal Form State ---
  const [taxRate, setTaxRate] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );

  useEffect(() => {
    if (canManageSettings) {
      businessApi
        .getBusiness(businessId!)
        .then((data) => {
          setBusiness(data);
          setTaxRate(data.defaultTaxRate || 0);
          setDiscountValue(data.defaultDiscount?.value || 0);
          setDiscountType(data.defaultDiscount?.type || "percentage");
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [businessId, canManageSettings]);

  /**
   * Persists the fiscal configuration to the server.
   */
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setSaving(true);
    setAlert(null);
    try {
      await businessApi.updateBusiness(businessId!, {
        defaultTaxRate: taxRate,
        defaultDiscount: {
          value: discountValue,
          type: discountType,
        },
      });
      setAlert({
        type: "success",
        title: t("messages.SETTINGS_SAVED"),
        message: t("messages.BUSINESS_UPDATED"),
      });
      setTimeout(() => setAlert(null), 4000);
    } catch (error: any) {
      const errorCode = error.message;
      setAlert({
        type: "error",
        title: t("errors.UPDATE_FAILED"),
        message: t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")),
      });
    } finally {
      setSaving(false);
      scrollToTopAppLayout()
    }
  };

  if (loading) {
    return (
      <LoadingState
        message={t("settings.tax_discount.loading")}
        minHeight="50vh"
      />
    );
  }

  if (!canManageSettings) {
    return (
      <PermissionDenied
        title={t("settings.tax_discount.locked_title")}
        description={t("settings.tax_discount.locked_desc")}
        actionText={t("create.nav.back")}
      />
    );
  }

  const sampleSubtotal = 1000;
  const simulatedDiscount =
    discountType === "percentage"
      ? sampleSubtotal * (discountValue / 100)
      : discountValue;
  const simulatedTax = (sampleSubtotal - simulatedDiscount) * (taxRate / 100);
  const simulatedTotal = sampleSubtotal - simulatedDiscount + simulatedTax;

  const formattedSample = formatMoney(
    sampleSubtotal,
    business?.currency || "USD",
    business?.currencyFormat,
  );

  return (
    <>
      <PageMeta
        description={t("settings.tax_discount.meta_desc")}
        title={`${t("settings.tax_discount.title")} | Invotrack`}
      />
      <PageBreadcrumb pageTitle={t("settings.tax_discount.breadcrumb")} />

      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 text-start">
        <div className="xl:col-span-2 space-y-6">
          <ComponentCard
            title={t("settings.tax_discount.main_card_title")}
            desc={t("settings.tax_discount.main_card_desc")}
          >
            {/* Wrap the fields in a form */}
            <form onSubmit={handleSave} className="space-y-8">
              {/* Default Tax Configuration */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <HiOutlineReceiptPercent className="text-brand-500 size-5" />
                  <span className="text-gray-600 dark:text-gray-300">{t("settings.tax_discount.tax_label")}</span>
                </Label>
                <div className="max-w-xs relative">
                  <NumericInput
                    variant="quantity"
                    value={taxRate}
                    onChange={(val) => setTaxRate(Number(val))}
                    className="pr-10 bg-gray-50 dark:bg-gray-800/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold pointer-events-none">
                    %
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 font-medium italic">
                  {t("settings.tax_discount.tax_help")}
                </p>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800"></div>

              {/* Default Discount Configuration */}
              <div>
                <Label className="flex items-center gap-2 mb-4">
                  <HiOutlineTicket className="text-brand-500 size-5" />
                  <span className="text-gray-600 dark:text-gray-300">{t("settings.tax_discount.discount_label")}</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-gray-600 dark:text-gray-300">{t("settings.tax_discount.value_label")}</Label>
                    <NumericInput
                      variant={
                        discountType === "percentage" ? "quantity" : "currency"
                      }
                      value={discountValue}
                      onChange={(val) => setDiscountValue(Number(val))}
                      className="bg-gray-50 dark:bg-gray-800/50"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-gray-300">{t("settings.tax_discount.mode_label")}</Label>
                    <Select
                      options={[
                        {
                          value: "percentage",
                          label: t("settings.tax_discount.mode_percentage"),
                        },
                        {
                          value: "fixed",
                          label: t("settings.tax_discount.mode_fixed"),
                        },
                      ]}
                      onChange={(val) => setDiscountType(val as any)}
                      defaultValue={discountType}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="submit"
                  disabled={saving}
                  className="shadow-lg shadow-brand-500/20"
                >
                  {saving
                    ? t("settings.tax_discount.actions.updating")
                    : t("settings.tax_discount.actions.save")}
                </Button>
              </div>
            </form>
          </ComponentCard>
        </div>

        {/* Dynamic Calculation Sidebar */}
        <div className="xl:col-span-1">
          <div className="sticky top-24">
            <div className="rounded-2xl border border-gray-200  p-6 shadow-sm dark:border-gray-800 ">
              <h3 className="text-lg font-semibold dark:text-white mb-2 uppercase tracking-tight">
                {t("settings.tax_discount.sandbox.title")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 italic">
                {t("settings.tax_discount.sandbox.desc", {
                  amount: formattedSample,
                })}
              </p>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {t("settings.tax_discount.sandbox.subtotal")}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {formatMoney(
                      sampleSubtotal,
                      business?.currency || "USD",
                      business?.currencyFormat,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {t("settings.tax_discount.sandbox.discount")} (
                    {discountType === "percentage"
                      ? `${discountValue}%`
                      : t("settings.tax_discount.sandbox.fixed")}
                    )
                  </span>
                  <span className="font-semibold text-error-500">
                    -
                    {formatMoney(
                      simulatedDiscount,
                      business?.currency || "USD",
                      business?.currencyFormat,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {t("settings.tax_discount.sandbox.tax")} ({taxRate}%)
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    +
                    {formatMoney(
                      simulatedTax,
                      business?.currency || "USD",
                      business?.currencyFormat,
                    )}
                  </span>
                </div>
                <div className="pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                    {t("settings.tax_discount.sandbox.estimated_total")}
                  </span>
                  <div className="text-3xl font-black text-brand-600 dark:text-brand-400">
                    {formatMoney(
                      simulatedTotal,
                      business?.currency || "USD",
                      business?.currencyFormat,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
