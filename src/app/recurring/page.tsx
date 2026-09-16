"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function RecurringTasksPage() {
  const recurringRules = [
    {
      title: "Web Dev Live Class #1",
      schedule: "Every Monday • 4:00 PM — 6:00 PM",
      workspace: "Web Development",
      color: "border-l-cyan-500",
      status: "Active",
      nextRun: "In 5 days",
    },
    {
      title: "Web Dev Architecture Lab #2",
      schedule: "Every Tuesday • 4:00 PM — 6:00 PM",
      workspace: "Web Development",
      color: "border-l-cyan-500",
      status: "Active",
      nextRun: "Today at 4:00 PM",
    },
    {
      title: "Office Daily Publishing Matrix Checklist",
      schedule: "Daily • 10:00 AM",
      workspace: "Office",
      color: "border-l-blue-500",
      status: "Active",
      nextRun: "Tomorrow at 10:00 AM",
    },
    {
      title: "Daily Vlog B-Roll Ingest & Timeline Setup",
      schedule: "Daily • 8:00 PM",
      workspace: "Personal",
      color: "border-l-purple-500",
      status: "Active",
      nextRun: "Today at 8:00 PM",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        badge="Automation Engine"
        metaText="4 standing schedules auto-populated into queue"
        title="Recurring Tasks"
        description="Automate routines, weekly class schedules, and publishing checklists."
        actions={
          <Button variant="primary" icon="add">
            + New Recurring Routine
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recurringRules.map((rule, idx) => (
          <Card
            key={idx}
            variant="low"
            className={`p-5 border-l-4 ${rule.color} space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-secondary">
                {rule.workspace}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[11px] font-semibold">
                {rule.status}
              </span>
            </div>
            <div>
              <h4 className="text-base font-bold text-on-surface">{rule.title}</h4>
              <p className="text-xs text-on-surface-variant font-mono mt-1 flex items-center gap-1.5">
                <Icon name="repeat" size={14} />
                <span>{rule.schedule}</span>
              </p>
            </div>
            <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between text-xs text-outline font-mono">
              <span>Next trigger: {rule.nextRun}</span>
              <button
                type="button"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <span>Configure</span>
                <Icon name="tune" size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
