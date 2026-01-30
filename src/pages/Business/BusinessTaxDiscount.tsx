/**
 * @fileoverview BusinessTaxDiscount Component
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router";
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

export default function BusinessTaxDiscount() {
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
    // Prevent default form submission behavior
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
        title: "Rules Updated",
        message: "Default tax and discount configurations saved successfully.",
      });
      setTimeout(() => setAlert(null), 4000);
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Update Failed",
        message: error.message || "Failed to persist fiscal rules.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LoadingState message="Initialising Fiscal Rules..." minHeight="50vh" />
    );
  }

  if (!canManageSettings) {
    return (
      <PermissionDenied
        title="Fiscal Access Denied"
        description="Only Business Administrators are authorised to modify global tax and discount rules."
        actionText="Return to Dashboard"
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

  return (
    <>
      <PageMeta
        description="Manage global tax and discount defaults."
        title="Fiscal Rules"
      />
      <PageBreadcrumb pageTitle="Tax & Discount Defaults" />

      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 text-start">
        <div className="xl:col-span-2 space-y-6">
          <ComponentCard
            title="Invoicing Defaults"
            desc="Automatically applied to all newly generated invoices."
          >
            {/* Wrap the fields in a form */}
            <form onSubmit={handleSave} className="space-y-8">
              {/* Default Tax Configuration */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <HiOutlineReceiptPercent className="text-brand-500 size-5" />
                  Standard Tax Rate
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
                <p className="mt-2 text-xs text-gray-500 font-medium italic">
                  Calculated against the subtotal after global discounts are
                  applied.
                </p>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800"></div>

              {/* Default Discount Configuration */}
              <div>
                <Label className="flex items-center gap-2 mb-4">
                  <HiOutlineTicket className="text-brand-500 size-5" />
                  Standard Discount Rule
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>Value</Label>
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
                    <Label>Calculation Mode</Label>
                    <Select
                      options={[
                        { value: "percentage", label: "Percentage (%)" },
                        { value: "fixed", label: "Fixed Currency Value" },
                      ]}
                      onChange={(val) => setDiscountType(val as any)}
                      defaultValue={discountType}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="submit" // Triggers handleSave
                  disabled={saving}
                  className="shadow-lg shadow-brand-500/20"
                >
                  {saving ? "Updating Rules..." : "Save Default Rules"}
                </Button>
              </div>
            </form>
          </ComponentCard>
        </div>

        {/* Dynamic Calculation Sidebar */}
        <div className="xl:col-span-1">
          <div className="sticky top-24">
            {/* Calculation Sidebar code remains the same... */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold dark:text-white mb-2 uppercase tracking-tight">
                Calculation Sandbox
              </h3>
              <p className="text-sm text-gray-500 mb-6 italic">
                Simulating rules against a sample{" "}
                {formatMoney(
                  sampleSubtotal,
                  business?.currency || "USD",
                  business?.currencyFormat,
                )}{" "}
                subtotal.
              </p>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {formatMoney(
                      sampleSubtotal,
                      business?.currency || "USD",
                      business?.currencyFormat,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">
                    Discount (
                    {discountType === "percentage"
                      ? `${discountValue}%`
                      : "Fixed"}
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
                  <span className="text-gray-500 font-medium">
                    Tax ({taxRate}%)
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
                    Estimated Total
                  </span>
                  <div className="text-3xl font-black text-brand-500">
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
