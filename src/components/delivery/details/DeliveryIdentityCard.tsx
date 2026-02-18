import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  HiOutlineTruck,
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineInformationCircle,
  HiPencil,
  HiXMark,
  HiCheck,
} from "react-icons/hi2";
import { DeliveryNoteData } from "../../../apis/deliveries";
import { BusinessData } from "../../../apis/business";
import Badge from "../../ui/badge/Badge";
import { formatMoney } from "../../../hooks/formatMoney";

interface DeliveryIdentityCardProps {
  note: DeliveryNoteData;
  business: BusinessData;
  totalValue: number;
  onSaveNotes: (newNotes: string) => Promise<void>;
}

export default function DeliveryIdentityCard({
  note,
  business,
  totalValue,
  onSaveNotes,
}: DeliveryIdentityCardProps) {
  const { t } = useTranslation("delivery");

  // --- Notes Editing State ---
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(note.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(note.notes || "");
  }, [note.notes]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveNotes(notes);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/5  p-6 mb-8 shadow-sm">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <HiOutlineTruck className="size-48" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
        {/* Icon Box */}
        <div className="size-24 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-100 dark:border-brand-500/20 shadow-inner shrink-0">
          <HiOutlineTruck className="size-10" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              color="info"
              className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase"
            >
              {t("list.columns.details") || "Manifest"}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {note.deliveryNumber}
          </h1>

          <div className="flex flex-wrap items-center gap-6 pt-1 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
              <HiOutlineCalendarDays className="size-4 text-brand-600 dark:text-brand-400" />
              {format(new Date(note.createdAt), "MMMM dd, yyyy")}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">
              <HiOutlineDocumentText className="size-4 text-brand-600 dark:text-brand-400" />
              {note.invoices.length} {t("list.items_count") || "Docs"}
            </div>
          </div>
        </div>

        {/* Value Box */}
        <div className="w-full md:w-auto bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-5 rounded-2xl text-center min-w-[160px]">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            {t("list.columns.value") || "Total Value"}
          </span>
          <span className="block text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
            {formatMoney(
              totalValue,
              business.currency,
              business.currencyFormat,
            )}
          </span>
        </div>
      </div>

      {/* --- NOTES SECTION (Interactive) --- */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-400">
            <HiOutlineInformationCircle className="size-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {t("form.notes_label") || "Notes"}
            </span>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
            >
              <HiPencil className="size-3 group-hover:scale-110 transition-transform" />
              {t("actions.edit") || "Edit"}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="relative">
            <textarea
              autoFocus
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                t("form.notes_placeholder") || "Add delivery notes..."
              }
              className="w-full h-24 p-4 text-sm border border-gray-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none resize-none bg-gray-50 dark:bg-black/20 text-gray-800 dark:text-white placeholder:text-gray-400 transition-all"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setNotes(note.notes || "");
                  setIsEditing(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                disabled={isSaving}
              >
                <HiXMark className="size-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-sm shadow-brand-500/20 disabled:opacity-70 disabled:cursor-wait"
              >
                {isSaving ? (
                  <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <HiCheck className="size-4" />
                )}
                {t("actions.save") || "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {note.notes ? (
              note.notes
            ) : (
              <span className="text-gray-600 dark:text-gray-300 italic font-light text-xs">
                {t("form.notes_empty") || "No notes added. Click to add..."}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
