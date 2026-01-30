import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { businessApi, BusinessData, CurrencyFormat } from "../../apis/business";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CurrencySelect from "../../components/form/CurrencySelect";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import ComponentCard from "../../components/common/ComponentCard";
import CustomAlert from "../../components/common/CustomAlert";
import PermissionDenied from "../../components/common/PermissionDenied";
import LoadingState from "../../components/common/LoadingState"; // Integrated Loader
import { CURRENCIES } from "../../hooks/currencies";
import { formatMoney } from "../../hooks/formatMoney";
import { useAlert } from "../../hooks/useAlert";
import { usePermissions } from "../../hooks/usePermissions";

export default function BusinessCurrency() {
  const { businessId } = useParams();
  const { canManageSettings } = usePermissions();

  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const { alert, setAlert } = useAlert(2000);

  // --- Financial States ---
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [format, setFormat] = useState<CurrencyFormat>({
    display: "symbol",
    position: "left",
    digits: 2,
    groupSep: ",",
    decimalSep: ".",
  });

  /**
   * Data Fetching
   */
  const fetchBusiness = async () => {
    try {
      const data = await businessApi.getBusiness(businessId!);
      setBusiness(data);
      setCurrencyCode(data.currency || "USD");

      if (data.currencyFormat) {
        setFormat({
          display: data.currencyFormat.display || "symbol",
          position: data.currencyFormat.position || "left",
          digits: data.currencyFormat.digits ?? 2,
          groupSep: data.currencyFormat.groupSep || ",",
          decimalSep: data.currencyFormat.decimalSep || ".",
        });
      }
    } catch (error) {
      console.error("Critical: Failed to load business data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageSettings) fetchBusiness();
    else setLoading(false);
  }, [businessId, canManageSettings]);

  /**
   * Handler: Currency Change
   */
  const handleCurrencyChange = (newCode: string) => {
    setCurrencyCode(newCode);
    const selected = CURRENCIES.find((c) => c.code === newCode);
    if (selected) {
      setFormat((prev) => ({
        ...prev,
        digits: selected.digits,
        groupSep: selected.groupSep,
        decimalSep: selected.decimalSep,
      }));
    }
  };

  /**
   * Handler: Save Configuration
   */
  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await businessApi.updateBusiness(businessId!, {
        currency: currencyCode,
        currencyFormat: format,
      });
      await fetchBusiness(); // Refresh local data

      setAlert({
        type: "success",
        title: "Success",
        message: "Financial formatting settings saved successfully.",
      });

      setTimeout(() => setAlert(null), 4000);
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  // --- Render Gates ---

  if (loading) {
    return (
      
      <LoadingState 
        message="Fetching currency profile..." 
        minHeight="60vh" 
      />
    );
  }

  if (!canManageSettings) {
    return (
      <PermissionDenied
        title="Financial Settings Locked"
        description="Currency and numbering formats are critical financial settings restricted to Administrators."
        actionText="Return to Dashboard"
      />
    );
  }

  return (
    <>
      <PageMeta
        title="Currency Settings"
        description="Manage financial formatting"
      />
      <PageBreadcrumb pageTitle="Currency & Formatting" />

      <CustomAlert data={alert} onClose={() => setAlert(null)} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main Configuration Card */}
        <div className="xl:col-span-2 space-y-6">
          <ComponentCard title="Currency Configuration">
            <div className="space-y-6">
              <div>
                <Label>Primary Currency</Label>
                <CurrencySelect
                  value={currencyCode}
                  onChange={handleCurrencyChange}
                  className="dark:bg-gray-900"
                />
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800"></div>

              {/* Number Format Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <Label>Decimal Places</Label>
                  <Select
                    options={[
                      { value: "0", label: "0 (e.g. 100)" },
                      { value: "2", label: "2 (e.g. 100.00)" },
                      { value: "3", label: "3 (e.g. 100.000)" },
                      { value: "4", label: "4 (Precision)" },
                    ]}
                    onChange={(val) =>
                      setFormat({ ...format, digits: parseInt(val) })
                    }
                    defaultValue={format.digits.toString()}
                  />
                </div>
                <div>
                  <Label>Thousands Separator</Label>
                  <Select
                    options={[
                      { value: ",", label: "Comma (1,000)" },
                      { value: ".", label: "Dot (1.000)" },
                      { value: " ", label: "Space (1 000)" },
                      { value: "'", label: "Apostrophe (1'000)" },
                    ]}
                    onChange={(val) => setFormat({ ...format, groupSep: val })}
                    defaultValue={format.groupSep}
                  />
                </div>
                <div>
                  <Label>Decimal Separator</Label>
                  <Select
                    options={[
                      { value: ".", label: "Dot (0.99)" },
                      { value: ",", label: "Comma (0,99)" },
                    ]}
                    onChange={(val) =>
                      setFormat({ ...format, decimalSep: val })
                    }
                    defaultValue={format.decimalSep}
                  />
                </div>
              </div>

              {/* Symbol Styling & Positioning */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label>Symbol Mode</Label>
                  <div className="flex gap-4 mt-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={format.display === "symbol"}
                        onChange={() =>
                          setFormat({ ...format, display: "symbol" })
                        }
                        className="sr-only peer"
                      />
                      <div className="px-4 py-2 text-sm border rounded-lg text-gray-700 dark:text-white peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-600 dark:peer-checked:bg-brand-500/10 dark:border-gray-700 transition-all">
                        Symbol (
                        {
                          CURRENCIES.find((c) => c.code === currencyCode)
                            ?.symbol
                        }
                        )
                      </div>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={format.display === "code"}
                        onChange={() =>
                          setFormat({ ...format, display: "code" })
                        }
                        className="sr-only peer"
                      />
                      <div className="px-4 py-2 text-sm border rounded-lg text-gray-700 dark:text-white peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-600 dark:peer-checked:bg-brand-500/10 dark:border-gray-700 transition-all">
                        Code ({currencyCode})
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Symbol Position</Label>
                  <div className="flex gap-4 mt-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={format.position === "left"}
                        onChange={() =>
                          setFormat({ ...format, position: "left" })
                        }
                        className="sr-only peer"
                      />
                      <div className="px-4 py-2 text-sm border rounded-lg text-gray-700 dark:text-white peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-600 dark:peer-checked:bg-brand-500/10 dark:border-gray-700 transition-all">
                        Left ($100)
                      </div>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={format.position === "right"}
                        onChange={() =>
                          setFormat({ ...format, position: "right" })
                        }
                        className="sr-only peer"
                      />
                      <div className="px-4 py-2 text-sm border rounded-lg text-gray-700 dark:text-white peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-600 dark:peer-checked:bg-brand-500/10 dark:border-gray-700 transition-all">
                        Right (100$)
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving Changes..." : "Update Configuration"}
                </Button>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Sidebar: Live Preview */}
        <div className="xl:col-span-1 space-y-6">
          <div className="sticky top-24">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Live Preview
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                How amounts will appear on your invoices.
              </p>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Total Amount
                </span>
                <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {formatMoney(1234567.89, currencyCode, format)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}