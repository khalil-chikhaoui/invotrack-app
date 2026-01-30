import { HiOutlineMapPin, HiOutlinePencilSquare } from "react-icons/hi2";
import Button from "../../ui/button/Button";
import { ClientData } from "../../../apis/clients";

function SectionEditButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center md:justify-end">
      <Button
        size="sm"
        className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
        onClick={onClick}
      >
        <HiOutlinePencilSquare className="size-4" /> Edit Address
      </Button>
    </div>
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
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 text-start">
      {/* Address Block */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-3xl px-8 pt-4 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-end gap-1.5 text-brand-500 dark:text-brand-400 uppercase font-semibold text-sm tracking-widest">
            <HiOutlineMapPin className="size-5 stroke-[2.5]" /> Registered
            Address
          </div>

          {canManage && !isArchived && (
            <SectionEditButton onClick={onEditAddress} />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 pb-5">
          <div>
            <span className="text-[9px] font-semibold text-gray-400 tracking-widest block mb-1 uppercase">
              Street
            </span>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {client.address?.street || "---"}
            </p>
          </div>
          <div>
            <span className="text-[9px] font-semibold text-gray-400 tracking-widest block mb-1 uppercase">
              City / State
            </span>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {client.address?.city || "---"}
              {client.address?.state ? `, ${client.address.state}` : ""}
            </p>
          </div>
          <div>
            <span className="text-[9px] font-semibold text-gray-400 tracking-widest block mb-1 uppercase">
              Postal Code
            </span>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {client.address?.zipCode || "---"}
            </p>
          </div>
          <div>
            <span className="text-[9px] font-semibold text-gray-400 tracking-widest block mb-1 uppercase">
              Country
            </span>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {client.address?.country || "---"}
            </p>
          </div>
        </div>
      </div>

      {/* Account Lifecycle */}
      {canManage && (
        <div className=" pt-8 border-t border-gray-100 dark:border-white/5">
          <h4
            className={`text-sm font-semibold uppercase tracking-widest mb-4 ${
              isArchived
                ? "text-amber-700 dark:text-amber-300"
                : "text-error-500 dark:text-error-400"
            }`}
          >
            Account Lifecycle
          </h4>
          <div
            className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isArchived
                ? "bg-amber-200/20 border-amber-100 dark:bg-amber-500/8 dark:border-amber-500/10"
                : "bg-error-200/30 border-error-100 dark:bg-error-400/2 dark:border-error-500/10"
            }`}
          >
            <div>
              <p className="text-sm mb-1 font-semibold text-gray-800 dark:text-white uppercase tracking-tight">
                {isArchived
                  ? "Restore Client Access"
                  : "Execute Removal / Archive"}
              </p>
              <p className="text-xs text-gray-500 font-medium max-w-md">
                {isArchived
                  ? "Re-activate this client to allow new invoices and billing statements."
                  : "System will automatically archive if history exists, otherwise purge."}
              </p>
            </div>

            <Button
              variant="outline"
              className={`px-6 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                isArchived
                  ? "border-amber-200 text-amber-600 hover:bg-amber-600 hover:text-white"
                  : "border-error-200 text-error-600 hover:bg-error-600 hover:text-white dark:hover:text-white"
              }`}
              onClick={onLifecycleAction}
            >
              {isArchived ? "Restore Account" : "Delete / Archive"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
