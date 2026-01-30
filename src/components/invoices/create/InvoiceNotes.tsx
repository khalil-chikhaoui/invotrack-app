import Label from "../../form/Label";

export default function InvoiceNotes({
  notes,
  setNotes,
}: {
  notes: string;
  setNotes: (v: string) => void;
}) {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm ">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-white/5 pb-3">
        <Label className="uppercase tracking-widest text-[10px] font-semibold text-gray-600 dark:text-gray-400 !mb-0">
          Invoice Notes & Terms
        </Label>
      </div>
      <textarea
        className="w-full h-[100px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm font-medium outline-none focus:border-brand-500 transition-all dark:text-white resize-none dark:placeholder-gray-400 placeholder-gray-400"
        placeholder="Payment instructions, bank wire details, or custom messages..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
}
