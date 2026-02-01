import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import NumericInput from "../../components/form/input/NumericInput";
import TextArea from "../../components/form/input/TextArea";
import Label from "../../components/form/Label";
import { itemApi, ItemData } from "../../apis/items";
import {
  HiChevronDown,
  HiOutlineCube,
  HiArrowRight,
  HiCheck,
  HiCurrencyDollar,
} from "react-icons/hi2";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemData | null;
  businessId: string;
  refresh: (newItem?: ItemData) => void;
  setAlert: (a: any) => void;
  onSuccess?: (newItem: ItemData) => void;
}

export default function ItemFormModal({
  isOpen,
  onClose,
  item,
  businessId,
  refresh,
  setAlert,
  onSuccess,
}: ItemFormModalProps) {
  const { t } = useTranslation("item");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const isEdit = !!item;
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    itemType: "Product" as "Product" | "Service",
    price: 0,
    cost: 0,
    currentStock: 0,
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      if (item) {
        setFormData({
          name: item.name || "",
          sku: item.sku || "",
          description: item.description || "",
          itemType: item.itemType || "Product",
          price: item.price || 0,
          cost: item.cost || 0,
          currentStock: 0,
        });
      } else {
        setFormData({
          name: "",
          sku: "",
          description: "",
          itemType: "Product",
          price: 0,
          cost: 0,
          currentStock: 0,
        });
      }
    }
  }, [item, isOpen]);

  const handleNext = () => {
    const newErrors: { name?: string; price?: string } = {};
    let hasError = false;

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = t("form.errors.name_required");
        hasError = true;
      }
      setErrors((prev) => ({ ...prev, name: newErrors.name }));
      if (!hasError) setStep(2);
    } else if (step === 2) {
      if (
        formData.price === undefined ||
        formData.price === null ||
        isNaN(formData.price) ||
        formData.price < 0
      ) {
        newErrors.price = t("form.errors.price_required");
        hasError = true;
      }
      setErrors((prev) => ({ ...prev, price: newErrors.price }));
      if (!hasError) setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      handleNext();
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isEdit && item) {
        const { currentStock, ...updateData } = formData;
        result = await itemApi.updateItem(item._id, updateData);
        setAlert({
          type: "success",
          title: "Success",
          message: t("messages.ITEM_UPDATED"),
        });
      } else {
        result = await itemApi.createItem({ ...formData, businessId });
        setAlert({
          type: "success",
          title: "Success",
          message: t("messages.ITEM_CREATED"),
        });
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        refresh();
        if (!isEdit && result && result._id) {
          navigate(`/business/${businessId}/items/${result._id}`);
        }
      }
      onClose();
    } catch (err: any) {
      const errorCode = err.message;
      setAlert({
        type: "error",
        title: "Error",
        message: t(`errors.${errorCode}` as any, t("errors.GENERIC_ERROR")),
      });
    } finally {
      setLoading(false);
    }
  };

  // --- STEPPER VISUALS ---
  const renderStepper = () => (
    <div className="flex items-center justify-between mb-8 relative z-10 px-2 mt-2">
      {[1, 2, 3].map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${step >= s ? "border-brand-500 bg-brand-500 text-white shadow-brand-500/30 shadow-sm" : "border-gray-300 text-gray-400"}`}
            >
              <span className="text-xs font-semibold">{s}</span>
            </div>
            <span
              className={`text-[10px] font-semibold uppercase tracking-widest hidden sm:block ${step >= s ? "text-brand-500" : "text-gray-400"}`}
            >
              {s === 1
                ? t("form.steps.general")
                : s === 2
                  ? t("form.steps.pricing")
                  : t("form.steps.details")}
            </span>
          </div>
          {i < 2 && (
            <div className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-700 mx-2 relative">
              <div
                className="absolute left-0 top-0 h-full bg-brand-500 transition-all duration-500 ease-out"
                style={{ width: step > s ? "100%" : "0%" }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

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
            {step === 2 ? (
              <HiCurrencyDollar className="size-6" />
            ) : (
              <HiOutlineCube className="size-6" />
            )}
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white uppercase tracking-tight">
              {isEdit ? t("form.title_edit") : t("form.title_new")}
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
        >
          {/* STEP 1: General Info */}
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
              <div className={isEdit ? "md:col-span-2" : ""}>
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.sku")}
                </Label>
                <Input
                  placeholder={t("form.placeholders.sku")}
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>
              {!isEdit && (
                <div>
                  <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    {t("form.fields.type")}
                  </Label>
                  <div className="relative">
                    <select
                      className="appearance-none w-full h-11 rounded-xl border border-gray-300 bg-white pl-4 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm font-normal"
                      value={formData.itemType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          itemType: e.target.value as any,
                        })
                      }
                    >
                      <option value="Product">
                        {t("form.options.product")}
                      </option>
                      <option value="Service">
                        {t("form.options.service")}
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-600 dark:text-gray-300">
                      <HiChevronDown className="size-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: Pricing */}
          <div className={step === 2 ? "block fade-in" : "hidden"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 mt-2">
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.price")}{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <NumericInput
                  variant="currency"
                  autoFocus={step === 2}
                  required
                  value={formData.price === undefined ? "" : formData.price}
                  error={!!errors.price}
                  hint={errors.price}
                  onChange={(val) => {
                    const newPrice = val === "" ? undefined : Number(val);
                    setFormData({ ...formData, price: newPrice as any });
                    if (errors.price)
                      setErrors({ ...errors, price: undefined });
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.cost")}
                </Label>
                <NumericInput
                  variant="currency"
                  value={formData.cost}
                  onChange={(val) =>
                    setFormData({ ...formData, cost: Number(val) })
                  }
                />
                <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-2">
                  Used to calculate profit margins.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 3: Details */}
          <div className={step === 3 ? "block fade-in" : "hidden"}>
            <div className="space-y-5">
              {!isEdit && formData.itemType === "Product" && (
                <div>
                  <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    {t("form.fields.stock")}
                  </Label>
                  <NumericInput
                    variant="quantity"
                    autoFocus={step === 3}
                    placeholder={t("form.placeholders.stock")}
                    value={formData.currentStock}
                    onChange={(val) =>
                      setFormData({ ...formData, currentStock: Number(val) })
                    }
                  />
                </div>
              )}
              <div>
                <Label className="uppercase tracking-wide text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("form.fields.desc")}
                </Label>
                <TextArea
                  autoFocus={step === 3 && formData.itemType === "Service"}
                  placeholder={t("form.placeholders.desc")}
                  value={formData.description}
                  onChange={(val) =>
                    setFormData({ ...formData, description: val })
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-auto pt-6 flex justify-end gap-4 items-center">
            <Button
              type="button"
              variant="outline"
              className="text-[10px] font-semibold uppercase tracking-widest px-6"
              onClick={step === 1 ? onClose : handleBack}
            >
              {step === 1 ? t("form.actions.cancel") : t("form.actions.back")}
            </Button>

            <Button
              disabled={loading}
              type="submit"
              className="text-[10px] font-semibold uppercase tracking-widest px-8 flex items-center gap-2"
            >
              {step < 3 ? (
                <>
                  {t("form.actions.next")} <HiArrowRight />
                </>
              ) : loading ? (
                t("form.actions.processing")
              ) : (
                <>
                  {isEdit ? t("form.actions.update") : t("form.actions.create")}{" "}
                  <HiCheck className="text-lg" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
