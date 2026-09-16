import React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  badge?: string;
  badgeColor?: string;
  metaText?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  badgeColor = "text-primary bg-primary-container/20",
  metaText,
  title,
  description,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-2",
        className
      )}
    >
      <div className="flex flex-col gap-1.5 max-w-3xl">
        {(badge || metaText) && (
          <div className="flex items-center gap-2 flex-wrap">
            {badge && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider",
                  badgeColor
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{badge}</span>
              </span>
            )}
            {badge && metaText && <span className="text-outline text-xs">•</span>}
            {metaText && (
              <span className="text-xs text-on-surface-variant font-medium">
                {metaText}
              </span>
            )}
          </div>
        )}
        <h1 className="font-headline-xl text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
