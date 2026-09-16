"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Task } from "@/types/task";
import { SUNO_MUSIC_STAGES } from "@/services/officeService";
import { SunoWorkflowStage } from "@/types/office";

interface SunoPipelineSpotlightProps {
  tasks: Task[];
  onOpenTaskDetail: (task: Task) => void;
  onAdvanceStage?: (task: Task, nextStage: SunoWorkflowStage) => void;
}

export function SunoPipelineSpotlight({
  tasks,
  onOpenTaskDetail,
  onAdvanceStage,
}: SunoPipelineSpotlightProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter tasks belonging to Suno Music
  const sunoTasks = tasks.filter(
    (t) => t.officePageId === "suno-music" || t.pageId === "suno-music"
  );

  // Count items per Suno stage
  const getStageCount = (stage: SunoWorkflowStage) => {
    return sunoTasks.filter(
      (t) => (t.stage || "").toUpperCase() === stage ||
             (stage === "DELIVERED" && t.isCompleted)
    ).length;
  };

  return (
    <Card variant="low" className="p-5 sm:p-6 shadow-md relative overflow-hidden border-l-4 border-l-purple-500">
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-300 shadow-sm border border-purple-500/20">
            <Icon name="graphic_eq" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-base sm:text-lg font-bold text-on-surface">
                Suno Music • Visual &amp; Audio Production Pipeline
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-semibold uppercase">
                Priority Track
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Generative track mastering, 9:16 vertical canvas loop designs &amp; YouTube visualizers.
            </p>
          </div>
        </div>

        {/* 6 Pipeline stages flow pill */}
        <div className="flex items-center justify-between lg:justify-end gap-2">
          <div className="flex items-center gap-1 bg-surface-container p-1.5 rounded-2xl overflow-x-auto shadow-inner text-[11px] font-mono scrollbar-none">
            {SUNO_MUSIC_STAGES.map((stage, idx) => {
              const count = getStageCount(stage);
              const isActive = count > 0;

              return (
                <React.Fragment key={stage}>
                  <span
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-colors ${
                      stage === "DESIGN"
                        ? "bg-purple-600 text-white font-bold shadow-sm"
                        : stage === "DELIVERED"
                        ? "bg-secondary/15 text-secondary font-semibold"
                        : isActive
                        ? "bg-surface-container-high text-on-surface font-medium"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {stage} {count > 0 && `(${count})`}
                  </span>
                  {idx < SUNO_MUSIC_STAGES.length - 1 && (
                    <span className="text-outline text-[12px]">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
            title={isCollapsed ? "Expand pipeline" : "Collapse pipeline"}
          >
            <Icon name={isCollapsed ? "expand_more" : "expand_less"} size={20} />
          </button>
        </div>
      </div>

      {/* 3 Dynamic Asset Cards Grid */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10 pt-1">
          {/* Asset 1: Synthwave Track Artwork */}
          <div
            onClick={() => {
              const t = sunoTasks.find((item) => item.stage === "DESIGN") || sunoTasks[0];
              if (t) onOpenTaskDetail(t);
            }}
            className="p-4 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all shadow-sm border border-outline-variant/15 flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-surface-container-lowest flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-indigo-950/80 border border-outline-variant/10">
                <div className="flex flex-col items-center gap-1.5 text-purple-300">
                  <Icon name="palette" size={32} />
                  <span className="text-[11px] font-mono">Spotify 3000x3000px</span>
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-surface/85 backdrop-blur-md text-purple-300 font-mono text-[9px] uppercase font-semibold">
                  Stage: In Design
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-surface/85 backdrop-blur-md text-on-surface font-mono text-[10px]">
                  v3 Final Cut
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-on-surface group-hover:text-purple-300 transition-colors">
                  Album Cover Art v3 - Synthwave Track
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  High-contrast neon typography &amp; Spotify 3000x3000px artwork package.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 bg-surface-container-low/60 px-2.5 py-1.5 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-on-surface">
                <Icon name="format_paint" size={16} className="text-purple-400" />
                <span className="text-[11px]">Photoshop / Midjourney</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-secondary font-medium">Due 03:00 PM</span>
                {onAdvanceStage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const t = sunoTasks.find((item) => item.stage === "DESIGN") || sunoTasks[0];
                      if (t) onAdvanceStage(t, "REVIEW");
                    }}
                    className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-purple-300 transition-colors"
                    title="Advance to Review"
                  >
                    <Icon name="arrow_forward" size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Asset 2: Animated Canvas Loop (9:16) */}
          <div
            onClick={() => {
              const t = sunoTasks.find((item) => item.stage === "REVIEW") || sunoTasks[1] || sunoTasks[0];
              if (t) onOpenTaskDetail(t);
            }}
            className="p-4 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all shadow-sm border border-outline-variant/15 flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-surface-container-lowest flex items-center justify-center bg-gradient-to-br from-teal-900/40 to-slate-950/80 border border-outline-variant/10">
                <div className="flex flex-col items-center gap-1.5 text-secondary">
                  <Icon name="animation" size={32} />
                  <span className="text-[11px] font-mono">9:16 Vertical Canvas</span>
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-surface/85 backdrop-blur-md text-secondary font-mono text-[9px] uppercase font-semibold">
                  Stage: In Review
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-surface/85 backdrop-blur-md text-on-surface font-mono text-[10px]">
                  8s Seamless
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-on-surface group-hover:text-secondary transition-colors">
                  Animated Canvas Loop (Spotify 9:16)
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  8-second seamless fluid motion graphics for mobile streaming background.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 bg-surface-container-low/60 px-2.5 py-1.5 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-on-surface">
                <Icon name="motion_photos_on" size={16} className="text-secondary" />
                <span className="text-[11px]">After Effects Loop</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-amber-400 font-medium">Pending Review</span>
                {onAdvanceStage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const t = sunoTasks.find((item) => item.stage === "REVIEW") || sunoTasks[1] || sunoTasks[0];
                      if (t) onAdvanceStage(t, "EXPORT");
                    }}
                    className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-secondary transition-colors"
                    title="Advance to Export"
                  >
                    <Icon name="arrow_forward" size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Asset 3: YouTube Audio Visualizer 4K */}
          <div
            onClick={() => {
              const t = sunoTasks.find((item) => item.stage === "EXPORT") || sunoTasks[2] || sunoTasks[0];
              if (t) onOpenTaskDetail(t);
            }}
            className="p-4 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all shadow-sm border border-outline-variant/15 flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-surface-container-lowest flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-slate-950/80 border border-outline-variant/10">
                <div className="flex flex-col items-center gap-1.5 text-primary">
                  <Icon name="play_circle" size={32} />
                  <span className="text-[11px] font-mono">3840x2160 60fps</span>
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-surface/85 backdrop-blur-md text-primary font-mono text-[9px] uppercase font-semibold">
                  Stage: Queued Render
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-surface/85 backdrop-blur-md text-on-surface font-mono text-[10px]">
                  4K Master
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                  YouTube Audio Visualizer 4K
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  Reactive audio waveform spectrum overlay for full song drop.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 bg-surface-container-low/60 px-2.5 py-1.5 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-on-surface">
                <Icon name="settings_system_daydream" size={16} className="text-primary" />
                <span className="text-[11px]">Media Encoder</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-primary font-medium">Auto-dispatch</span>
                {onAdvanceStage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const t = sunoTasks.find((item) => item.stage === "EXPORT") || sunoTasks[2] || sunoTasks[0];
                      if (t) onAdvanceStage(t, "DELIVERED");
                    }}
                    className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-primary transition-colors"
                    title="Mark Delivered"
                  >
                    <Icon name="arrow_forward" size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
