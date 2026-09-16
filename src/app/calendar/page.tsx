"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function CalendarPage() {
  const [view, setView] = useState<"day" | "week" | "month">("week");

  const calendarEvents = [
    {
      time: "09:00 - 10:30",
      title: "Vlog EP #42 Footage Review & Color Grade",
      workspace: "Personal",
      color: "border-l-purple-500 bg-purple-500/10 text-purple-200",
    },
    {
      time: "11:00 - 12:30",
      title: "Shooting Page Reel Upload & Caption Check",
      workspace: "Office",
      color: "border-l-blue-500 bg-blue-500/10 text-blue-200",
    },
    {
      time: "14:00 - 15:30",
      title: "Algorithm Problem Set 4 (CS-401)",
      workspace: "College",
      color: "border-l-emerald-500 bg-emerald-500/10 text-emerald-200",
    },
    {
      time: "16:00 - 18:00",
      title: "Web Dev Live Class: Next.js App Router (Virtual Lab #1)",
      workspace: "Web Dev",
      color: "border-l-cyan-500 bg-cyan-500/15 text-cyan-200 font-semibold",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        badge="Productivity Calendar"
        metaText="Time-blocking & automated event sync across 4 domains"
        title="Calendar"
        description="Unified schedule combining content publishing deadlines, web development classes, and academic labs."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/20">
              {(["day", "week", "month"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    view === v
                      ? "bg-primary-container text-white shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button variant="primary" icon="add">
              + New Event
            </Button>
          </div>
        }
      />

      {/* Week Timeline View */}
      <Card variant="low" className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
          <div className="flex items-center gap-2">
            <Icon name="calendar_today" size={18} className="text-primary" />
            <h3 className="font-headline text-base font-bold text-on-surface">
              Tuesday, September 16, 2026
            </h3>
          </div>
          <span className="font-mono text-xs text-outline">4 Events Scheduled</span>
        </div>

        <div className="space-y-3">
          {calendarEvents.map((evt, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border-l-4 border border-outline-variant/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:bg-surface-container ${evt.color}`}
            >
              <div className="space-y-1">
                <span className="font-mono text-xs opacity-80 block">{evt.time}</span>
                <h4 className="text-sm font-bold text-on-surface">{evt.title}</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-xs font-semibold text-on-surface self-start sm:self-auto">
                {evt.workspace}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
