"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: string;
  badge?: string;
  title: string;
  description: string;
  actionLabel?: string;
  primaryActionLabel?: string;
  onAction?: () => void;
  onPrimaryAction?: () => void;
  actionIcon?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: "primary" | "secondary" | "purple" | "emerald" | "cyan" | "rose" | "neutral";
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "inbox",
  badge,
  title,
  description,
  actionLabel,
  primaryActionLabel,
  onAction,
  onPrimaryAction,
  actionIcon = "add",
  secondaryActionLabel,
  onSecondaryAction,
  variant = "primary",
  className,
}) => {
  const handlePrimary = onAction || onPrimaryAction;
  const primaryText = actionLabel || primaryActionLabel;
  const variantStyles = {
    primary: {
      glow: "bg-primary/10 text-primary border-primary/20",
      buttonVariant: "primary" as const,
    },
    secondary: {
      glow: "bg-secondary/15 text-secondary border-secondary/25",
      buttonVariant: "secondary" as const,
    },
    purple: {
      glow: "bg-purple-500/15 text-purple-400 border-purple-500/25",
      buttonVariant: "primary" as const,
    },
    emerald: {
      glow: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      buttonVariant: "primary" as const,
    },
    cyan: {
      glow: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
      buttonVariant: "primary" as const,
    },
    rose: {
      glow: "bg-rose-500/15 text-rose-400 border-rose-500/25",
      buttonVariant: "primary" as const,
    },
    neutral: {
      glow: "bg-surface-container-high text-outline border-outline-variant/20",
      buttonVariant: "outline" as const,
    },
  };

  const style = variantStyles[variant] || variantStyles.primary;

  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        "w-full py-12 px-6 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex flex-col items-center text-center space-y-4 shadow-sm animate-in fade-in duration-200",
        className
      )}
    >
      {/* Icon with glowing container ring */}
      <div
        className={cn(
          "w-14 h-14 rounded-2xl border flex items-center justify-center shadow-inner",
          style.glow
        )}
      >
        <Icon name={icon} size={28} />
      </div>

      {badge && (
        <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium font-mono">
          {badge}
        </span>
      )}

      {/* Heading & Helpful Context */}
      <div className="max-w-md space-y-1.5">
        <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>

      {/* Interactive Action Triggers */}
      {(primaryText || secondaryActionLabel) && (
        <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
          {primaryText && handlePrimary && (
            <Button
              variant={style.buttonVariant}
              icon={actionIcon}
              onClick={handlePrimary}
              size="sm"
            >
              {primaryText}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              size="sm"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
