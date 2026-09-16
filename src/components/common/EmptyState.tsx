import React from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: string;
  badge?: string;
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "task_alt",
  badge,
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface-container-low border border-outline-variant/20 p-8 flex flex-col items-center text-center shadow-sm max-w-md mx-auto my-8",
        className
      )}
    >
      {/* Visual Duotone Icon Container */}
      <div className="w-14 h-14 rounded-2xl bg-primary-container/15 text-primary flex items-center justify-center mb-4 ring-1 ring-primary/20">
        <Icon name={icon} size={30} />
      </div>

      {badge && (
        <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium mb-2 font-mono">
          {badge}
        </span>
      )}

      <h3 className="font-headline-sm text-lg font-bold text-on-surface">
        {title}
      </h3>

      <p className="text-sm text-on-surface-variant mt-1.5 mb-6 max-w-sm leading-relaxed">
        {description}
      </p>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-2.5">
        {primaryActionLabel && (
          <Button
            onClick={onPrimaryAction}
            variant="primary"
            className="w-full shadow-sm"
          >
            {primaryActionLabel}
          </Button>
        )}
        {secondaryActionLabel && (
          <Button
            onClick={onSecondaryAction}
            variant="secondary"
            className="w-full"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
