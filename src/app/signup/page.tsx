"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

const COMMON_TIMEZONES = [
  "Asia/Karachi",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Singapore",
  "Asia/Tokyo",
  "UTC",
];

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";
    } catch {
      return "Asia/Karachi";
    }
  });
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
      const res = await authService.signUp(email, password, fullName, timezone);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage("Account created successfully! Initializing clean workspaces...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 selection:bg-primary-container selection:text-white">
      {/* Ambient background lighting */}
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
            Create Account
          </h1>
          <p className="text-xs text-on-surface-variant font-mono">
            GET STARTED WITH AFAQ TASKFLOW WORKSPACES
          </p>
        </div>

        {/* Signup Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-2xl space-y-6 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
            <h2 className="text-lg font-bold text-on-surface font-headline">New Registration</h2>
            <Link
              href="/login"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Sign In &rarr;
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
                Full Name
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-outline">
                  <Icon name="badge" size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-surface-container text-sm text-on-surface placeholder:text-outline/60 pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

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
                  placeholder="alex@example.com"
                  className="w-full bg-surface-container text-sm text-on-surface placeholder:text-outline/60 pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant block">
                Operating Timezone
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-outline">
                  <Icon name="schedule" size={16} />
                </span>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-surface-container text-sm text-on-surface pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer"
                >
                  {!COMMON_TIMEZONES.includes(timezone) && (
                    <option value={timezone}>{timezone} (Detected)</option>
                  )}
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant block">
                  Password
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
                    placeholder="••••••••"
                    className="w-full bg-surface-container text-sm text-on-surface placeholder:text-outline/60 pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant block">
                  Confirm Password
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
                    placeholder="••••••••"
                    className="w-full bg-surface-container text-sm text-on-surface placeholder:text-outline/60 pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-outline">
              New accounts start completely clean with 4 default workspaces: Office, Personal, College, and Web Development.
            </p>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon name="progress_activity" size={18} className="animate-spin" />
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <>
                  <Icon name="person_add" size={18} />
                  <span>Register & Open TaskFlow</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Security & Privacy Footer */}
        <div className="text-center text-[11px] font-mono text-outline space-y-1">
          <p>Multi-tenant isolated • Supabase Row-Level Security</p>
          <p>Zero cross-user access to tasks, notes, or calendar items</p>
        </div>
      </div>
    </div>
  );
}
