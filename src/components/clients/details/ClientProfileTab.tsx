import { useTranslation } from "react-i18next";
import { HiOutlineMapPin, HiOutlinePencilSquare } from "react-icons/hi2";
import Button from "../../ui/button/Button";
import { ClientData } from "../../../apis/clients";

function SectionEditButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      size="sm"
      className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
      onClick={onClick}
    >
      <HiOutlinePencilSquare className="size-4" /> {label}
    </Button>
  );
}

interface ClientProfileTabProps {
  client: ClientData;
  canManage: boolean;
  isArchived: boolean;
  onEditAddress: () => void;
  onLifecycleAction: () => void;
}

export default function ClientProfileTab({
  client,
  canManage,
  isArchived,
  onEditAddress,
  onLifecycleAction,
}: ClientProfileTabProps) {
  const { t } = useTranslation("client_details");

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 text-start">
      
      {/* Address Block */}
      <div className=" border border-gray-200 dark:border-white/[0.05] rounded-3xl px-5  sm:px-8 pt-3 pb-5">
        
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-brand-500 dark:text-brand-400 uppercase font-semibold text-sm tracking-widest">
            <HiOutlineMapPin className="size-5 stroke-[2.5]" />
            <span>{t("profile_tab.address_title")}</span>
          </div>

          {canManage && !isArchived && (
            <SectionEditButton
              onClick={onEditAddress}
              label={t("profile_tab.edit_address")}
            />
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6">
          <div className="col-span-2 sm:col-span-1"> 
            <span className="text-[9px] font-semibold text-gray-400 tracking-widest block mb-1 uppercase">
              {t("profile_tab.labels.street")}
            </span>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 break-words">
              {client.address?.street || "---"}
            </p>
          </div>
          
          <div>
            <span className="text-[9px] font-semibold text-gray-400 tracking-widest block mb-1 uppercase">
              {t("profile_tab.labels.city_state")}
            </span>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {client.address?.city || "---"}
              {client.address?.state ? `, ${client.address.state}` : ""}
            </p>
          </div>
          
          <div>
            <span className="text-[9px] font-semibold text-gray-400 tracking-widest block mb-1 uppercase">
              {t("profile_tab.labels.zip")}
            </span>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {client.address?.zipCode || "---"}
            </p>
          </div>
          
          <div>
            <span className="text-[9px] font-semibold text-gray-400 tracking-widest block mb-1 uppercase">
              {t("profile_tab.labels.country")}
            </span>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {client.address?.country || "---"}
            </p>
          </div>
        </div>
      </div>

      {/* Account Lifecycle */}
      {canManage && (
        <div className="pt-4 sm:pt-6 border-t border-gray-100 dark:border-white/5">
          <h4
            className={`text-sm font-semibold uppercase tracking-widest mb-4 ${
              isArchived
                ? "text-amber-700 dark:text-amber-300"
                : "text-error-500 dark:text-error-400"
            }`}
          >
            {t("profile_tab.lifecycle.title")}
          </h4>
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
              isArchived
                ? "bg-amber-200/20 border-amber-100 dark:bg-amber-500/8 dark:border-amber-500/10"
                : "bg-error-200/30 border-error-100 dark:bg-error-400/2 dark:border-error-500/10"
            }`}
          >
            <div>
              <p className="text-sm mb-1 font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
                {isArchived
                  ? t("profile_tab.lifecycle.restore_title")
                  : t("profile_tab.lifecycle.archive_title")}
              </p>
              <p className="text-xs text-gray-500 font-medium max-w-md">
                {isArchived
                  ? t("profile_tab.lifecycle.restore_desc")
                  : t("profile_tab.lifecycle.archive_desc")}
              </p>
            </div>

            <Button
              variant="outline"
              className={`w-full sm:w-auto px-6 text-[10px] font-semibold uppercase tracking-widest transition-all justify-center ${
                isArchived
                  ? "border-amber-200 text-amber-600 hover:bg-amber-600 hover:text-white"
                  : "border-error-200 text-error-600 hover:bg-error-600 hover:text-white dark:hover:text-white"
              }`}
              onClick={onLifecycleAction}
            >
              {isArchived
                ? t("profile_tab.lifecycle.btn_restore")
                : t("profile_tab.lifecycle.btn_archive")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}