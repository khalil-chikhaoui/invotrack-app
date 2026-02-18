/**
 * @fileoverview AppHeader Component
 */
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { generalApi, SearchResults } from "../apis/general";

const AppHeader: React.FC = () => {
  const { t } = useTranslation("common");
  const { businessId } = useParams();
  const navigate = useNavigate();

  // Sidebar Context
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  // --- Search & UI State ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Sidebar Toggle Logic
   */
  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  /**
   * Search Logic: 300ms Debounce
   */
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults(null);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (!businessId) return;
      setLoading(true);
      try {
        const data = await generalApi.search(businessId, query);
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, businessId]);

  /**
   * Keyboard Shortcuts (⌘+K / Ctrl+K)
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  /**
   * Click Outside Observer
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setQuery("");
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
      <div className="flex items-center justify-between w-full py-3  pl-2 pr-4 lg:py-4">
        {/* --- Left Section: Toggle, Logo, Search --- */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11 lg:border bg-transparent"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92779 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <Link to="/" className="lg:hidden">
            <img
              className="dark:hidden"
              src="/images/logo/logo.svg"
              alt="Logo"
            />
            <img
              className="hidden dark:block"
              src="/images/logo/logo-dark.svg"
              alt="Logo"
            />
          </Link>

          {/* --- Desktop Search Engine --- */}
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length > 1 && setShowDropdown(true)}
                  placeholder={t("header.search_placeholder")}
                  className="h-11 w-full rounded-lg border border-gray-200  backdrop-blur-sm py-2.5 pl-4 pr-14 text-sm text-gray-800 shadow-theme-xs  focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800  dark:bg-white/[0.03] dark:text-white/90 placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:focus:border-brand-800 xl:w-[430px] !bg-transparent"
                />
                {/* --- Spinner / Shortcut Indicator --- */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-brand-600 dark:border-brand-300 border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-[10px] font-bold -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                      <span> ⌘ </span>
                      <span> K </span>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* --- Results Dropdown --- */}
            {showDropdown && results && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-[480px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in fade-in zoom-in-95 duration-200">
                {/* Secondary Spinner for mid-search updates */}
                {loading && (
                  <div className="py-6 flex justify-center items-center">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {!loading && (
                  <>
                    {/* Category: Clients */}
                    {results.clients.length > 0 && (
                      <div className="mb-2">
                        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-300">
                          {t("header.categories.clients")}
                        </p>
                        {results.clients.map((c) => (
                          <button
                            key={c._id}
                            onClick={() =>
                              handleNavigate(
                                `/business/${businessId}/clients/${c._id}`,
                              )
                            }
                            className="flex w-full items-center px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-left dark:text-gray-300 transition-colors"
                          >
                            <span className="truncate font-medium">
                              {c.name}
                            </span>
                            <span className="ml-auto text-[9px] text-gray-400 font-medium uppercase tracking-widest">
                              {c.clientType}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Category: Items */}
                    {results.items.length > 0 && (
                      <div className="mb-2">
                        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-300">
                          {t("header.categories.inventory")}
                        </p>
                        {results.items.map((i) => (
                          <button
                            key={i._id}
                            onClick={() =>
                              handleNavigate(
                                `/business/${businessId}/items/${i._id}`,
                              )
                            }
                            className="flex w-full items-center px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-left dark:text-gray-300 transition-colors"
                          >
                            <span className="truncate font-medium">
                              {i.name}
                            </span>
                            <span className="ml-auto text-[9px] text-gray-400 font-medium">
                              {i.sku || "NO SKU"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Category: Invoices */}
                    {results.invoices.length > 0 && (
                      <div>
                        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-300">
                          {t("header.categories.invoices")}
                        </p>
                        {results.invoices.map((inv) => (
                          <button
                            key={inv._id}
                            onClick={() =>
                              handleNavigate(
                                `/business/${businessId}/invoices/${inv._id}`,
                              )
                            }
                            className="flex w-full items-center px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-left dark:text-gray-300 transition-colors"
                          >
                            <span className="font-medium">
                              {inv.invoiceNumber}
                            </span>
                            <span className="ml-2 text-[10px] text-gray-400 truncate font-normal">
                              ({inv.clientSnapshot.name})
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Category: Deliveries (Bons de Livraison) */}
                    {results.deliveries && results.deliveries.length > 0 && (
                      <div className="mb-2">
                        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-300">
                          {t("header.categories.deliveries")}
                        </p>
                        {results.deliveries.map((d) => (
                          <button
                            key={d._id}
                            onClick={() =>
                              handleNavigate(
                                `/business/${businessId}/delivery/${d._id}`,
                              )
                            }
                            className="flex w-full items-center px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-left dark:text-gray-300 transition-colors"
                          >
                            <span className="font-medium">
                              {d.deliveryNumber}
                            </span>
                            <span className="ml-auto text-[9px] text-gray-400 font-medium">
                              {new Date(d.createdAt).toLocaleDateString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Empty State within Search */}
                    {!results.clients.length &&
                      !results.items.length &&
                      !results.invoices.length &&
                      (!results.deliveries || !results.deliveries.length) && (
                        <div className="p-4 text-center text-xs text-gray-600 dark:text-gray-3000 font-medium italic">
                          {t("header.no_matches")}
                        </div>
                      )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- Right Section Utilities --- */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <ThemeToggleButton />
          {/*<NotificationDropdown />*/}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
