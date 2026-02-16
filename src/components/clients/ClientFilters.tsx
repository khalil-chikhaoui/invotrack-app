import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowPath,
  HiOutlineXMark,
} from "react-icons/hi2";
import { PlusIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { Modal } from "../ui/modal";
import SelectField from "../../components/form/SelectField"; 

interface ClientFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  sortConfig: string;
  setSortConfig: (val: string) => void;
  setPage: (page: number) => void;
  loading: boolean;
  canManage: boolean;
  onAdd: () => void;
  onRefresh: () => void;
}

export default function ClientFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  sortConfig,
  setSortConfig,
  setPage,
  loading,
  canManage,
  onAdd,
  onRefresh,
}: ClientFiltersProps) {
  const { t } = useTranslation("client");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // --- Filter Defaults & Logic ---
  const defaults = {
    status: "active",
    type: "all",
    sort: "name:asc",
  };

  const isStatusChanged = statusFilter !== defaults.status;
  const isTypeChanged = typeFilter !== defaults.type;
  const isSortChanged = sortConfig !== defaults.sort;
  const hasActiveFilters = isStatusChanged || isTypeChanged || isSortChanged;

  const handleReset = () => {
    setStatusFilter(defaults.status);
    setTypeFilter(defaults.type);
    setSortConfig(defaults.sort);
    setPage(1);
    setIsFilterModalOpen(false);
  };

  // --- Options Arrays ---
  const statusOptions = [
    { value: "active", label: t("filters.status.active") },
    { value: "archived", label: t("filters.status.archived") },
  ];

  const typeOptions = [
    { value: "all", label: t("filters.type.all") },
    { value: "Business", label: t("filters.type.business") },
    { value: "Individual", label: t("filters.type.individual") },
  ];

  const sortOptions = [
    { value: "name:asc", label: t("filters.sort.name_asc") },
    { value: "name:desc", label: t("filters.sort.name_desc") },
    { value: "createdAt:desc", label: t("filters.sort.newest") },
    { value: "createdAt:asc", label: t("filters.sort.oldest") },
  ];

  // --- Component Block ---
  const FilterFields = () => (
    <>
      <SelectField
        label={t("filters.status_label")}
        value={statusFilter}
        onChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        options={statusOptions}
        isActive={isStatusChanged}
        className="w-full xl:w-36"
      />

      <SelectField
        label={t("filters.type_label")}
        value={typeFilter}
        onChange={(val) => {
          setTypeFilter(val);
          setPage(1);
        }}
        options={typeOptions}
        isActive={isTypeChanged}
        className="w-full xl:w-40"
      />

      <SelectField
        label={t("filters.sort_label")}
        value={sortConfig}
        onChange={(val) => setSortConfig(val)}
        options={sortOptions}
        isActive={isSortChanged}
        className="w-full xl:w-48"
      />
    </>
  );

  return (
    <div className="p-4 xl:p-5 border-b border-gray-200 dark:border-white/[0.05] bg-transparent">
      <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
        {/* Search + Mobile Controls */}
        <div className="flex flex-1 items-end gap-2">
          <div className="flex-1">
            <label className="hidden xl:block text-[10px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-widest">
              {t("filters.search_label")}
            </label>
            <Input
              placeholder={t("filters.search_placeholder")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-11 !bg-transparent"
            />
          </div>

          <div className="relative flex xl:hidden gap-2">
            {/* Mobile Filter Trigger Group */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsFilterModalOpen(true)}
                className="h-11 px-3 border-gray-200 dark:border-white/10"
              >
                <HiOutlineAdjustmentsHorizontal className="size-5" />
              </Button>

              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500 border-2 border-white dark:border-gray-900"></span>
                </span>
              )}
            </div>

            {/* Mobile Refresh */}
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
              className="h-11 px-3 border-gray-200 dark:border-white/10"
            >
              <HiOutlineArrowPath
                className={`size-5 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden xl:flex xl:flex-row gap-4">
          <FilterFields />
        </div>

        {/* Desktop Actions */}
        <div className="hidden xl:flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="h-11 px-4 bg-white dark:bg-transparent"
          >
            <HiOutlineArrowPath
              className={`size-5 ${loading ? "animate-spin" : ""}`}
            />
          </Button>

          {canManage && (
            <Button
              onClick={onAdd}
              className="h-11 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest px-6 "
            >
              <PlusIcon className="size-5 fill-current" />
              <span>{t("list.add_button")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Add Button Row */}
      {canManage && (
        <div className="mt-4 xl:hidden">
          <Button
            onClick={onAdd}
            className="w-full h-11 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <PlusIcon className="size-4 fill-current" />
            <span>{t("list.add_button")}</span>
          </Button>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <Modal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          className="max-w-[550px] m-4 w-full"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsFilterModalOpen(false);
            }}
            className="flex flex-col h-full max-h-[85vh] sm:max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex-none px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 rounded-t-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 dark:bg-white/5 rounded-lg text-brand-600 dark:text-brand-400">
                    <HiOutlineAdjustmentsHorizontal className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                      {t("filters.modal_title")}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                      {t("filters.modal_desc")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="group p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <HiOutlineXMark className="size-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <div className="flex flex-col gap-6">
                <FilterFields />
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex-none px-6 py-5 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 backdrop-blur-sm rounded-b-2xl">
              <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={!hasActiveFilters}
                  onClick={handleReset}
                  className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 border border-transparent
                    ${
                      hasActiveFilters
                        ? "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                        : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    }
                  `}
                >
                  {t("filters.reset")}
                </button>
                <Button
                  type="submit"
                  className="w-full sm:flex-1 h-11 text-xs font-bold uppercase tracking-widest"
                >
                  {t("filters.apply")}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}