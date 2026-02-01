/**
 * @fileoverview PermissionDenied Component
 * A consistent, user-friendly UI for Access Control blocks.
 */

import { useNavigate } from "react-router";
import Button from "../ui/button/Button";
import {
  HiOutlineShieldExclamation,
  HiOutlineArrowLeft,
} from "react-icons/hi2";
import { useEffect } from "react";

interface PermissionDeniedProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function PermissionDenied({
  title = "Access Restricted",
  description = "You do not have the necessary permissions to view this page. Please contact your administrator.",
  actionText = "Return to Safety",
  onAction,
}: PermissionDeniedProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleAction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onAction]); // Dependencies ensure it uses the latest logic

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-300">
      <div
        className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4 
      border border-red-100 dark:border-red-500/20"
      >
        <HiOutlineShieldExclamation className="size-8 text-red-500" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
        {title}
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAction();
        }}
        className="space-y-4"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
          {description}
        </p>

        <Button
          type="submit"
          variant="outline"
          className="flex items-center gap-2 px-6 uppercase tracking-widest text-[10px] font-semibold border-gray-200 
        dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5"
        >
          <HiOutlineArrowLeft className="size-4" />
          {actionText}
        </Button>
      </form>
    </div>
  );
}
