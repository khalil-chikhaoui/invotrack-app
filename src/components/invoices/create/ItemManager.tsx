import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  HiOutlineCubeTransparent,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlinePencil,
  HiPlus,
  HiChevronDown,
} from "react-icons/hi2";
import { formatMoney } from "../../../hooks/formatMoney";
import { itemApi, ItemData } from "../../../apis/items";
import { CurrencyFormat } from "../../../apis/business";
import ConfirmModal from "../../common/ConfirmModal";

interface ItemManagerProps {
  items: any[];
  availableItems: ItemData[];
  onSelectProduct: (item: ItemData) => void;
  onEditItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
  onNewItem: () => void;
  currency?: string;
  currencyFormat?: CurrencyFormat;
}

export default function ItemManager({
  items,
  availableItems,
  onSelectProduct,
  onEditItem,
  onRemoveItem,
  onNewItem,
  currency,
  currencyFormat,
}: ItemManagerProps) {
  const { t } = useTranslation("invoice");
  const { businessId } = useParams<{ businessId: string }>();
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ItemData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLDivElement>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const displayItems = useMemo(
    () => (search.trim().length > 0 ? results : availableItems),
    [search, results, availableItems],
  );

  useEffect(() => setActiveIndex(-1), [displayItems]);

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

  useEffect(() => {
    if (search.trim().length < 1) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      if (!businessId) return;
      setSearching(true);
      try {
        const data = await itemApi.pickerSearch(businessId, search);
        setResults(data);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, businessId]);

  const handleSelect = (item: ItemData) => {
    onSelectProduct(item);
    setSearch("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < displayItems.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) handleSelect(displayItems[activeIndex]);
        break;
      case "Escape":
        setIsOpen(false);
        break;
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
    <div className="relative" ref={containerRef} onKeyDown={handleKeyDown}>
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-md shadow-sm flex flex-col transition-all">
        <div className="px-6 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-gray-900/50 rounded-t-md">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-gray-100 dark:bg-white/5">
              <HiOutlineCubeTransparent className="size-3.5 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="font-semibold text-[10px] tracking-widest uppercase text-gray-400">
              {t("create.sections.items")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onNewItem}
            className="group flex items-center bg-brand-500/7 hover:bg-brand-500/10 dark:bg-brand-50/10 dark:hover:bg-brand-50/20 py-1.5 px-3 rounded-md gap-1.5 text-[12px] font-medium  tracking-wide text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
          >
            <HiPlus className="size-3.5" /> {t("create.sections.quick_item")}
          </button>
        </div>

        <div className="p-3 sm:p-4 bg-gray-50/30 dark:bg-transparent">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <HiOutlineMagnifyingGlass
                className={`size-4 transition-colors ${searching ? "text-brand-500" : "text-gray-400"}`}
              />
            </div>
            <input
              type="text"
              value={search}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("create.placeholders.item_search")}
              className="w-full h-11 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 pl-11 pr-10 text-sm font-medium focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all 
              text-gray-900 dark:text-white placeholder:text-gray-500 placeholder:font-light dark:placeholder:text-gray-300"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searching ? (
                <div className="w-4 h-4 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
              ) : (
                <HiChevronDown
                  className={`size-4 text-gray-300 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              )}
            </div>

            {isOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-brand-500/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div
                  ref={scrollParentRef}
                  className="max-h-[240px] overflow-y-auto custom-scrollbar"
                >
                  {displayItems.length > 0 ? (
                    displayItems.map((i, index) => (
                      <div
                        key={i._id}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handleSelect(i)}
                        className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 transition-colors ${
                          activeIndex === index
                            ? "bg-brand-50/50 dark:bg-brand-500/10"
                            : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium text-gray-800 dark:text-white truncate  tracking-tight leading-tight">
                            <HighlightText text={i.name} highlight={search} />
                          </span>
                          <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate font-medium mt-0.5">
                            {i.itemType} {i.sku ? `• ${i.sku}` : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {formatMoney(i.price, currency, currencyFormat)}
                          </span>
                          <HiPlus className="size-4 text-brand-500" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {t("create.item_manager.no_products")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-b-[2rem]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600 dark:text-gray-300 bg-gray-50/30 dark:bg-transparent">
              <HiOutlineCubeTransparent className="size-8 mb-2 " />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] ">
                {t("create.item_manager.empty_ledger")}
              </span>
            </div>
          ) : (
            <table className="w-full text-start border-t border-gray-100 dark:border-white/5">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  <th className="px-6 py-3 text-gray-700 dark:text-gray-300 text-start">
                    {t("create.item_manager.headers.nomenclature")}
                  </th>
                  <th className="px-6 py-3 text-gray-700 dark:text-gray-300 text-center">
                    {t("create.item_manager.headers.qty")}
                  </th>
                  <th className="px-6 py-3 text-gray-700 dark:text-gray-300 text-end">
                    {t("create.item_manager.headers.rate")}
                  </th>
                  <th className="px-6 py-3 text-gray-700 dark:text-gray-300 text-end">
                    {t("create.item_manager.headers.total")}
                  </th>
                  <th className="px-6 py-3 text-gray-700 dark:text-gray-300 text-end">
                    {t("create.item_manager.headers.control")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-transparent">
                {items.map((item, idx) => (
                  <tr
                    key={idx}
                    className="text-sm hover:bg-gray-50/30 hover:dark:bg-brand-500/10 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800 dark:text-white uppercase text-xs tracking-tight">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-600 dark:text-gray-300 text-xs">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <span className="font-semibold text-gray-600 dark:text-gray-300 text-xs">
                        {formatMoney(item.price, currency, currencyFormat)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <span className="font-black text-gray-600 dark:text-gray-300 text-xs">
                        {formatMoney(item.total, currency, currencyFormat)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditItem(idx)}
                          className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all"
                        >
                          <HiOutlinePencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteIndex(idx);
                            setIsConfirmOpen(true);
                          }}
                          className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                        >
                          <HiOutlineTrash className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          if (deleteIndex !== null) onRemoveItem(deleteIndex);
          setIsConfirmOpen(false);
        }}
        title={t("create.item_manager.modals.remove_title")}
        description={t("create.item_manager.modals.remove_desc")}
        variant="danger"
      />
    </div>
  );
}
