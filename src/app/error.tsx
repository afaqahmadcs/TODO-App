"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service or console
    console.error("[Afaq TaskFlow Production Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-surface-container-low border border-rose-500/25 shadow-2xl space-y-6 text-center">
        {/* Glowing Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <Icon name="error" size={32} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-mono font-semibold">
            APPLICATION RUNTIME ALERT
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            Something unexpected occurred
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            The application caught an unexpected error. Your workspace state is safe. You can retry the operation or return to the main dashboard.
          </p>
        </div>

        {/* Error Details in Dev / Debug */}
        {error.message && (
          <div className="p-3 rounded-xl bg-surface-container text-left border border-outline-variant/15 font-mono text-xs text-rose-300/90 break-words max-h-32 overflow-y-auto">
            {error.message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Icon name="refresh" size={16} />
            <span>Try Again</span>
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border-outline-variant/25"
            >
              <Icon name="dashboard" size={16} />
              <span>Return to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
