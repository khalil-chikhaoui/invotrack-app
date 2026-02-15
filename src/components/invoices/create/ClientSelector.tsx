import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
  HiPlus,
  HiChevronDown,
  HiOutlineXMark,
} from "react-icons/hi2";
import { clientApi, ClientData } from "../../../apis/clients";

interface ClientSelectorProps {
  selectedClient: ClientData | null;
  setSelectedClient: (c: ClientData | null) => void;
  clients: ClientData[];
  search: string;
  setSearch: (s: string) => void;
  onNewClient: () => void;
  isEdit: boolean;
}

export default function ClientSelector({
  selectedClient,
  setSelectedClient,
  clients,
  search,
  setSearch,
  onNewClient,
  isEdit,
}: ClientSelectorProps) {
  const { t } = useTranslation("invoice");
  const { businessId } = useParams<{ businessId: string }>();
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ClientData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); 

  const displayItems = useMemo(
    () => (search.trim().length > 0 ? results : clients),
    [search, results, clients],
  );

  useEffect(() => setActiveIndex(-1), [displayItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        const data = await clientApi.pickerSearch(businessId, search);
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, businessId]);

  const handleSelect = (client: ClientData) => {
    setSelectedClient(client);
    setSearch("");
    setIsOpen(false);
  };

  const handleChangeClient = () => {
    setSelectedClient(null);
   // Open dropdown immediately 
    setTimeout(() => {
      inputRef.current?.focus();
      setIsOpen(true);
    }, 0);
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
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-md  flex flex-col transition-all">
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-gray-900/50 rounded-t-md">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-gray-100 dark:bg-white/5">
              <HiOutlineUser className="size-3.5 text-gray-500" />
            </div>
            <h3 className="font-semibold text-[10px] tracking-widest uppercase text-gray-400">
              {t("create.sections.bill_to")}
            </h3>
          </div>
          {!isEdit && (
            <button
              type="button"
              onClick={onNewClient}
              className="group flex items-center bg-brand-500/7 hover:bg-brand-500/10 dark:bg-brand-50/10 dark:hover:bg-brand-50/20 py-1.5 px-3 rounded-md gap-1.5 text-[12px] font-medium  tracking-wide text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
            >
              <HiPlus className="size-3.5" /> {t("create.sections.new_client")}
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-3 sm:p-4 bg-gray-50/30 dark:bg-transparent rounded-b-[2rem]">
          {!selectedClient ? (
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <HiOutlineMagnifyingGlass
                  className={`size-4 transition-colors ${searching ? "text-brand-500" : "text-gray-400"}`}
                />
              </div>
              <input
                ref={inputRef} 
                type="text"
                value={search}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("create.placeholders.client_search")}
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 pl-11 pr-10 text-sm font-medium focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-500 placeholder:font-light dark:placeholder:text-gray-300"
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
                      displayItems.map((c, index) => (
                        <div
                          key={c._id}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => handleSelect(c)}
                          className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 transition-colors ${
                            activeIndex === index
                              ? "bg-brand-50/50 dark:bg-brand-500/10"
                              : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="relative w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200/50 dark:border-white/5">
                            {c.logo ? (
                              <img
                                src={c.logo}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-gray-400">
                                {c.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-800 dark:text-white truncate uppercase tracking-tight leading-tight">
                              <HighlightText text={c.name} highlight={search} />
                            </span>
                            <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate font-medium">
                              <HighlightText
                                text={c.email || t("create.no_email")}
                                highlight={search}
                              />
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {t("create.no_results")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-md bg-white dark:bg-transparent border border-brand-500/20 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shrink-0 border border-brand-100 dark:border-brand-500/20 overflow-hidden">
                  {selectedClient.logo ? (
                    <img
                      src={selectedClient.logo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <HiOutlineUser className="text-brand-500 size-5" />
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate leading-none mb-1">
                    {selectedClient.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate leading-none">
                    {selectedClient.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleChangeClient} // 4. Updated Click Handler
                className="flex items-center gap-1.5 text-[9px] font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 uppercase tracking-widest transition-all hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg group"
              >
                <HiOutlineXMark className="size-3.5" />
                {t("create.change")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}