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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
      {/* KPI 1: Today's Tasks */}
      <Card variant="low" hoverEffect className="relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
            Today&apos;s Tasks
          </span>
          <span className="p-1.5 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
            <Icon name="bolt" size={18} />
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline text-on-surface">
              {metrics.todayActiveTasks} Active
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-mono text-[11px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded font-semibold">
              +{Math.max(1, Math.round(metrics.todayActiveTasks * 0.2))} scheduled
            </span>
            <span className="text-[11px] text-on-surface-variant">across 8 channels</span>
          </div>
        </div>
      </Card>

      {/* KPI 2: Completed Tasks */}
      <Card variant="low" hoverEffect className="relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none group-hover:bg-secondary/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
            Completed
          </span>
          <span className="p-1.5 rounded-lg bg-surface-container-high text-secondary flex items-center justify-center">
            <Icon name="task_alt" size={18} />
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline text-on-surface">
              {metrics.completedCount} Done
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-secondary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, metrics.completionRate))}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-secondary font-semibold">
              {metrics.completionRate}%
            </span>
          </div>
        </div>
      </Card>

      {/* KPI 3: Pending Pipeline */}
      <Card variant="low" hoverEffect className="relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-tertiary/5 rounded-full blur-xl pointer-events-none group-hover:bg-tertiary/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
            Pending Pipeline
          </span>
          <span className="p-1.5 rounded-lg bg-surface-container-high text-tertiary flex items-center justify-center">
            <Icon name="hourglass_top" size={18} />
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline text-on-surface">
              {metrics.pendingCount} Remaining
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[11px] text-on-surface-variant">
              {metrics.inReviewCount} in Review approval
            </span>
          </div>
        </div>
      </Card>

      {/* KPI 4: Overdue & Urgent */}
      <Card variant="low" hoverEffect className="relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-rose-500/10 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
            Overdue &amp; Urgent
          </span>
          <span className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <Icon name="priority_high" size={18} />
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline text-rose-400">
              {metrics.urgentCount} Urgent
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-mono text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-medium truncate max-w-[170px]">
              {metrics.urgentNotice || "All on track"}
            </span>
          </div>
        </div>
      </Card>

      {/* KPI 5: Office Productivity Score */}
      <Card variant="low" hoverEffect className="relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary-container/10 rounded-full blur-xl pointer-events-none group-hover:bg-primary-container/20 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
            Productivity Score
          </span>
          <span className="p-1.5 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center">
            <Icon name="local_fire_department" size={18} className="text-amber-400" />
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline text-on-surface">
              {metrics.productivityScore}%
            </span>
            <span className="font-mono text-[11px] text-secondary font-medium">Top 5%</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-on-surface-variant text-[11px] font-mono">
            <span>🔥 {metrics.streakDays}-day publishing streak</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
