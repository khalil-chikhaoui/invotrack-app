/**
 * @fileoverview AcceptInvitationForm Component
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation, Trans } from "react-i18next";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import {
  invitationsApi,
  InvitationValidationResponse,
} from "../../apis/invitations";
import LoadingState from "../common/LoadingState";
import LanguageSelector from "../../components/common/LanguageSelector";

export default function AcceptInvitationForm() {
  const { t } = useTranslation("auth");
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- UI State ---
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- Data State ---
  const [inviteData, setInviteData] =
    useState<InvitationValidationResponse | null>(null);

  // --- Form Fields ---
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");

  /**
   * Initial Load:
   * Fetches the specific details associated with the invite token.
   */
  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setError(t("errors.INVITATION_INVALID"));
      setIsLoading(false);
      return;
    }

    invitationsApi
      .validateToken(token)
      .then((data) => {
        if (isMounted) {
          setInviteData(data);
          // Pre-fill user identity if provided by the administrator
          if (!data.userExists && data.name) {
            setName(data.name);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          // PRO ERROR HANDLING
          const errorCode = err.message;
          const translatedError = t(
            `errors.${errorCode}` as any,
            t("errors.INVITATION_INVALID"),
          );
          setError(translatedError);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, t]);

  /**
   * Submission Handler
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData || !token) return;

    setError("");
    setIsSubmitting(true);

    try {
      let response;
      if (inviteData.userExists) {
        response = await invitationsApi.acceptAndLogin({ token, password });
      } else {
        response = await invitationsApi.acceptAndRegister({
          token,
          password,
          name,
          language,
        });
      }

      login(response.token, response.user);
      navigate("/select-business");
    } catch (err: any) {
      // PRO ERROR HANDLING
      const errorCode = err.message;
      const translatedError = t(
        `errors.${errorCode}` as any,
        t("errors.GENERIC_ERROR"),
      );
      setError(translatedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERING STATES ---

  if (isLoading) {
    return (
      <LoadingState
        message={t("accept_invitation.loading_validating")}
        minHeight="50vh"
      />
    );
  }

  // Error State (e.g. Expired Token)
  if (error && !inviteData) {
    return (
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 animate-in zoom-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-50 dark:bg-error-900/30 mb-6">
            <svg
              className="h-8 w-8 text-error-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
            {t("accept_invitation.error_screen.title")}
          </h2>
          <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
            {error}
          </p>
          <Button
            type="button"
            className="w-full text-xs font-semibold uppercase tracking-widest"
            onClick={() => navigate("/signin")}
          >
            {t("accept_invitation.error_screen.return_button")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto justify-start pt-10 sm:justify-center sm:pt-0">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header & Org Identity */}
          <div className="mb-5 sm:mb-8">
            {inviteData?.business.logo && (
              <img
                src={inviteData.business.logo}
                alt={t("accept_invitation.business_logo_alt")}
                className="h-12 w-auto mb-6 rounded-xl object-contain border border-gray-100 dark:border-white/10 p-1"
              />
            )}
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md uppercase tracking-tight">
              {t("accept_invitation.title", {
                businessName: inviteData?.business.name,
              })}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              {/* Dynamic Subtitle using Trans for Bold text */}
              <Trans
                i18nKey={
                  inviteData?.userExists
                    ? "accept_invitation.subtitle_existing"
                    : "accept_invitation.subtitle_new"
                }
                t={t}
                values={{ role: inviteData?.role }}
                components={{
                  1: (
                    <strong className="font-semibold text-gray-800 dark:text-gray-200" />
                  ),
                }}
              />
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm font-semibold text-white bg-error-500 rounded-xl">
                {error}
              </div>
            )}

            {/* Email (Locked) */}
            <div>
              <Label>{t("accept_invitation.email_label")}</Label>
              <Input
                type="email"
                value={inviteData?.email || ""}
                disabled
                className="bg-gray-50 dark:bg-white/[0.02] cursor-not-allowed opacity-80"
              />
            </div>

            {/* NEW USER FIELDS: Name & Language */}
            {!inviteData?.userExists && (
              <>
                <div>
                  <Label>
                    {t("accept_invitation.full_name_label")}{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder={t("accept_invitation.full_name_placeholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                {/* --- LANGUAGE SELECTOR --- */}
                <div>
                  <LanguageSelector
                    value={language}
                    onChange={setLanguage}
                    label={t("accept_invitation.language_label")}
                  />
                </div>
              </>
            )}

            {/* Security Verification */}
            <div>
              <Label>
                {inviteData?.userExists
                  ? t("accept_invitation.password_label_existing")
                  : t("accept_invitation.password_label_new")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    inviteData?.userExists
                      ? t("accept_invitation.password_placeholder_existing")
                      : t("accept_invitation.password_placeholder_new")
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={
                    inviteData?.userExists ? "current-password" : "new-password"
                  }
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 p-1"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 size-5" />
                  )}
                </span>
              </div>
            </div>

            {/* Finalize Action */}
            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? t("accept_invitation.loading_submitting")
                  : inviteData?.userExists
                    ? t("accept_invitation.submit_existing")
                    : t("accept_invitation.submit_new")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
