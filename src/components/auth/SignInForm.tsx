import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../apis/auth";
import { useTranslation } from "react-i18next";

export default function SignInForm() {
  // --- UI Logic State ---
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation("auth");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await authApi.signIn({ email, password });
      login(data.token, data.user);
      navigate("/select-business");
    } catch (err: any) {
      // Detect if the browser couldn't reach the server (Failed to fetch)
      const errorCode =
        err.message === "Failed to fetch"
          ? "SERVER_UNREACHABLE"
          : (err.message as string);

      if (errorCode === "AUTH_NOT_VERIFIED") {
        navigate("/verify-email", { state: { email } });
        return;
      }

      /** * 2. Cast the template literal to 'any' or the specific TFunction type
       * to bypass the strict key check.
       */
      const translatedError =
        t(`errors.${errorCode}` as any) || t("errors.GENERIC_ERROR" as any);
      setError(translatedError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto justify-start sm:justify-center sm:pt-0">
        <div>
          {/* --- Form Header --- */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("signin.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("signin.subtitle")}
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Feedback */}
              {error && (
                <div className="p-3 text-sm text-white bg-red-500 rounded-lg animate-in fade-in duration-300">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <Label>
                  {t("signin.email_label")}{" "}
                  <span className="text-error-500">*</span>
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

              {/* Password Input */}
              <div>
                <Label>
                  {t("signin.password_label")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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

              {/* Auxiliary Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"></div>
                <Link
                  to="/reset-password"
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
                >
                  {t("signin.forgot_password")}
                </Link>
              </div>

              {/* Submission Button */}
              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("signin.loading") : t("signin.submit_button")}
                </Button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                {t("signin.no_account")}{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
                >
                  {t("signin.signup_link")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
