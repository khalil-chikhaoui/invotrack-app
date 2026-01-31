import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; // <--- Hook
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { itemApi, ItemData } from "../../apis/items";
import {
  HiArrowRight,
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineCube,
} from "react-icons/hi2";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ItemData | null;
  refresh: () => void;
}

export default function StockInjectModal({
  isOpen,
  onClose,
  item, 
  refresh,
}: Props) {
  const { t } = useTranslation("item"); // <--- Load namespace
  const [amount, setAmount] = useState<string>("");
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setMode("add");
    }
  }, [isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    inputValue = inputValue.replace(/,/g, ".");
    if (/^\d*(\.\d*)?$/.test(inputValue)) {
      setAmount(inputValue);
    }
  };

  const handleAdjust = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (!item || isNaN(numAmount) || numAmount === 0) return;

    setLoading(true);
    try {
      const finalQuantity = mode === "add" ? numAmount : -numAmount;
      await itemApi.adjustStock(item._id, { quantity: finalQuantity });
      refresh();
    } catch (err) {
      console.error("Inventory Sync Error:", err);
    } finally {
      onClose();
      setLoading(false);
    }
  };

  const currentVal = parseFloat(amount) || 0;
  const currentStock = item?.currentStock || 0;
  const newStock =
    mode === "add" ? currentStock + currentVal : currentStock - currentVal;

  const theme =
    mode === "add"
      ? {
          text: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
          border: "border-emerald-200 dark:border-emerald-500/20",
          btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
          icon: HiOutlineArrowDownTray,
        }
      : {
          text: "text-rose-600 dark:text-rose-400",
          bg: "bg-rose-50 dark:bg-rose-400/10",
          border: "border-rose-200 dark:border-rose-500/20",
          btn: "bg-rose-600 hover:bg-rose-700 text-white",
          icon: HiOutlineArrowUpTray,
        };

  const ModeIcon = theme.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] overflow-visible"
    >
      <form 
        onSubmit={handleAdjust}
        className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden"
      >
        <div className="pt-5 px-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 mb-4 border border-gray-100 dark:border-gray-700">
            <HiOutlineCube className="size-6 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
            {t("stock_modal.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {t("stock_modal.subtitle")}{" "}
            <span className="text-gray-900 dark:text-white font-semibold">
              {item?.name}
            </span>
          </p>
        </div>

        <div className="px-8 flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setMode("add")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-200 border-2 ${
              mode === "add"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {t("stock_modal.inbound")}
          </button>
          <button
            type="button"
            onClick={() => setMode("remove")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-200 border-2 ${
              mode === "remove"
                ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                : "border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {t("stock_modal.outbound")}
          </button>
        </div>

        <div
          className={`mx-8 mb-6 p-6 rounded-3xl border-2 transition-colors duration-300 ${theme.bg} ${theme.border} flex flex-col items-center justify-center relative`}
        >
          <label
            className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${theme.text} opacity-70`}
          >
            {t("stock_modal.label_quantity")}
          </label>

          <div className="relative w-full flex items-center justify-center">
            <ModeIcon
              className={`absolute left-0 size-6 ${theme.text} opacity-50`}
            />

            <input
              type="text" 
              inputMode="decimal"
              pattern="[0-9.]*"
              autoComplete="off"
              autoFocus
              value={amount}
              onChange={handleAmountChange}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className={`
                w-full bg-transparent text-center font-black text-6xl outline-none placeholder-gray-300 dark:placeholder-gray-600 transition-colors
                ${theme.text}
              `}
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            {[1, 5, 10, 50].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  const current = parseFloat(amount) || 0;
                  setAmount(String(current + val));
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-gray-25 dark:bg-black/20 transition-transform hover:-translate-y-0.5
                  ${theme.text}
                `}
              >
                +{val}
              </button>
            ))}
          </div>
        </div>

        <div className="px-10 pb-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-300 tracking-wider">
                {t("stock_modal.current")}
              </span>
              <span className="font-semibold text-xl text-gray-900 dark:text-white tabular-nums">
                {currentStock}{" "}
                <span className="text-xs text-gray-500 dark:text-gray-300 font-normal">
                  {item?.unit}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-300">
              <HiArrowRight className="size-5" />
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-300 tracking-wider">
                {t("stock_modal.new_total")}
              </span>
              <span className={`font-semibold text-xl tabular-nums ${theme.text}`}>
                {newStock}{" "}
                <span className={`text-xs font-normal text-gray-500 dark:text-gray-300`}>
                  {item?.unit}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-1/3 py-4 rounded-xl text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-700"
          >
            {t("stock_modal.actions.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading || currentVal === 0}
            className={`w-full sm:flex-1 py-4 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] transition-all ${theme.btn}`}
          >
            {loading
              ? t("stock_modal.actions.updating")
              : mode === "add"
                ? t("stock_modal.actions.confirm_restock")
                : t("stock_modal.actions.confirm_removal")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}