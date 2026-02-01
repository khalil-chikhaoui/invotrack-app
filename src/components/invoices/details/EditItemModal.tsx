import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import {
  HiOutlineCube,
  HiOutlineCalculator,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import Label from "../../form/Label";
import NumericInput from "../../form/input/NumericInput";
import { formatMoney } from "../../../hooks/formatMoney";
import { CurrencyFormat } from "../../../apis/business";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: (
    itemId: string,
    data: { quantity: number; price: number; costPrice: number },
  ) => Promise<void>;
  currency?: string;
  currencyFormat?: CurrencyFormat;
}

export default function EditItemModal({
  isOpen,
  onClose,
  item,
  onSave,
  currency,
  currencyFormat,
}: EditItemModalProps) {
  const { t } = useTranslation("invoice");
  const [formData, setFormData] = useState({
    quantity: "",
    price: "",
    costPrice: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        quantity: item.quantity?.toString() || "",
        price: item.price?.toString() || "",
        costPrice: item.costPrice?.toString() || "",
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(item._id, {
        quantity: Number(formData.quantity) || 0,
        price: Number(formData.price) || 0,
        costPrice: Number(formData.costPrice) || 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      onClose();
      setLoading(false);
    }
  };

  const qty = Number(formData.quantity) || 0;
  const price = Number(formData.price) || 0;
  const cost = Number(formData.costPrice) || 0;

  const calculatedTotal = qty * price;
  const totalCost = qty * cost;
  const margin = calculatedTotal - totalCost;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-500">
            <HiOutlineCube className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
              {t("create.item_manager.modals.edit_title")}
            </h3>
            <p className="text-xs text-gray-500">
              {t("create.item_manager.modals.edit_desc")}{" "}
              <span className="font-semibold">{item?.name}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-300 mb-1.5">
                {t("create.item_manager.modals.qty")}
              </Label>
              <NumericInput
                variant="quantity"
                value={formData.quantity}
                onChange={(val) => setFormData({ ...formData, quantity: val })}
                className="bg-gray-50 dark:bg-gray-800/50 font-medium"
                required
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-300 mb-1.5">
                {t("create.item_manager.modals.selling_price")}
              </Label>
              <NumericInput
                variant="currency"
                value={formData.price}
                onChange={(val: string) =>
                  setFormData({ ...formData, price: val })
                }
                className="bg-gray-50 dark:bg-gray-800/50 font-medium"
                required
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 ">
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineLockClosed className="size-3 text-gray-500 dark:text-gray-300" />
              <Label className="text-[10px] uppercase  text-gray-500 dark:text-gray-300 !mb-0 font-medium">
                {t("create.item_manager.modals.internal_costing")}
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <NumericInput
                  variant="currency"
                  value={formData.costPrice}
                  onChange={(val: string) =>
                    setFormData({ ...formData, costPrice: val })
                  }
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500"
                />
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 dark:text-gray-300 uppercase font-semibold">
                  {t("create.item_manager.modals.margin")}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    margin >= 0 ? "text-success-500" : "text-error-500"
                  }`}
                >
                  {formatMoney(margin, currency, currencyFormat)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-brand-50/30 dark:bg-brand-500/5 rounded-xl border border-brand-100 dark:border-brand-500/10 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
            <div className="flex items-center gap-2">
              <HiOutlineCalculator className="text-brand-500 dark:text-brand-400 size-4" />
              <span className="text-[11px] uppercase font-semibold text-brand-500 dark:text-brand-400">
                {t("create.item_manager.modals.line_total")}
              </span>
            </div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white tracking-wide ">
              {formatMoney(calculatedTotal, currency, currencyFormat)}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              {t("status_modal.actions.cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? t("create.item_manager.modals.saving")
                : t("create.item_manager.modals.save")}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
