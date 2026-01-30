/**
 * @fileoverview SignInForm Component
 * Manages the user authentication lifecycle: input collection, API submission,
 * and state synchronization with AuthContext.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../apis/auth";

export default function SignInForm() {
  // --- UI Logic State ---
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Context & Navigation Hooks ---
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles form submission:
   * 1. Resets error state and triggers loading indicator.
   * 2. Calls the auth API for validation.
   * 3. Synchronizes local storage/context via login hook.
   * 4. Redirects to multi-tenant business selection.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await authApi.signIn({ email, password });
      // Update global Auth Context
      login(data.token, data.user);
      navigate("/select-business");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto justify-start  sm:justify-center sm:pt-0">
        <div>
          {/* --- Form Header --- */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your credentials to access your dashboard.
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
                  Email <span className="text-error-500">*</span>
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
                  Password <span className="text-error-500">*</span>
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                <div className="flex items-center gap-3">
                  {/* Optional: Add 'Remember Me' Checkbox here */}
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submission Button */}
              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
