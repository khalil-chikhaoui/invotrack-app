/**
 * @fileoverview NewPasswordForm Component
 */

import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useTranslation } from "react-i18next"; // <--- Import Hook
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authApi } from "../../apis/auth";
import { useAuth } from "../../context/AuthContext";

export default function NewPasswordForm() {
  const { t } = useTranslation("auth"); // <--- Load "auth" namespace
  
  // --- Context & Route Hooks ---
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- UI & Validation State ---
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Reset Handler:
   * 1. Performs strict client-side validation.
   * 2. Synchronizes with the authApi to update the database record.
   * 3. Upon success, initializes the Auth session and redirects to tenant selection.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation using translations
    if (password !== confirmPassword)
      return setError(t("errors.PASSWORDS_DO_NOT_MATCH"));
    if (password.length < 6)
      return setError(t("errors.PASSWORD_TOO_SHORT"));

    setError("");
    setIsLoading(true);

    try {
      const data = await authApi.resetPassword({ token, password });
      login(data.token, data.user);
      navigate("/select-business");
    } catch (err: any) {
      // PRO ERROR HANDLING
      const errorCode = err.message;
      const translatedError = t(
        `errors.${errorCode}` as any, 
        t("errors.AUTH_TOKEN_INVALID") // Fallback for this specific page
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
        <Link
          to="/signin"
          className="inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
        >
          <ChevronLeftIcon className="size-5 mr-1" />
          {t("new_password.back_to_signin")}
        </Link>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* --- Header --- */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md tracking-tight">
            {t("new_password.title")}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("new_password.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Messenger */}
          {error && (
            <div className="p-4 text-sm font-semibold text-white bg-error-500 rounded-xl">
              {error}
            </div>
          )}

          {/* Primary Password Input */}
          <div>
            <Label>
              {t("new_password.password_label")} <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("new_password.password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute -translate-y-1/2 cursor-pointer right-4 top-1/2 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <Label>
              {t("new_password.confirm_password_label")} <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("new_password.confirm_password_placeholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute -translate-y-1/2 cursor-pointer right-4 top-1/2 p-1"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 pb-20 lg:pb-0">
            <Button type="submit"  className="w-full" disabled={isLoading}>
              {isLoading ? t("new_password.loading") : t("new_password.submit_button")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}