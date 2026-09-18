"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/authService";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your account email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.resetPassword(email);
      if (res.success) {
        setSuccessMessage(
          "Password reset instructions sent! Please check your inbox and follow the secure link."
        );
      } else {
        setErrorMessage(res.error || "Failed to send reset email. Please try again.");
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 selection:bg-primary-container selection:text-white">
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary p-0.5 mx-auto shadow-lg shadow-primary/20 flex items-center justify-center">
            <div className="w-full h-full bg-surface-container-lowest rounded-[14px] flex items-center justify-center">
              <Icon name="lock_reset" size={24} className="text-primary" />
            </div>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            Reset Password
          </h1>
          <p className="text-xs text-on-surface-variant font-mono">
            ENTER YOUR EMAIL TO RECEIVE A RECOVERY LINK
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
                Account Email
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
                  placeholder="name@example.com"
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
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <Icon name="send" size={18} />
                  <span>Send Recovery Instructions</span>
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
              <span>Return to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
