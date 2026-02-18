import { useTranslation } from "react-i18next";
import { HiOutlinePencilSquare, HiOutlinePrinter } from "react-icons/hi2";
import Button from "../../components/ui/button/Button";
import { BusinessData } from "../../apis/business";
import { InvoiceData } from "../../apis/invoices";

interface ManifestNotesInputProps {
  manifestNotes: string;
  setManifestNotes: (val: string) => void;
  selectedList: InvoiceData[];
  business: BusinessData | null;
  isUpdating: boolean;
  onGenerate: () => void;
  onReset: () => void;
}

export default function ManifestNotesInput({
  manifestNotes,
  setManifestNotes,
  selectedList,
  business,
  isUpdating,
  onGenerate,
  onReset,
}: ManifestNotesInputProps) {
  const { t } = useTranslation("delivery");

  return (
    <div className="lg:w-80 space-y-4">
      <div className="relative">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 mb-1.5 block px-1">
          {t("form.notes_label")}
        </label>
        <textarea
          value={manifestNotes}
          onChange={(e) => setManifestNotes(e.target.value)}
          placeholder={t("form.notes_placeholder")}
          className="w-full h-24 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500 transition-all dark:text-white placeholder:text-gray-500 placeholder:font-light dark:placeholder:text-gray-300 resize-none shadow-sm"
        />
        <HiOutlinePencilSquare className="absolute bottom-3 right-3 size-4 text-gray-300" />
      </div>

      <div className="flex flex-col gap-2">
        {business && selectedList.length > 0 ? (
          <Button
            onClick={onGenerate}
            disabled={isUpdating}
            className="w-full rounded-xl h-11 shadow-lg shadow-brand-500/20 text-[10px] uppercase font-bold tracking-widest"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <div className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("actions.shipping")}
              </span>
            ) : (
              <>
                <HiOutlinePrinter className="size-4 mr-2" />{" "}
                {t("actions.generate")}
              </>
            )}
          </Button>
        ) : (
          <Button
            disabled
            className="w-full rounded-xl h-11 text-[10px] uppercase font-bold tracking-widest"
          >
            {t("actions.generate")}
          </Button>
        )}

        <Button
          disabled={selectedList.length === 0 || isUpdating}
          variant="outline"
          onClick={onReset}
          className="w-full rounded-xl text-[10px] uppercase font-bold tracking-widest h-11"
        >
          {t("actions.reset")}
        </Button>
      </div>
    </div>
  );
}
