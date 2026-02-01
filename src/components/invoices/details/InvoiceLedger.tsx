import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  HiOutlineQueueList,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCubeTransparent,
  HiOutlineMagnifyingGlass,
  HiPlus,
  HiOutlineCalculator,
  HiOutlineDocumentText,
  HiCheck,
  HiXMark,
  HiChevronDown,
} from "react-icons/hi2";
import { formatMoney } from "../../../hooks/formatMoney";
import { InvoiceData } from "../../../apis/invoices";
import { BusinessData } from "../../../apis/business";
import { ItemData } from "../../../apis/items";

interface InvoiceLedgerProps {
  invoice: InvoiceData;
  business: BusinessData;
  businessId: string | undefined;
  availableItems: ItemData[];
  isEditable: boolean;
  onEditItem: (item: any) => void;
  onSelectProduct: (item: ItemData) => void;
  onAddItem: (item: ItemData) => void;
  onDeleteItem: (itemId: string) => void;
  onNewItem: () => void;
  onEditTaxDiscount?: () => void;
  onSaveNotes?: (notes: string) => Promise<void>;
}

export default function InvoiceLedger({
  invoice,
  business,
  businessId,
  availableItems,
  isEditable,
  onEditItem,
  onSelectProduct,
  onDeleteItem,
  onNewItem,
  onEditTaxDiscount,
  onSaveNotes,
}: InvoiceLedgerProps) {
  const { t } = useTranslation("invoice_details");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(invoice.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setNotes(invoice.notes || "");
  }, [invoice.notes]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (item: ItemData) => {
    onSelectProduct(item);
    setSearch("");
    setIsOpen(false);
  };

  const handleSaveNotes = async () => {
    if (!onSaveNotes) return;
    setSavingNotes(true);
    try {
      await onSaveNotes(notes);
      setIsEditingNotes(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingNotes(false);
    }
  };

  const HighlightText = ({
    text,
    highlight,
  }: {
    text: string;
    highlight: string;
  }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <b
              key={i}
              className="text-brand-600 dark:text-brand-400 font-semibold"
            >
              {part}
            </b>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  return (
    <div
      className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-md flex flex-col transition-all overflow-hidden"
      ref={containerRef}
    >
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-gray-900/50">
        <h4 className="text-[11px] font-semibold text-brand-500 dark:text-brand-300 uppercase tracking-wide flex items-center gap-2 mt-1.5">
          <HiOutlineQueueList className="size-6" /> {t("ledger.title")}
        </h4>
        {isEditable && (
          <button
            type="button"
            onClick={onNewItem}
            className="group flex items-center bg-brand-500/7 hover:bg-brand-500/10 dark:bg-brand-50/10 dark:hover:bg-brand-50/20 py-1.5 px-3 rounded-md gap-1.5 text-[12px] font-medium  tracking-wide text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
          >
            <HiPlus className="size-3.5" /> {t("ledger.quick_item")}
          </button>
        )}
      </div>

      {/* Search Section */}
      {isEditable && (
        <div className="p-3 sm:p-4 bg-gray-50/30 dark:bg-transparent border-b border-gray-100 dark:border-white/5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <HiOutlineMagnifyingGlass className="size-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("ledger.search_placeholder")}
              className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 pl-11 pr-10 text-sm font-medium focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <HiChevronDown
                className={`size-4 text-gray-300 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </div>

            {isOpen && search && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl  overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                  {availableItems.length > 0 ? (
                    availableItems.map((i) => (
                      <div
                        key={i._id}
                        onClick={() => handleSelect(i)}
                        className="px-4 py-2.5 cursor-pointer flex items-center gap-3 transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-500/10"
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium text-gray-800 dark:text-white truncate uppercase tracking-tight leading-tight">
                            <HighlightText text={i.name} highlight={search} />
                          </span>
                          <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate font-medium mt-0.5">
                            {i.itemType} {i.sku ? `• ${i.sku}` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {formatMoney(
                              i.price,
                              business.currency,
                              business.currencyFormat,
                            )}
                          </span>
                          <HiPlus className="size-4 text-brand-500" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {t("ledger.no_results")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="overflow-x-auto flex-1 min-h-[150px]">
        {invoice.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600 dark:text-gray-300 bg-gray-50/30 dark:bg-transparent">
            <HiOutlineCubeTransparent className="size-8 mb-2 " />
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] ">
              {t("ledger.empty")}
            </span>
          </div>
        ) : (
          <table className="w-full text-start">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02] text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-3 text-start">
                  {t("ledger.headers.nomenclature")}
                </th>
                <th className="px-6 py-3 text-center">
                  {t("ledger.headers.qty")}
                </th>
                <th className="px-6 py-3 text-end">
                  {t("ledger.headers.rate")}
                </th>
                <th className="px-6 py-3 text-end">
                  {t("ledger.headers.total")}
                </th>
                {isEditable && (
                  <th className="px-6 py-3 text-end">
                    {t("ledger.headers.control")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-transparent">
              {invoice.items.map((item, idx) => (
                <tr
                  key={idx}
                  className="text-sm hover:bg-gray-50/30 hover:dark:bg-brand-500/10 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`/business/${businessId}/items/${item.itemId}`}
                      className="font-semibold text-gray-800 dark:text-white uppercase text-xs tracking-tight hover:text-brand-500 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-gray-600 dark:text-gray-300 text-xs">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <span className="font-semibold text-gray-600 dark:text-gray-300 text-xs">
                      {formatMoney(
                        item.price,
                        business?.currency,
                        business?.currencyFormat,
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <span className="font-black text-gray-800 dark:text-white text-xs">
                      {formatMoney(
                        item.total,
                        business?.currency,
                        business?.currencyFormat,
                      )}
                    </span>
                  </td>
                  {isEditable && (
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all"
                        >
                          <HiOutlinePencil className="size-4" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.itemId)}
                          className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                        >
                          <HiOutlineTrash className="size-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Area */}
      <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
        <div className="flex flex-col lg:flex-row">
          {/* Notes Section */}
          <div className="w-full lg:w-1/2 p-6 lg:border-r border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <HiOutlineDocumentText className="size-3.5 text-brand-500" />{" "}
                {t("ledger.notes.title")}
              </h4>
              {isEditable && !isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-[10px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 uppercase tracking-wider transition-colors"
                >
                  {t("ledger.notes.edit")}
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="animate-in fade-in duration-200">
                <textarea
                  autoFocus
                  className="w-full h-32 p-3 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none resize-none mb-3 text-gray-700 dark:text-white"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("ledger.notes.placeholder")}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                  >
                    <HiXMark className="size-4" />
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-all "
                  >
                    {savingNotes ? (
                      t("ledger.notes.saving")
                    ) : (
                      <>
                        <HiCheck className="size-3.5" />{" "}
                        {t("ledger.notes.save")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium whitespace-pre-wrap">
                {notes || (
                  <span className="opacity-30 italic">
                    {t("ledger.notes.empty")}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Totals Section */}
          <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center space-y-3">
            <div className="flex justify-end mb-2">
              {isEditable && onEditTaxDiscount && (
                <button
                  onClick={onEditTaxDiscount}
                  className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 uppercase tracking-wider transition-colors"
                >
                  <HiOutlineCalculator className="size-3.5" />{" "}
                  {t("ledger.totals.adjust")}
                </button>
              )}
            </div>

            <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              <span>{t("ledger.totals.subtotal")}</span>
              <span className="text-gray-600 dark:text-gray-300">
                {formatMoney(
                  invoice.subTotal,
                  business?.currency,
                  business?.currencyFormat,
                )}
              </span>
            </div>
            {invoice.totalDiscount > 0 && (
              <div className="flex justify-between text-[10px] font-semibold text-red-500 uppercase tracking-widest">
                <span>
                  {t("ledger.totals.discount")} ({invoice.discountValue}
                  {invoice.discountType === "percentage" ? "%" : ""})
                </span>
                <span>
                  -
                  {formatMoney(
                    invoice.totalDiscount,
                    business?.currency,
                    business?.currencyFormat,
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              <span>
                {t("ledger.totals.tax")} ({invoice.taxRate}%)
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {formatMoney(
                  invoice.totalTax,
                  business?.currency,
                  business?.currencyFormat,
                )}
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-2">
              <span className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-tighter">
                {t("ledger.totals.grand_total")}
              </span>
              <span className="text-xl font-black text-brand-600 dark:text-brand-400">
                {formatMoney(
                  invoice.grandTotal,
                  business?.currency,
                  business?.currencyFormat,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
