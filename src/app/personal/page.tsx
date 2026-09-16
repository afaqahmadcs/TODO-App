"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PersonalVlogWorkflowStage } from "@/types/workspace";

export default function PersonalWorkspacePage() {
  const [activeStage, setActiveStage] = useState<PersonalVlogWorkflowStage>("FOOTAGE_READY");

  const vlogStages: PersonalVlogWorkflowStage[] = [
    "IDEA",
    "PLANNED",
    "RECORDING",
    "FOOTAGE_READY",
    "EDITING",
    "THUMBNAIL",
    "CAPTION",
    "READY_TO_POST",
    "PUBLISHED",
  ];

  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        badge="Active Suite • Creator V2.4"
        badgeColor="text-purple-400 bg-purple-500/15"
        metaText="LENS_RIG_PRIMARY • Sony A7IV • 4K 24fps"
        title="Personal Workspace"
        description="Daily life vlog production, multi-platform social distribution, and learning documentary engine."
        actions={
          <>
            <Button variant="secondary" icon="videocam">
              Camera Rig Preset
            </Button>
            <Button variant="secondary" icon="movie_creation">
              Quick B-Roll Note
            </Button>
            <Button variant="primary" icon="add">
              + New Vlog Episode
            </Button>
          </>
        }
      />

      {/* 5 Top Telemetry Stat Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Today&apos;s Vlog
            </span>
            <Icon name="camera_roll" size={18} className="text-purple-400" />
          </div>
          <h4 className="text-base font-bold text-on-surface truncate">EP #42: Next.js & Coding</h4>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-on-surface-variant mb-1">
              <span>B-Roll Clips</span>
              <span className="font-mono text-purple-300">3/6 captured</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: "50%" }} />
            </div>
          </div>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Recording
            </span>
            <Icon name="fiber_manual_record" size={18} className="text-rose-500" />
          </div>
          <h4 className="text-base font-bold text-on-surface">4 of 6 Slots Done</h4>
          <span className="text-xs text-secondary font-mono block mt-2">67% Capture Completed</span>
          <span className="text-[11px] text-outline font-mono">Sony A7IV Cine EI</span>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Editing Pipeline
            </span>
            <Icon name="timeline" size={18} className="text-primary" />
          </div>
          <h4 className="text-base font-bold text-on-surface truncate">Timeline 18:30 min</h4>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-secondary font-mono">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>FCPX Cut Ready</span>
          </div>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Publishing Target
            </span>
            <Icon name="cloud_upload" size={18} className="text-purple-400" />
          </div>
          <h4 className="text-base font-bold text-on-surface">3 of 5 Live</h4>
          <div className="flex items-center gap-1 mt-2 text-[10px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary">
              YT: LIVE
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary">
              REELS: OK
            </span>
          </div>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Weekly Output
            </span>
            <Icon name="bolt" size={18} className="text-amber-400" />
          </div>
          <h4 className="text-base font-bold text-on-surface">6 / 7 Videos</h4>
          <span className="text-xs text-amber-300 font-medium block mt-3">
            🔥 14-day creator streak
          </span>
        </Card>
      </div>

      {/* 9-Stage Vlog Workflow Horizontal Pipeline Bar */}
      <Card variant="low" className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="schema" size={20} className="text-purple-400" />
            <h3 className="font-headline text-base font-bold text-on-surface">
              9-Stage Episode Workflow Pipeline
            </h3>
          </div>
          <span className="text-xs text-outline font-mono">Active Workflow Track</span>
        </div>

        {/* Scrollable Stage Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {vlogStages.map((stage, idx) => {
            const isActive = stage === activeStage;
            return (
              <React.Fragment key={stage}>
                <button
                  type="button"
                  onClick={() => setActiveStage(stage)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {stage === "RECORDING" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                  <span>{stage.replace("_", " ")}</span>
                </button>
                {idx < vlogStages.length - 1 && (
                  <span className="text-outline text-xs select-none">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* "My Web Development Journey" Cross-Linked Hub */}
      <Card variant="low" className="p-6 relative overflow-hidden border-l-4 border-l-cyan-400">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center justify-center">
              <Icon name="smart_display" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface font-headline">
                &quot;My Web Dev Journey&quot; Content Hub
              </h3>
              <p className="text-xs text-on-surface-variant">
                Automatically bridge coding tasks from your Web Development workspace into vlog story arcs.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-cyan-300 font-mono text-xs font-semibold">
            CROSS-LINKED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary font-mono font-semibold flex items-center gap-1">
                <Icon name="terminal" size={14} />
                <span>Dev Task Linked</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-outline">
                Timeline 04:15
              </span>
            </div>
            <h4 className="text-sm font-semibold text-on-surface">
              Build responsive navbar & mobile drawer
            </h4>
            <p className="text-xs text-on-surface-variant">
              Vlog Target: &quot;Building my portfolio website — Day 12&quot;
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-mono font-semibold flex items-center gap-1">
                <Icon name="database" size={14} />
                <span>Database Task</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[10px] text-secondary">
                32m Ingested
              </span>
            </div>
            <h4 className="text-sm font-semibold text-on-surface">
              PostgreSQL Schema & Supabase migrations
            </h4>
            <p className="text-xs text-on-surface-variant">
              Vlog Target: &quot;How I architect database tables in 2026&quot;
            </p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
