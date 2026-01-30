
import { HiOutlineCheckCircle, HiOutlineTruck } from "react-icons/hi2";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "payment" | "delivery"; // Determines the icon
  options: string[];
  currentValue: string;
  onValueChange: (val: any) => void;
  onConfirm: () => void;
  isLoading: boolean;
  confirmLabel?: string;
}

export default function StatusUpdateModal({
  isOpen,
  onClose,
  title,
  type,
  options,
  currentValue,
  onValueChange,
  onConfirm,
  isLoading,
  confirmLabel = "Update",
}: StatusUpdateModalProps) {
   
  // Logic to determine if we are in a "Danger" state (specifically for Cancelled)
  const isDangerState = currentValue === "Cancelled";

  // Helper for dynamic styling of options
  const getOptionStyle = (option: string) => {
    const isSelected = option === currentValue;
    let base = "flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ";

    if (isSelected) {
      if (option === "Cancelled") {
        return base + "border-red-500 bg-red-50 dark:bg-red-500/20 ring-1 ring-red-500 text-red-600 dark:text-red-400";
      }
      return base + "border-brand-500 bg-brand-50 dark:bg-brand-500/20 ring-1 ring-brand-500 text-brand-600 dark:text-brand-400";
    }

    return base + "border-gray-100 dark:border-white/[0.08] text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5";
  };

  return (
   <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px] m-4">
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onConfirm();
    }}
    className="p-6 bg-white dark:bg-gray-900 rounded-3xl text-center text-start"
  >
    {/* Dynamic Icon Header */}
    <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
      {type === "payment" ? (
        <HiOutlineCheckCircle className="size-6 text-brand-500" />
      ) : (
        <HiOutlineTruck className="size-6 text-brand-500" />
      )}
    </div>

    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 uppercase tracking-tight text-center">
      {title}
    </h4>

    {/* Options Loop */}
    <div className="space-y-3">
      {options.map((option) => (
        <label key={option} className={getOptionStyle(option)}>
          <span className="text-sm font-semibold tracking-widest">
            {option}
          </span>
          <input
            type="radio"
            name="modal-option" // Added name for accessibility
            className="sr-only"
            checked={currentValue === option}
            onChange={() => onValueChange(option)}
          />
          {currentValue === option && (
            <div
              className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)] ${
                option === "Cancelled" ? "bg-red-500" : "bg-brand-500"
              }`}
            ></div>
          )}
        </label>
      ))}
    </div>

    {/* Action Buttons */}
    <div className="flex gap-3 mt-8">
      <Button
        type="button" // Explicitly type button to prevent Enter triggering cancel
        variant="outline"
        className="w-full text-[10px] font-semibold uppercase tracking-widest"
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        type="submit" // Allows Enter to trigger onConfirm
        className={`w-full text-[10px] font-semibold uppercase tracking-widest ${
          isDangerState ? "!bg-red-600 hover:!bg-red-700 !text-white" : ""
        }`}
        disabled={isLoading}
      >
        {confirmLabel}
      </Button>
    </div>
  </form>
</Modal>
  );
}