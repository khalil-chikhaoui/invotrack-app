import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { useTranslation } from "react-i18next";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmModalProps) {
  const getButtonClass = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white border-transparent";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600 text-white border-transparent";
      default:
        return "";
    }
  };
  const { t } = useTranslation("common");

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md m-4">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl ">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 mt-10 leading-relaxed">
          {description}
        </p>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={getButtonClass()}
          >
            {isLoading ? t("processing") : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
