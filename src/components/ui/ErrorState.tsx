"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  onFallback?: () => void;
  fallbackLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
  onFallback,
  fallbackLabel = "Return to Dashboard",
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "w-full p-8 rounded-2xl bg-surface-container-low border border-rose-500/30 flex flex-col items-center text-center space-y-4 shadow-sm animate-in fade-in duration-200",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/25 flex items-center justify-center shadow-inner">
        <Icon name="error_outline" size={28} />
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-rose-300/80 leading-relaxed font-mono">
          {message}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
        {onRetry && (
          <Button variant="primary" icon="refresh" onClick={onRetry} size="sm">
            {retryLabel}
          </Button>
        )}
        {onFallback && (
          <Button variant="outline" onClick={onFallback} size="sm">
            {fallbackLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
