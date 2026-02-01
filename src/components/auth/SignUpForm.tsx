/**
 * @fileoverview SignUpForm Component
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authApi } from "../../apis/auth";
import LanguageSelector from "../../components/common/LanguageSelector";

export default function SignUpForm() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("en");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authApi.signUp({ name, email, password, language });
      navigate("/verify-email", { state: { email } });
    } catch (err: any) {
      const errorCode = err.message;
      const translatedError = t(
        `errors.${errorCode}` as any,
        t("errors.GENERIC_ERROR"),
      );
      setError(translatedError);
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
                  onChange={setLanguage}
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
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 p-1"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
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
