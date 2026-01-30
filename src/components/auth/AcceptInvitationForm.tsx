/**
 * @fileoverview AcceptInvitationForm Component
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
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
import LanguageSelector from "../../components/common/LanguageSelector"; // Import added

export default function AcceptInvitationForm() {
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
  const [language, setLanguage] = useState("en"); // New State for Language

  /**
   * Initial Load:
   * Fetches the specific details associated with the invite token.
   */
  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setError("No secure invitation token was provided.");
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
          setError(
            err.message || "This invitation link is invalid or has expired.",
          );
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  /**
   * Submission Handler:
   * Distinguishes between creating a new identity and verifying an existing one.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData || !token) return;

    setError("");
    setIsSubmitting(true);

    try {
      let response;
      if (inviteData.userExists) {
        // Path A: Authenticate existing user (Language already set in their profile)
        response = await invitationsApi.acceptAndLogin({ token, password });
      } else {
        // Path B: Provision NEW user account (We need to save their language preference)
        response = await invitationsApi.acceptAndRegister({
          token,
          password,
          name,
          language, // Passing language here
        });
      }

      // Sync AuthContext with received JWT and User data
      login(response.token, response.user);

      // Redirect to the Business Selection hub
      navigate("/select-business");
    } catch (err: any) {
      setError(
        err.message || "Failed to finalize the invitation. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERING STATES ---

  if (isLoading) {
    return (
      <LoadingState message="Validating Security Token..." minHeight="50vh" />
    );
  }

  if (error && !inviteData) {
    return (
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl  border border-gray-100 dark:border-gray-700 animate-in zoom-in duration-300">
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
            Access Denied
          </h2>
          <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
            {error}
          </p>
          <Button
            type="button"
            className="w-full text-xs font-semibold uppercase tracking-widest"
            onClick={() => navigate("/signin")}
          >
            Return to Sign In
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
                alt="Business Logo"
                className="h-12 w-auto mb-6 rounded-xl object-contain border border-gray-100 dark:border-white/10 p-1"
              />
            )}
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md uppercase tracking-tight">
              Join {inviteData?.business.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              {inviteData?.userExists ? (
                <span>
                  Identity verified. Authenticate to join the organization as a{" "}
                  <strong>{inviteData.role}</strong>.
                </span>
              ) : (
                <span>
                  Registry entry initialized. Complete your profile to join as a{" "}
                  <strong>{inviteData?.role}</strong>.
                </span>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm font-semibold text-white bg-error-500 rounded-xl">
                {error}
              </div>
            )}

            {/* Email (Locked for data integrity) */}
            <div>
              <Label>Invitation Target</Label>
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
                    Full Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter your name"
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
                    label="Preferred Language"
                  />
                </div>
              </>
            )}

            {/* Security Verification */}
            <div>
              <Label>
                {inviteData?.userExists
                  ? "Identity Verification"
                  : "Secure Password"}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    inviteData?.userExists
                      ? "Enter your password"
                      : "Min. 6 characters"
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                  ? "Synchronizing..."
                  : inviteData?.userExists
                    ? "Verify & Join Team"
                    : "Provision Account & Join"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}