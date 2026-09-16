"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { RECURRING_CLASSES } from "@/lib/constants";

export default function WebDevelopmentWorkspacePage() {
  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        badge="Fullstack Track • Next.js & Systems"
        badgeColor="text-cyan-400 bg-cyan-500/15"
        metaText="GitHub Sync Active [branch: main@v2.4-beta]"
        title="Web Development Workspace"
        description="Engineering sprint tasks, fullstack architecture projects, GitHub commits, and class scheduling."
        actions={
          <>
            <Button variant="secondary" icon="add_to_photos">
              + New Project
            </Button>
            <Button variant="primary" icon="code">
              + New Dev Task
            </Button>
          </>
        }
      />

      {/* Top 5 Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Learning Track
            </span>
            <Icon name="school" size={18} className="text-secondary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline text-on-surface">74%</span>
            <span className="text-xs text-secondary font-mono">37 / 50 labs</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">Fullstack Web & Systems</p>
          <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-secondary h-1.5 rounded-full" style={{ width: "74%" }} />
          </div>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Active Sprint
            </span>
            <Icon name="rocket_launch" size={18} className="text-primary" />
          </div>
          <h4 className="text-base font-bold text-on-surface truncate">Afaq TaskFlow</h4>
          <span className="text-xs text-primary font-mono block mt-1">Next.js App Router</span>
          <p className="text-xs text-on-surface-variant mt-1">Foundational architecture</p>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Practice In Flight
            </span>
            <Icon name="data_object" size={18} className="text-tertiary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline text-on-surface">5</span>
            <span className="text-xs text-outline font-mono">Modules</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">Trees • Redis • Docker</p>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Class Schedule
            </span>
            <Icon name="event" size={18} className="text-secondary" />
          </div>
          <h4 className="text-base font-bold text-on-surface">Mon & Tue</h4>
          <div className="flex items-center gap-1 text-secondary font-mono text-xs mt-1 font-semibold">
            <Icon name="schedule" size={14} />
            <span>Today 4:00 PM</span>
          </div>
          <span className="text-[11px] text-on-surface-variant">Virtual Lab #1</span>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Coding Hours
            </span>
            <Icon name="local_fire_department" size={18} className="text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-headline text-on-surface">24.5h</span>
            <span className="text-xs text-outline font-mono">/ 30h Goal</span>
          </div>
          <span className="text-xs text-rose-400 font-medium block mt-1">
            🔥 12-day streak in VS Code
          </span>
        </Card>
      </div>

      {/* Mandatory Recurring Class Schedule Section (Monday & Tuesday 4:00 PM - 6:00 PM) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center justify-center">
              <Icon name="save_as" size={18} />
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface">
                Recurring Class Schedule (Mon & Tue 4 PM – 6 PM)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Live deep-dives & architecture labs with automated calendar sync
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-surface-container-high text-secondary text-xs font-mono">
            Auto-synced with Calendar view
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RECURRING_CLASSES.map((cls, idx) => (
            <Card
              key={idx}
              variant="low"
              className="p-5 border-l-4 border-l-cyan-500 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-xs font-semibold uppercase">
                  Every {cls.day} • {cls.time}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary text-[11px] font-mono">
                  {cls.lab}
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-on-surface">{cls.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {cls.topics}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <Button size="sm" variant="secondary" icon="notes">
                  Syllabus & Notes
                </Button>
                <Button size="sm" variant="primary" icon="open_in_new">
                  Join Lab
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
