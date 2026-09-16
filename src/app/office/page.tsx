"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { OFFICE_PAGES } from "@/lib/constants";
import { OfficeWorkflowStage, SunoWorkflowStage } from "@/types/workspace";

export default function OfficeWorkspacePage() {
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [activeWorkflowView, setActiveWorkflowView] = useState<"board" | "list">("board");

  const officeStages: OfficeWorkflowStage[] = [
    "IDEAS",
    "TODO",
    "IN_PROGRESS",
    "REVIEW",
    "READY",
    "PUBLISHED",
  ];

  const sunoStages: SunoWorkflowStage[] = [
    "BRIEF",
    "ASSETS",
    "DESIGN",
    "REVIEW",
    "EXPORT",
    "DELIVERED",
  ];

  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        badge="Production Engine"
        badgeColor="text-blue-400 bg-blue-500/15"
        metaText="Updated 4 mins ago • 8 Active Channel Channels"
        title="Office Workspace"
        description="Daily social-media content production & multi-channel campaign publishing pipeline."
        actions={
          <>
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <button
                type="button"
                onClick={() => setActiveWorkflowView("board")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeWorkflowView === "board"
                    ? "bg-primary-container text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Icon name="view_kanban" size={16} />
                <span>Board</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkflowView("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeWorkflowView === "list"
                    ? "bg-primary-container text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Icon name="format_list_bulleted" size={16} />
                <span>List</span>
              </button>
            </div>
            <Button variant="primary" icon="add_circle">
              New Content Task
            </Button>
          </>
        }
      />

      {/* 5 KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Today&apos;s Tasks
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-high text-primary">
              <Icon name="bolt" size={18} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-headline text-on-surface">18 Active</span>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-secondary font-mono">
              <span>+3 scheduled across 8 channels</span>
            </div>
          </div>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Completed
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-high text-secondary">
              <Icon name="task_alt" size={18} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-headline text-on-surface">9 Done</span>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-secondary h-1.5 rounded-full" style={{ width: "50%" }} />
            </div>
          </div>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Pending Pipeline
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-high text-tertiary">
              <Icon name="hourglass_top" size={18} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-headline text-on-surface">8 Remaining</span>
            <span className="block text-[11px] text-on-surface-variant mt-1">2 in Review approval</span>
          </div>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Urgent
            </span>
            <span className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
              <Icon name="priority_high" size={18} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-headline text-rose-400">1 Urgent</span>
            <span className="block text-[11px] text-rose-400 font-mono mt-1">Shooting export</span>
          </div>
        </Card>

        <Card variant="low" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Productivity
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-high text-amber-400">
              <Icon name="local_fire_department" size={18} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-headline text-on-surface">92%</span>
            <span className="block text-[11px] text-amber-300 font-mono mt-1">🔥 8-day streak</span>
          </div>
        </Card>
      </div>

      {/* 8 Office Pages Status Strip */}
      <Card variant="low" className="p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Icon name="hub" size={18} className="text-primary" />
            <span className="text-sm font-bold text-on-surface font-headline">
              Daily Publishing Matrix (8 Pages)
            </span>
            <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant font-mono text-[11px] rounded-full">
              4 / 8 Dispatched
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {OFFICE_PAGES.map((page) => (
            <div
              key={page.id}
              onClick={() => setSelectedPage(page.id === selectedPage ? "all" : page.id)}
              className={`p-2.5 rounded-xl bg-surface-container border transition-all cursor-pointer ${
                selectedPage === page.id
                  ? "border-primary-container ring-1 ring-primary-container"
                  : "border-outline-variant/15 hover:border-outline-variant/40"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-on-surface truncate">
                  {page.shortTitle}
                </span>
                {page.isCompletedToday ? (
                  <span className="text-secondary">
                    <Icon name="check_circle" size={14} />
                  </span>
                ) : (
                  <span className="text-outline">
                    <Icon name="schedule" size={14} />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-on-surface-variant block truncate">
                {page.statusSummary}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Suno Music Specialized Visual & Audio Production Pipeline Spotlight */}
      <Card variant="low" className="p-5 border-l-4 border-l-purple-500 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Icon name="graphic_eq" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-on-surface font-headline">
                  Suno Music • Visual & Audio Production Pipeline
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-semibold">
                  Priority Track
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Generative track mastering, 9:16 vertical canvas loop designs & YouTube visualizers.
              </p>
            </div>
          </div>

          {/* Flow Stages Pill */}
          <div className="flex items-center gap-1 bg-surface-container p-1.5 rounded-xl overflow-x-auto text-[11px] font-mono">
            {sunoStages.map((stage, idx) => (
              <React.Fragment key={stage}>
                <span
                  className={`px-2 py-0.5 rounded ${
                    stage === "DESIGN"
                      ? "bg-purple-600 text-white font-bold"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {stage}
                </span>
                {idx < sunoStages.length - 1 && <span className="text-outline">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/15">
            <span className="text-[10px] font-mono text-purple-300 font-bold uppercase block mb-1">
              Stage: In Design
            </span>
            <h4 className="text-sm font-semibold text-on-surface">Album Cover Art v3 - Synthwave</h4>
            <p className="text-xs text-on-surface-variant mt-1">
              Spotify 3000x3000px artwork package & high-contrast neon styling.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/15">
            <span className="text-[10px] font-mono text-secondary font-bold uppercase block mb-1">
              Stage: In Review
            </span>
            <h4 className="text-sm font-semibold text-on-surface">Animated Canvas Loop (9:16)</h4>
            <p className="text-xs text-on-surface-variant mt-1">
              8-second fluid motion graphics for mobile streaming background.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/15">
            <span className="text-[10px] font-mono text-primary font-bold uppercase block mb-1">
              Stage: Queued Render
            </span>
            <h4 className="text-sm font-semibold text-on-surface">YouTube Audio Visualizer 4K</h4>
            <p className="text-xs text-on-surface-variant mt-1">
              Reactive audio waveform spectrum overlay for full song drop.
            </p>
          </div>
        </div>
      </Card>

      {/* 6-Stage Office Content Production Kanban Columns */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-base font-bold text-on-surface">
            6-Stage Content Production Board
          </h3>
          <span className="text-xs text-outline font-mono">
            IDEAS → TODO → IN PROGRESS → REVIEW → READY → PUBLISHED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start">
          {officeStages.map((stage) => (
            <div
              key={stage}
              className="rounded-2xl bg-surface-container-low p-3 border border-outline-variant/20 flex flex-col gap-2.5 min-h-[220px]"
            >
              <div className="flex items-center justify-between pb-1 border-b border-outline-variant/10">
                <span className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider">
                  {stage.replace("_", " ")}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-surface-container font-mono text-[10px] text-on-surface-variant">
                  {stage === "IDEAS" ? 3 : stage === "TODO" ? 2 : stage === "IN_PROGRESS" ? 2 : 1}
                </span>
              </div>

              {/* Sample Workflow Card in Column */}
              <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/15 shadow-sm text-xs space-y-1.5">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px] font-semibold">
                  ZK Production
                </span>
                <p className="font-medium text-on-surface leading-snug">
                  {stage === "IDEAS"
                    ? "BTS B-roll for production set"
                    : stage === "TODO"
                    ? "Interview footage cut"
                    : "Export review package"}
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-outline font-mono">
                  <span>Slot: 16:00</span>
                  <span>4K</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs font-medium flex items-center justify-center gap-1 transition-colors mt-auto"
              >
                <Icon name="add" size={14} />
                <span>Add</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
