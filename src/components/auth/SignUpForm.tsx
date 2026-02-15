/**
 * @fileoverview SignUpForm Component
 */

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authApi } from "../../apis/auth";
import LanguageSelector from "../../components/common/LanguageSelector";
import PasswordValidator from "./PasswordValidator";

export default function SignUpForm() {
  // 1. Get i18n instance from the hook
  const { t, i18n } = useTranslation("auth");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Logic to validate the "Contract"
  const isPasswordValid = useMemo(() => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  }, [password]);

  // 2. Initialize state with the CURRENT app language
  // We split by '-' to handle cases like 'en-US' -> 'en'
  const [language, setLanguage] = useState(
    i18n.language ? i18n.language.split("-")[0] : "en",
  );

  // 3. Handler to update BOTH local state and App UI
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang); // Updates the value sent to backend API
    i18n.changeLanguage(lang); // Updates the App UI immediately
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return; // Extra safety

    setError("");
    setIsLoading(true);
    try {
      await authApi.signUp({ name, email, password, language });
      navigate("/verify-email", { state: { email } });
    } catch (err: any) {
      setError(t(`errors.${err.message}`, t("errors.GENERIC_ERROR")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col w-full max-w-md mx-auto lg:justify-center lg:flex-1">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* --- Header --- */}
          <div className="mb-6 sm:mb-8 mt-2">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md tracking-tight">
              {t("signup.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {t("signup.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 sm:space-y-5">
              {error && (
                <div className="p-4 text-sm font-semibold text-white bg-error-500 rounded-xl">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <Label>
                  {t("signup.full_name_label")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder={t("signup.full_name_placeholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <Label>
                  {t("signup.email_label")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder={t("signup.email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Language Selector */}
              <div>
                <LanguageSelector
                  value={language}
                  onChange={handleLanguageChange}
                  label={t("signup.language_label")}
                />
              </div>

              {/* Password */}
              <div>
                <Label>
                  {t("signup.password_label")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder={t("signup.password_placeholder")}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    /* If they start typing and it's not valid, show red border border subtly */
                    error={password.length > 0 && !isPasswordValid}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 p-1"
                  >
                    {showPassword ? (
                      <EyeIcon className="size-5 fill-gray-500" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500" />
                    )}
                  </span>
                </div>

                {/* INTERACTIVE VALIDATOR */}
                {password.length > 0 && (
                  <PasswordValidator password={password} />
                )}
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("signup.loading") : t("signup.submit_button")}
                </Button>
              </div>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pb-8 lg:pb-0">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              {t("signup.already_member")}{" "}
              <Link
                to="/signin"
                className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
              >
                {t("signup.signin_link")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
