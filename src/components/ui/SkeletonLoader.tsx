"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-surface-container-high/60",
        className
      )}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-3 shadow-sm",
            className
          )}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
          <div className="pt-2 flex items-center justify-between border-t border-outline-variant/10">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </div>
      ))}
    </>
  );
};

export const RowSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className,
}) => {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between gap-3 shadow-sm",
            className
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="w-4 h-4 rounded shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-3 w-1/4 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className,
}) => {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/15 space-y-2.5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="w-7 h-7 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-2 w-28 rounded" />
        </div>
      ))}
    </div>
  );
};

export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-surface-container-low border border-outline-variant/15 p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
        <Skeleton className="h-6 w-32 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 h-96">
        {Array.from({ length: 28 }).map((_, i) => (
          <Skeleton key={i} className="h-full rounded-xl" />
        ))}
      </div>
    </div>
  );
};
