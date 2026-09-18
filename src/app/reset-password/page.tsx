"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.updatePassword(password);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage("Password updated successfully! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update password. Please try again."
      );
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
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary p-0.5 mx-auto shadow-lg shadow-primary/20 flex items-center justify-center">
            <div className="w-full h-full bg-surface-container-lowest rounded-[14px] flex items-center justify-center">
              <Icon name="key" size={24} className="text-primary" />
            </div>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            Set New Password
          </h1>
          <p className="text-xs text-on-surface-variant font-mono">
            ENTER YOUR NEW SECURE ACCOUNT CREDENTIALS
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-2xl space-y-6 backdrop-blur-xl">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant block">
                New Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-outline">
                  <Icon name="lock" size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-surface-container text-sm text-on-surface placeholder:text-outline/60 pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant block">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-outline">
                  <Icon name="lock" size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Icon name="check" size={18} />
                  <span>Update Password & Open App</span>
                </>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-outline-variant/15">
            <Link
              href="/login"
              className="text-xs font-medium text-secondary hover:underline flex items-center justify-center gap-1.5"
            >
              <Icon name="arrow_back" size={14} />
              <span>Cancel & Return to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
