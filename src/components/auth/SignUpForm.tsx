/**
 * @fileoverview SignUpForm Component
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authApi } from "../../apis/auth";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // 1. Call API (returns { message, email })
      await authApi.signUp({ name, email, password });
      
      // 2. Redirect to Verify Page with email in state
      navigate("/verify-email", { state: { email } });
      
    } catch (err: any) {
      setError(err.message || "An error occurred while creating your account.");
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
              Create Account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Join Invotrack to streamline your business management.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 sm:space-y-5">
              {error && (
                <div className="p-4 text-sm font-semibold text-white bg-error-500 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <Label>
                  Full Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div>
                <Label>
                  Work Email <span className="text-error-500">*</span>
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

              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Min. 6 characters"
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
                  {isLoading ? "Synchronizing..." : "Sign Up"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-6 pb-8 lg:pb-0">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already part of the team?{" "}
              <Link
                to="/signin"
                className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
