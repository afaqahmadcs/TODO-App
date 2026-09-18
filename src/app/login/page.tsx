"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await authService.signIn(email, password);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage("Authentication successful. Redirecting to workspace...");
        setTimeout(() => {
          router.push(redirectUrl);
        }, 400);
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
      router.push(redirectUrl);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
          <h2 className="text-lg font-bold text-on-surface font-headline">Sign In</h2>
          <Link
            href="/signup"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Create Account &rarr;
          </Link>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in-50"
          >
            <Icon name="error" size={16} className="text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in-50"
          >
            <Icon name="check_circle" size={16} className="text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-secondary hover:underline"
              >
                Forgot password?
              </Link>
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
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Icon name="login" size={18} />
                <span>Sign In to Workspaces</span>
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

        {/* Quick Demo Creator Offline Option */}
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
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 selection:bg-primary-container selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <Suspense fallback={<div className="text-center text-outline">Loading login screen...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
