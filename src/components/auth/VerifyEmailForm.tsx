import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../apis/auth";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { ChevronLeftIcon } from "../../icons";

interface LocationState {
  email?: string;
}

export default function VerifyEmailForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Type assertion to safely access state
  const state = location.state as LocationState;

  // Initialize email from navigation state if available
  const [email, setEmail] = useState(state?.email || "");
  const [code, setCode] = useState("");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await authApi.verifyEmail({ email, code });
      
      // Verification successful -> Login and update context
      login(data.token, data.user);
      
      // Determine redirection based on membership status
      if (data.user.memberships.length === 0) {
        navigate("/create-business");
      } else {
        navigate("/select-business");
      }
    } catch (err: any) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email is missing.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setIsResending(true);
    try {
      await authApi.resendVerification(email);
      setSuccessMsg("A new code has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto justify-start lg:justify-center">
      {/* Back Link */}
      <div className="w-full mb-4 mt-2 sm:mt-10 animate-in fade-in duration-500">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
        >
          <ChevronLeftIcon className="size-5 mr-1" />
          Back to Sign In
        </Link>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            We sent a 6-digit code to <span className="font-semibold text-gray-800 dark:text-gray-200">{email || "your email"}</span>. 
            Enter it below to confirm your account.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          {error && (
            <div className="p-4 text-sm font-medium text-white bg-error-600 rounded-xl">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-4 text-sm font-medium text-white bg-green-600 rounded-lg">
              {successMsg}
            </div>
          )}

          {/* Fallback: Allow user to type email if it wasn't passed via state */}
          {!state?.email && (
             <div>
                <Label>Email Address</Label>
                <Input 
                   type="email" 
                   value={email} 
                   onChange={(e) => setEmail(e.target.value)} 
                   required 
                   placeholder="Enter your email"
                />
             </div>
          )}

          <div>
            <Label>Verification Code</Label>
            <Input
              type="text"
              placeholder="☀☀☀☀☀☀"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="tracking-[0.3em] text-center text-lg md:text-xl"
              required
              maxLength={6}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isLoading || code.length < 6}>
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 disabled:opacity-50 transition-colors"
            >
              {isResending ? "Sending..." : "Didn't receive code? Resend"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}