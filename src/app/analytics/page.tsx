"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export default function AnalyticsPage() {
  const weeklyVelocity = [
    { day: "Mon", tasks: 8, height: "65%" },
    { day: "Tue", tasks: 12, height: "90%" },
    { day: "Wed", tasks: 7, height: "55%" },
    { day: "Thu", tasks: 10, height: "80%" },
    { day: "Fri", tasks: 9, height: "70%" },
    { day: "Sat", tasks: 5, height: "40%" },
    { day: "Sun", tasks: 6, height: "50%" },
  ];

  return (
    <PageContainer>
      <PageHeader
        badge="Velocity & Telemetry"
        metaText="System coherence: 99.8% • Top 5% productivity index"
        title="Analytics"
        description="Deep performance telemetry, flow-state tracking, and multi-workspace velocity analysis."
      />

      {/* 4 Analytics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="low" hoverEffect>
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
            Weekly Completed
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-headline text-on-surface block mt-2">
            57 Tasks
          </span>
          <span className="text-xs text-secondary font-mono mt-1 block">↑ 14% vs last week</span>
        </Card>

        <Card variant="low" hoverEffect>
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
            Flow-State Focus
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-headline text-on-surface block mt-2">
            28.4 Hours
          </span>
          <span className="text-xs text-primary font-mono mt-1 block">Avg 4.1h / day</span>
        </Card>

        <Card variant="low" hoverEffect>
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
            Publishing Streak
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-headline text-amber-400 block mt-2">
            14 Days
          </span>
          <span className="text-xs text-amber-300 font-mono mt-1 block">Active creator streak</span>
        </Card>

        <Card variant="low" hoverEffect>
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
            On-Time Completion
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-headline text-emerald-400 block mt-2">
            94.2%
          </span>
          <span className="text-xs text-emerald-300 font-mono mt-1 block">Zero overdue backlog</span>
        </Card>
      </div>

      {/* Velocity Bar Chart Visualization */}
      <Card variant="low" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
          <div>
            <h3 className="text-base font-bold text-on-surface font-headline">
              Weekly Task Completion Distribution
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Completed items across Office, Personal, College, and Web Dev.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-xs text-secondary">
            Peak: Tuesday
          </span>
        </div>

        {/* Bar visualization */}
        <div className="h-44 flex items-end justify-between gap-3 pt-6 px-4">
          {weeklyVelocity.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[11px] font-mono text-outline">{item.tasks}</span>
              <div
                className="w-full max-w-[48px] bg-gradient-to-t from-primary-container to-secondary rounded-t-lg transition-all duration-500 hover:brightness-125"
                style={{ height: item.height }}
              />
              <span className="text-xs font-mono text-on-surface-variant font-semibold">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
