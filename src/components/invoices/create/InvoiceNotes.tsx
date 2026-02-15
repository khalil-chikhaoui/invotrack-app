import { useTranslation } from "react-i18next";
import Label from "../../form/Label";

export default function InvoiceNotes({
  notes,
  setNotes,
}: {
  notes: string;
  setNotes: (v: string) => void;
}) {
  const { t } = useTranslation("invoice");

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-white/5">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-white/5 pb-3">
        <Label className="uppercase tracking-widest text-[10px] font-semibold text-gray-600 dark:text-gray-400 !mb-0">
          {t("create.sections.notes")}
        </Label>
      </div>
      <textarea
        className="w-full h-[100px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500 transition-all dark:text-white  placeholder:text-gray-500 placeholder:font-light dark:placeholder:text-gray-300"
        placeholder={t("create.placeholders.notes")}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
}