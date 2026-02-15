/**
 * @fileoverview NewPasswordForm Component
 * Updated with professional password validation and real-time feedback.
 */

import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authApi } from "../../apis/auth";
import { useAuth } from "../../context/AuthContext";
import PasswordValidator from "./PasswordValidator";

export default function NewPasswordForm() {
  const { t } = useTranslation("auth");

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
   * Complexity Logic: 
   * Validates: 8+ chars, 1 Uppercase, 1 Lowercase, 1 Symbol.
   */
  const isPasswordValid = useMemo(() => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  }, [password]);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Secondary safety checks
    if (!passwordsMatch) return setError(t("errors.PASSWORDS_DO_NOT_MATCH"));
    if (!isPasswordValid) return setError(t("errors.PASSWORD_REQUIREMENTS_NOT_MET"));

    setError("");
    setIsLoading(true);

    try {
      const data = await authApi.resetPassword({ token, password });
      login(data.token, data.user);
      navigate("/select-business");
    } catch (err: any) {
      const errorCode = err.message;
      const translatedError = t(
        `errors.${errorCode}` as any,
        t("errors.AUTH_TOKEN_INVALID"),
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
            <div className="p-4 text-sm font-semibold text-white bg-error-500 rounded-xl animate-in shake duration-300">
              {error}
            </div>
          )}

          {/* Primary Password Input */}
          <div>
            <Label>
              {t("new_password.password_label")}{" "}
              <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("new_password.password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                // Red border if user typed but requirements aren't met
                error={password.length > 0 && !isPasswordValid}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>

            {/* INTERACTIVE VALIDATOR */}
            {password.length > 0 && <PasswordValidator password={password} />}
          </div>

          {/* Confirmation Input */}
          <div>
            <Label>
              {t("new_password.confirm_password_label")}{" "}
              <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("new_password.confirm_password_placeholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                // Red border if it doesn't match primary password
                error={confirmPassword.length > 0 && !passwordsMatch}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 p-1"
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
            <Button 
              type="submit" 
              className="w-full shadow-lg shadow-brand-500/20" 
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
            >
              {isLoading
                ? t("new_password.loading")
                : t("new_password.submit_button")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}