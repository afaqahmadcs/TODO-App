"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Task, SocialPlatform, ThumbnailStatus } from "@/types/task";
import { taskService } from "@/services/taskService";

const VLOG_STAGES = [
  "IDEA",
  "PLANNED",
  "RECORDING",
  "FOOTAGE READY",
  "EDITING",
  "THUMBNAIL",
  "CAPTION",
  "READY TO POST",
  "PUBLISHED",
] as const;

type VlogStage = (typeof VLOG_STAGES)[number];

export default function PersonalWorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("task-personal-ep42");
  const [selectedStageFilter, setSelectedStageFilter] = useState<VlogStage | "ALL">("ALL");
  const [copySuccess, setCopySuccess] = useState(false);

  // Load live tasks from Supabase / taskService
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const allTasks = await taskService.getTasks();
        if (mounted) {
          setTasks(allTasks);
        }
      } catch (err) {
        console.error("Failed to load personal workspace tasks:", err);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter personal vlog episodes
  const vlogEpisodes = useMemo(() => {
    return tasks.filter((t) => t.workspaceId === "personal");
  }, [tasks]);

  // The currently inspected vlog episode
  const currentVlog = useMemo(() => {
    return (
      vlogEpisodes.find((t) => t.id === selectedTaskId) ||
      vlogEpisodes.find((t) => t.id === "task-personal-ep42") ||
      vlogEpisodes[0]
    );
  }, [vlogEpisodes, selectedTaskId]);

  // Load Web Development tasks that are relationally linked to the current vlog (or any vlog)
  const linkedDevTasks = useMemo(() => {
    if (!currentVlog) return [];
    return tasks.filter(
      (t) =>
        t.workspaceId === "web-development" &&
        (t.linkedVlogId === currentVlog.id || t.linkedVlogId === "task-personal-ep42")
    );
  }, [tasks, currentVlog]);

  // Count episodes per workflow stage
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    VLOG_STAGES.forEach((stage) => {
      counts[stage] = vlogEpisodes.filter(
        (t) => (t.stage || "").toUpperCase() === stage || (t.stage || "").replace("_", " ").toUpperCase() === stage
      ).length;
    });
    return counts;
  }, [vlogEpisodes]);

  // Filtered episodes list for production schedule
  const displayedSchedule = useMemo(() => {
    if (selectedStageFilter === "ALL") return vlogEpisodes;
    return vlogEpisodes.filter(
      (t) =>
        (t.stage || "").toUpperCase() === selectedStageFilter ||
        (t.stage || "").replace("_", " ").toUpperCase() === selectedStageFilter
    );
  }, [vlogEpisodes, selectedStageFilter]);

  // Toggle checklist item (Recording / Editing)
  const handleToggleChecklist = async (type: "recording" | "editing", itemId: string, currentVal: boolean) => {
    if (!currentVlog) return;
    const updated = await taskService.updateTaskChecklist(currentVlog.id, type, itemId, !currentVal);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Toggle platform enabled
  const handleTogglePlatform = async (platform: SocialPlatform) => {
    if (!currentVlog) return;
    const isCurrentlyEnabled = (currentVlog.platforms || []).includes(platform);
    const updated = await taskService.updateVlogPlatform(currentVlog.id, platform, !isCurrentlyEnabled);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Update thumbnail status
  const handleThumbnailStatusChange = async (newStatus: ThumbnailStatus) => {
    if (!currentVlog) return;
    const updated = await taskService.updateThumbnailStatus(currentVlog.id, newStatus);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Copy caption to clipboard
  const handleCopyCaption = () => {
    if (currentVlog?.caption) {
      navigator.clipboard.writeText(currentVlog.caption);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Advance stage button
  const handleAdvanceStage = async () => {
    if (!currentVlog) return;
    const currentStageName = (currentVlog.stage || "IDEA").replace("_", " ").toUpperCase();
    const currentIndex = VLOG_STAGES.indexOf(currentStageName as VlogStage);
    if (currentIndex < VLOG_STAGES.length - 1) {
      const nextStage = VLOG_STAGES[currentIndex + 1];
      const updated = await taskService.updateTask(currentVlog.id, {
        stage: nextStage,
        status: nextStage === "PUBLISHED" ? "published" : "in_progress",
      });
      if (updated) {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      }
    }
  };

  return (
    <PageContainer>
      {/* Top Workspace Header */}
      <PageHeader
        badge="Active Suite • Creator V2.4"
        badgeColor="text-purple-300 bg-purple-500/15"
        metaText="LENS_RIG_PRIMARY • Sony A7IV • 4K 24fps"
        title="Personal Workspace"
        description="Daily life vlog production, multi-platform social distribution, and learning documentary engine."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" icon="videocam">
              Camera Rig Preset
            </Button>
            <Button variant="secondary" icon="movie_creation">
              Quick B-Roll Note
            </Button>
            <Button variant="primary" icon="add">
              + New Vlog Episode
            </Button>
          </div>
        }
      />

      {/* Top 5 Metrics Row (Stitch Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Stat 1: Today's Vlog */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 border border-outline-variant/10">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">Today&apos;s Vlog</span>
              <Icon name="camera_roll" size={18} className="text-purple-400" />
            </div>
            <p className="font-headline text-base text-on-surface font-semibold truncate">
              {currentVlog?.title || "EP #42: College & Next.js"}
            </p>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-mono">
              <span>B-Roll (45%)</span>
              <span className="text-purple-400 font-semibold">3/6 clips</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: "45%" }} />
            </div>
          </div>
        </div>

        {/* Stat 2: Recording Progress */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">Recording Progress</span>
              <Icon name="fiber_manual_record" size={18} className="text-secondary" />
            </div>
            <p className="font-headline text-base text-on-surface font-semibold">4 of 6 Slots Done</p>
          </div>
          <div className="mt-3 flex flex-col gap-0.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-secondary font-semibold">67% Capture</span>
              <span className="text-outline">4K 24fps</span>
            </div>
            <p className="text-[11px] text-outline truncate">Sony A7IV • Cine EI</p>
          </div>
        </div>

        {/* Stat 3: Editing Progress */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">Editing Pipeline</span>
              <Icon name="timeline" size={18} className="text-primary" />
            </div>
            <p className="font-headline text-base text-on-surface font-semibold truncate">Timeline 18:30 min</p>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-on-surface-variant">Cut & Grade Ready</span>
            </div>
            <span className="text-outline text-[11px]">FCPX</span>
          </div>
        </div>

        {/* Stat 4: Publishing Target */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">Publishing Target</span>
              <Icon name="cloud_upload" size={18} className="text-purple-400" />
            </div>
            <p className="font-headline text-base text-on-surface font-semibold">3 of 5 Live</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[11px] font-mono text-secondary font-medium">
              YT: LIVE
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[11px] font-mono text-secondary font-medium">
              REELS: OK
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-[11px] font-mono text-outline">
              TIKTOK: PEND
            </span>
          </div>
        </div>

        {/* Stat 5: Weekly Content Count */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 border border-outline-variant/10">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-secondary/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">Weekly Output</span>
              <span className="font-mono text-xs text-secondary">+2 v lw</span>
            </div>
            <p className="font-headline text-base text-on-surface font-semibold">6 Videos / 7 Goal</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-purple-300 font-medium font-mono">🔥 14-day creator streak</span>
            <Icon name="bolt" size={18} className="text-purple-400" />
          </div>
        </div>
      </div>

      {/* 9-Stage Vlog Workflow Horizontal Pipeline Tracker */}
      <div className="bg-surface-container-low rounded-xl p-5 shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="schema" size={20} className="text-purple-400" />
            <h3 className="font-headline text-base font-semibold text-on-surface">Episode Workflow Pipeline</h3>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-outline font-mono text-[11px]">
              {vlogEpisodes.length} ACTIVE ARTIFACTS
            </span>
          </div>
          <div className="flex items-center gap-2 text-outline text-xs font-mono">
            {selectedStageFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedStageFilter("ALL")}
                className="text-purple-400 hover:underline flex items-center gap-1"
              >
                Clear filter ({selectedStageFilter})
              </button>
            )}
            <span className="flex items-center gap-1">
              <Icon name="tune" size={14} />
              Interactive Filter
            </span>
          </div>
        </div>

        {/* Scrollable Horizontal Stage Track */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 select-none scrollbar-none">
          {VLOG_STAGES.map((stage, idx) => {
            const isFilterActive = selectedStageFilter === stage;
            const isEpisodeStage =
              currentVlog &&
              ((currentVlog.stage || "").toUpperCase() === stage ||
                (currentVlog.stage || "").replace("_", " ").toUpperCase() === stage);
            const count = stageCounts[stage] || 0;

            return (
              <React.Fragment key={stage}>
                <button
                  type="button"
                  onClick={() => setSelectedStageFilter(isFilterActive ? "ALL" : stage)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg min-w-max transition-all font-mono text-xs ${
                    isFilterActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                      : isEpisodeStage
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                  }`}
                >
                  {stage === "RECORDING" && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                  {stage === "FOOTAGE READY" && (
                    <Icon name="check_circle" size={14} className="text-secondary" />
                  )}
                  {stage === "PUBLISHED" && (
                    <Icon name="task_alt" size={14} className="text-secondary" />
                  )}
                  <span className="font-semibold">{stage}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                      isFilterActive
                        ? "bg-purple-800 text-white"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {count}
                  </span>
                </button>

                {idx < VLOG_STAGES.length - 1 && (
                  <Icon name="chevron_right" size={16} className="text-outline-variant shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content Split: 2-Column Architecture (7 cols / 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Pipeline & Learning Documentary Hub (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* 1. "My Web Development Journey" Content Hub */}
          <div className="bg-surface-container-low rounded-xl p-5 shadow-sm relative overflow-hidden border border-outline-variant/10">
            <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-purple-500/10 via-secondary/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-tr from-secondary to-purple-400" />
                <h3 className="font-headline text-base font-semibold text-on-surface">
                  &quot;My Web Dev Journey&quot; Content Hub
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary font-mono text-[11px] font-semibold">
                RELATIONAL CROSS-LINK
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Automatically bridge coding tasks from your <span className="text-secondary font-semibold">Web Development</span> repository
              into real-time vlog story arcs via database foreign key references.
            </p>

            {/* Connected Dev Cards mapped from relational reference */}
            <div className="flex flex-col gap-3">
              {linkedDevTasks.length > 0 ? (
                linkedDevTasks.map((devTask) => {
                  const targetVlog = vlogEpisodes.find((v) => v.id === devTask.linkedVlogId);
                  return (
                    <div
                      key={devTask.id}
                      className="bg-surface-container rounded-lg p-3.5 hover:bg-surface-container-high transition-all border border-outline-variant/10"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-secondary font-mono text-xs font-semibold uppercase">
                          <Icon name="terminal" size={16} />
                          <span>Dev Task Linked</span>
                        </div>
                        <span className="font-mono text-purple-300 text-[11px] bg-purple-500/20 px-2 py-0.5 rounded">
                          Timeline 04:15
                        </span>
                      </div>
                      <div className="mt-1">
                        <h4 className="font-headline text-sm font-semibold text-on-surface">
                          {devTask.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Vlog Target:{" "}
                          <span className="text-on-surface font-medium">
                            &quot;{targetVlog?.title || currentVlog?.title}&quot;
                          </span>
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-outline-variant/10 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                        <div className="flex items-center gap-1 text-outline">
                          <Icon name="commit" size={14} className="text-secondary" />
                          <span className="text-on-surface-variant">
                            {devTask.githubBranchOrCommit || "GitHub #8f2a1b (main)"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {(devTask.tags || ["#webdev", "#coding"]).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded bg-surface-container-highest text-outline text-[10px]"
                            >
                              {tag.startsWith("#") ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-lg bg-surface-container text-center text-xs text-outline font-mono">
                  No linked web development tasks yet for this vlog.
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              type="button"
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-mono text-xs transition-colors border border-outline-variant/15"
            >
              <Icon name="add_link" size={16} className="text-purple-400" />
              <span>+ Link Code Commit or Dev Task to Vlog</span>
            </button>
          </div>

          {/* 2. Active Episodes & Production Schedule */}
          <div className="bg-surface-container-low rounded-xl p-5 shadow-sm flex flex-col gap-3 border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="calendar_view_week" size={20} className="text-secondary" />
                <h3 className="font-headline text-base font-semibold text-on-surface">
                  Active Production Schedule
                </h3>
              </div>
              <span className="font-mono text-outline text-xs uppercase tracking-wider">
                {vlogEpisodes.length} EPISODES
              </span>
            </div>

            {/* Episode Schedule List */}
            <div className="flex flex-col gap-2.5">
              {displayedSchedule.map((episode) => {
                const isSelected = episode.id === selectedTaskId;
                const stageName = (episode.stage || "IDEA").replace("_", " ").toUpperCase();
                return (
                  <div
                    key={episode.id}
                    onClick={() => setSelectedTaskId(episode.id)}
                    className={`rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-surface-container-high border-purple-500/50 shadow-sm ring-1 ring-purple-500/30"
                        : "bg-surface-container hover:bg-surface-container-high border-outline-variant/10"
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold ${
                            stageName === "PUBLISHED"
                              ? "bg-secondary/20 text-secondary"
                              : stageName === "EDITING"
                              ? "bg-primary-container/30 text-primary"
                              : stageName === "RECORDING"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-surface-container-highest text-outline"
                          }`}
                        >
                          {stageName}
                        </span>
                        <span className="font-mono text-outline text-[11px]">
                          {episode.linkedVlogEpisode || "EP"}
                        </span>
                      </div>
                      <h4 className="font-headline text-sm font-semibold text-on-surface truncate">
                        {episode.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant truncate mt-0.5">
                        {episode.description || "Episode details & shooting notes"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px] font-semibold flex items-center gap-1">
                          <Icon name="visibility" size={14} /> Inspected
                        </span>
                      ) : (
                        <span className="text-xs text-outline hover:text-on-surface font-mono">
                          Inspect →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Rich Interactive "Vlog Entry Detail Inspector" (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-low rounded-xl p-5 shadow-md flex flex-col gap-4 border border-outline-variant/15">
            {/* Inspector Header */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-outline-variant/10">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] font-semibold">
                    IN PRODUCTION
                  </span>
                  <span className="font-mono text-outline text-[11px] uppercase">
                    {(currentVlog?.stage || "FOOTAGE READY").replace("_", " ")}
                  </span>
                </div>
                <h2 className="font-headline text-base font-bold text-on-surface">
                  {currentVlog?.title || "Vlog Episode Inspector"}
                </h2>
                <span className="text-xs text-outline font-mono mt-0.5">
                  Recorded: {currentVlog?.dueDate || "Today"} • Location: Studio & Desk
                </span>
              </div>
              <button
                type="button"
                className="text-outline hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors"
              >
                <Icon name="more_vert" size={20} />
              </button>
            </div>

            {/* Concept / Story Arc Card */}
            <div className="bg-surface-container rounded-lg p-3.5 border border-outline-variant/10">
              <div className="flex items-center gap-1.5 text-outline mb-1 font-mono text-xs uppercase">
                <Icon name="lightbulb" size={16} className="text-purple-400" />
                <span>Story Arc & Intent</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                &quot;{currentVlog?.description || "Documenting the creator and coding journey with actionable takeaways."}&quot;
              </p>
            </div>

            {/* Section: Recording Checklist */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-headline text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Recording Checklist
                </span>
                <span className="font-mono text-purple-400 text-[11px]">
                  {(currentVlog?.recordingChecklist || []).filter((i) => i.completed).length} of{" "}
                  {currentVlog?.recordingChecklist?.length || 0} Captured
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {(currentVlog?.recordingChecklist || []).map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 p-2 rounded bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors border border-outline-variant/5"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist("recording", item.id, item.completed)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-surface-container-highest border-0 accent-purple-500 cursor-pointer"
                    />
                    <span
                      className={`text-xs flex-1 ${
                        item.completed ? "text-outline line-through" : "text-on-surface"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`font-mono text-[10px] ${
                        item.completed ? "text-secondary" : "text-purple-400"
                      }`}
                    >
                      {item.completed ? "DONE" : "PENDING"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Footage & Audio Technical Notes */}
            <div className="bg-surface-container rounded-lg p-3 flex flex-col gap-1 font-mono text-xs border border-outline-variant/10">
              <span className="text-[11px] text-outline uppercase tracking-wider">Raw Ingest & Timecode</span>
              <div className="flex items-center justify-between text-on-surface">
                <span>A001_C012 to A001_C045</span>
                <span className="text-secondary font-semibold">48GB • SanDisk Pro</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Sound sync matched via Tentacle Sync Jam-Sync • 48kHz 24-bit WAV dual-channel.
              </p>
            </div>

            {/* Section: Editing Tasks Checklist */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-headline text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Editing Tasks (Final Cut Pro X)
                </span>
                <span className="font-mono text-secondary text-[11px]">
                  {(currentVlog?.editingChecklist || []).filter((i) => i.completed).length} of{" "}
                  {currentVlog?.editingChecklist?.length || 0} Done
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(currentVlog?.editingChecklist || []).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleChecklist("editing", item.id, item.completed)}
                    className="flex items-center gap-1.5 p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-left border border-outline-variant/5"
                  >
                    <Icon
                      name={item.completed ? "check_circle" : "radio_button_unchecked"}
                      size={16}
                      className={item.completed ? "text-secondary" : "text-outline"}
                    />
                    <span
                      className={`text-xs truncate ${
                        item.completed ? "text-outline line-through" : "text-on-surface"
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section: Thumbnail Preview & Status */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-headline text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Thumbnail Concept
                </span>
                <div className="flex items-center gap-1">
                  {(["pending", "designed", "approved"] as ThumbnailStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleThumbnailStatusChange(st)}
                      className={`px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-semibold transition-all ${
                        currentVlog?.thumbnailStatus === st
                          ? "bg-purple-600 text-white"
                          : "bg-surface-container text-outline hover:text-on-surface"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative w-full h-28 rounded-lg bg-surface-container overflow-hidden group border border-outline-variant/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="YouTube thumbnail preview"
                  src={
                    currentVlog?.thumbnailUrl ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuB2VJD5USG40NPDu6AthW2xx5syMrwq-35JwrcLyFAB1Pj-J_vQuizMI22CyI3P-J6gq-LnDo0MdPhnyzw0_LQ-RInpDCFu3NTR7Exhn3KtBv2VgOElbQeDB-aVV_WxTKA3z_F2M97Ytc3RAnaLRd-tJUG58fFsamTCn02N_4SvFG7SK1eUa_q1xDBkgqOP7OQilmM7yxwPn11PFK0-xE9R97TLVxlqkCQ8Adej0uemSz18KVAZYqWEBA"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-2.5 justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-purple-300">DRAFT CONCEPT (1280x720)</span>
                    <span className="font-headline text-xs text-white font-bold">
                      I BUILT A PORTFOLIO IN 48H 🔥
                    </span>
                  </div>
                  <Icon name="fullscreen" size={16} className="text-white cursor-pointer hover:text-purple-300" />
                </div>
              </div>
            </div>

            {/* Section: Caption & Copy Draft */}
            <div className="bg-surface-container rounded-lg p-3 flex flex-col gap-1 border border-outline-variant/10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-outline uppercase tracking-wider">
                  Caption & Description Draft
                </span>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="text-purple-400 font-mono text-[11px] hover:underline flex items-center gap-1"
                >
                  <Icon name={copySuccess ? "check" : "content_copy"} size={13} />
                  <span>{copySuccess ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <p className="font-mono text-on-surface-variant text-xs bg-surface-container-lowest p-2 rounded leading-relaxed">
                {currentVlog?.caption ||
                  "Balancing agency clients with college & building my dream portfolio from scratch. Day 12 of the web dev journey is live! 🔥 #developer #vlog #productivity"}
              </p>
            </div>

            {/* Section: Multi-Platform Distribution Checklist */}
            <div className="flex flex-col gap-1.5">
              <span className="font-headline text-xs font-semibold text-on-surface uppercase tracking-wider">
                Distribution Platforms
              </span>
              <div className="flex flex-col gap-1 mt-1">
                {(["Instagram", "YouTube", "TikTok", "Facebook", "X"] as SocialPlatform[]).map((platform) => {
                  const isEnabled = (currentVlog?.platforms || []).includes(platform);
                  const statusLabel =
                    (currentVlog?.distributionStatus && currentVlog.distributionStatus[platform]) ||
                    (isEnabled ? "ACTIVE" : "OFF");

                  return (
                    <div
                      key={platform}
                      onClick={() => handleTogglePlatform(platform)}
                      className="flex items-center justify-between p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/5"
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          name={
                            platform === "YouTube"
                              ? "smart_display"
                              : platform === "Instagram"
                              ? "photo_camera"
                              : platform === "TikTok"
                              ? "play_arrow"
                              : platform === "Facebook"
                              ? "share"
                              : "tag"
                          }
                          size={16}
                          className={
                            isEnabled
                              ? platform === "YouTube"
                                ? "text-rose-400"
                                : platform === "Instagram"
                                ? "text-purple-400"
                                : "text-secondary"
                              : "text-outline"
                          }
                        />
                        <span className="text-xs text-on-surface font-medium">{platform}</span>
                      </div>
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                          isEnabled
                            ? "bg-purple-500/20 text-purple-300 font-semibold"
                            : "bg-surface-container-highest text-outline"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Inspector CTA */}
            <div className="pt-2 flex items-center gap-2 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={handleAdvanceStage}
                className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold transition-all text-center shadow-sm"
              >
                Advance Stage: {(currentVlog?.stage || "IDEA").replace("_", " ")} →
              </button>
              <button
                type="button"
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                title="Archive episode"
              >
                <Icon name="archive" size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
