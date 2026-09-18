"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { OfficeKpiMetrics } from "@/types/office";

interface OfficeKpiGridProps {
  metrics: OfficeKpiMetrics;
}

export function OfficeKpiGrid({ metrics }: OfficeKpiGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Today's Office Tasks */}
      <Card variant="low" hoverEffect className="p-3.5 relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-outline font-mono truncate">
            Today&apos;s Tasks
          </span>
          <span className="p-1 rounded-md bg-surface-container-high text-primary flex items-center justify-center shrink-0">
            <Icon name="bolt" size={16} />
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold font-headline text-on-surface">
            {metrics.todayTasksCount} Active
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono mt-0.5 block truncate">
            Across 8 channels
          </span>
        </div>
      </Card>

      {/* 2. Completed Today */}
      <Card variant="low" hoverEffect className="p-3.5 relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-secondary/5 rounded-full blur-xl pointer-events-none group-hover:bg-secondary/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-outline font-mono truncate">
            Completed Today
          </span>
          <span className="p-1 rounded-md bg-surface-container-high text-secondary flex items-center justify-center shrink-0">
            <Icon name="task_alt" size={16} />
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold font-headline text-secondary">
            {metrics.completedTodayCount} Done
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-full bg-surface-container-highest rounded-full h-1 overflow-hidden">
              <div
                className="bg-secondary h-1 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (metrics.completedTodayCount / Math.max(1, metrics.todayTasksCount)) * 100
                    )
                  )}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-secondary font-mono font-semibold shrink-0">
              {metrics.completionRate}%
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Pending Today */}
      <Card variant="low" hoverEffect className="p-3.5 relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-tertiary/5 rounded-full blur-xl pointer-events-none group-hover:bg-tertiary/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-outline font-mono truncate">
            Pending Today
          </span>
          <span className="p-1 rounded-md bg-surface-container-high text-tertiary flex items-center justify-center shrink-0">
            <Icon name="hourglass_top" size={16} />
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold font-headline text-on-surface">
            {metrics.pendingTodayCount} Queued
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono mt-0.5 block truncate">
            {metrics.inReviewCount > 0 ? `${metrics.inReviewCount} in review` : "Awaiting dispatch"}
          </span>
        </div>
      </Card>

      {/* 4. Overdue */}
      <Card variant="low" hoverEffect className="p-3.5 relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-rose-500/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-outline font-mono truncate">
            Overdue
          </span>
          <span className="p-1 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
            <Icon name="priority_high" size={16} />
          </span>
        </div>
        <div className="mt-2.5">
          <div
            className={`text-xl font-bold font-headline ${
              metrics.overdueCount > 0 ? "text-rose-400" : "text-on-surface"
            }`}
          >
            {metrics.overdueCount} {metrics.overdueCount === 1 ? "Task" : "Tasks"}
          </div>
          <span className="text-[10px] text-rose-400/80 font-mono mt-0.5 block truncate">
            {metrics.overdueCount > 0 ? "Requires action" : "Zero overdue"}
          </span>
        </div>
      </Card>

      {/* 5. High Priority */}
      <Card variant="low" hoverEffect className="p-3.5 relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-outline font-mono truncate">
            High Priority
          </span>
          <span className="p-1 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <Icon name="whatshot" size={16} />
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold font-headline text-amber-400">
            {metrics.highPriorityCount} Reels
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono mt-0.5 block truncate">
            5 Client Channels
          </span>
        </div>
      </Card>

      {/* 6. Medium Priority */}
      <Card variant="low" hoverEffect className="p-3.5 relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-outline font-mono truncate">
            Medium Priority
          </span>
          <span className="p-1 rounded-md bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
            <Icon name="tune" size={16} />
          </span>
        </div>
        <div className="mt-2.5">
          <div className="text-xl font-bold font-headline text-blue-400">
            {metrics.mediumPriorityCount} Tasks
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono mt-0.5 block truncate">
            Facebook &amp; Music
          </span>
        </div>
      </Card>
    </div>
  );
}
