"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === "signin") {
        const res = await authService.signIn(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage("Authentication successful. Redirecting to workspace...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 400);
        }
      } else {
        const res = await authService.signUp(email, password, fullName);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage(
            "Account registered successfully! Redirecting to workspace..."
          );
          setTimeout(() => {
            router.push("/dashboard");
          }, 400);
        }
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authService.signIn("afaq@taskflow.dev", "demo-password");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address to receive reset instructions.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await authService.resetPassword(email);
      if (res.success) {
        setSuccessMessage("Password reset email sent. Please check your inbox.");
      } else {
        setErrorMessage(res.error || "Failed to send password reset email.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 selection:bg-primary-container selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary p-0.5 mx-auto shadow-lg shadow-primary/20 flex items-center justify-center">
            <div className="w-full h-full bg-surface-container-lowest rounded-[14px] flex items-center justify-center">
              <Icon name="bolt" size={24} className="text-primary" />
            </div>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            Afaq TaskFlow
          </h1>
          <p className="text-xs text-on-surface-variant font-mono">
            MULTI-WORKSPACE WORKFLOW SYSTEM • GOOGLE STITCH
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-2xl space-y-6 backdrop-blur-xl">
          {/* Mode Tabs */}
          <div className="flex p-1 rounded-xl bg-surface-container border border-outline-variant/15 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2"
            >
              <Icon name="error" size={16} className="text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2"
            >
              <Icon name="check_circle" size={16} className="text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant block">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-outline">
                    <Icon name="badge" size={16} />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Afaq Ahmad"
                    className="w-full bg-surface-container text-sm text-on-surface placeholder:text-outline/60 pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant block">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-outline">
                  <Icon name="mail" size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="afaq@taskflow.dev"
                  className="w-full bg-surface-container text-sm text-on-surface placeholder:text-outline/60 pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface-variant block">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-medium text-secondary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-outline">
                  <Icon name="lock" size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container text-sm text-on-surface placeholder:text-outline/60 pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon name="progress_activity" size={18} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === "signin" ? (
                <>
                  <Icon name="login" size={18} />
                  <span>Sign In to Workspaces</span>
                </>
              ) : (
                <>
                  <Icon name="person_add" size={18} />
                  <span>Create Account</span>
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-outline-variant/15" />
            <span className="text-[10px] font-mono uppercase text-outline">or</span>
            <div className="flex-1 h-px bg-outline-variant/15" />
          </div>

          {/* Quick Demo Mode Bypass */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGuestContinue}
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-mono font-medium text-on-surface hover:text-white flex items-center justify-center gap-2 border-outline-variant/25 hover:bg-surface-container"
          >
            <Icon name="explore" size={16} className="text-secondary" />
            <span>Continue as Demo Creator (Offline Mode)</span>
          </Button>
        </div>

        {/* Security Footer */}
        <div className="text-center text-[11px] font-mono text-outline space-y-1">
          <p>Protected by Supabase Row-Level Security (RLS)</p>
          <p>Zero cross-user data leakage • Multi-tenant isolated</p>
        </div>
      </div>
    </div>
  );
}
