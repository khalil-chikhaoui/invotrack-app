/**
 * @fileoverview ResetPasswordForm Component
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next"; // <--- Import Hook
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { authApi } from "../../apis/auth";
import { ChevronLeftIcon } from "../../icons";

export default function ResetPasswordForm() {
  const { t } = useTranslation("auth"); // <--- Load "auth" namespace
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen, openModal, closeModal } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      openModal();
    } catch (err: any) {
      const errorCode = err.message;
      const translatedError = t(
        `errors.${errorCode}` as any, 
        t("errors.GENERIC_ERROR")
      );
      setError(translatedError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto justify-start lg:justify-center">
      {/* --- Navigation Backlink --- */}
      <div className="w-full mb-4 mt-2 sm:mt-10 animate-in fade-in duration-500">
        <button
          onClick={() => navigate("/signin")}
          className="inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
        >
          <ChevronLeftIcon className="size-5 mr-1" />
          {t("reset_password.back_to_signin")}
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* --- Header Section --- */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md tracking-tight">
            {t("reset_password.title")}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("reset_password.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Messenger */}
          {error && (
            <div className="p-4 text-sm font-semibold text-white bg-error-500 rounded-xl">
              {error}
            </div>
          )}

          {/* Email Input Field */}
          <div>
            <Label>
              {t("reset_password.email_label")} <span className="text-error-500">*</span>
            </Label>
            <Input 
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? t("reset_password.loading") 
              : t("reset_password.submit_button")
            }
          </Button>
        </form>
      </div>

      {/* --- SUCCESS MODAL --- */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[450px] m-4">
        <div className="relative w-full overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-11 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-success-50 rounded-full dark:bg-success-500/10">
              <svg
                className="w-8 h-8 text-success-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90  tracking-tight">
            {t("reset_password.modal.title")}
          </h4>
          <p className="mb-8 text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("reset_password.modal.body")} <br />
            <span className="font-semibold text-gray-900 dark:text-white">
              {email}
            </span>
          </p>

          <div className="flex flex-col gap-4">
            <Link to="/signin" className="w-full">
              <Button type="button"
                className="w-full py-3 text-xs font-medium  tracking-widest"
                size="sm"
              >
                {t("reset_password.modal.return_button")}
              </Button>
            </Link>
            <button type="button"
              onClick={closeModal}
              className="text-xs font-MEDIUM text-gray-400 my-2 tracking-widest hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {t("reset_password.modal.dismiss")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}