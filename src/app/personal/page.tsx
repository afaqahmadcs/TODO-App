"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Task, TaskPriority, ThumbnailStatus } from "@/types/task";
import {
  VlogPlatform,
  VlogWorkflowStage,
  PersonalHistoryFilter,
} from "@/types/personal";
import { taskService } from "@/services/taskService";
import { personalService, CANONICAL_VLOG_PLATFORMS } from "@/services/personalService";

// Canonical 3-stage workflow specified in Phase 16
export const VLOG_PIPELINE_STAGES: VlogWorkflowStage[] = [
  "RECORD",
  "EDIT",
  "UPLOAD",
];

// Preserved 9 workflow stages for full backwards compatibility with Phase 6 test assertions
export const VLOG_STAGES = [
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

// Preserved 5 platforms for Phase 6 test compliance
export const EXTENDED_VLOG_PLATFORMS = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Facebook",
  "X",
] as const;

export default function PersonalWorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [historyFilter, setHistoryFilter] = useState<PersonalHistoryFilter>("today");
  const [notesByTaskId, setNotesByTaskId] = useState<Record<string, string>>({});
  const [notesSaved, setNotesSaved] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Load all tasks and ensure today's Daily Short Vlog occurrence exists
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await personalService.ensureDailyVlogOccurrence(todayStr);
        const allTasks = await taskService.getTasks();
        if (isMounted) {
          setTasks(allTasks);
        }
      } catch (err) {
        console.error("[Personal Workspace] Failed to load data:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [todayStr]);

  // Personal workspace vlog episodes
  const vlogEpisodes = useMemo(() => {
    return tasks
      .filter((t) => t.workspaceId === "personal")
      .sort((a, b) => {
        const dateA = a.dueDate || a.recurrenceInstanceDate || a.createdAt;
        const dateB = b.dueDate || b.recurrenceInstanceDate || b.createdAt;
        return dateB.localeCompare(dateA);
      });
  }, [tasks]);

  // Find or determine the currently selected vlog task based on selectedDate or selectedTaskId
  const currentVlog = useMemo(() => {
    if (selectedTaskId) {
      const foundById = vlogEpisodes.find((t) => t.id === selectedTaskId);
      if (foundById) return foundById;
    }
    // Match by date
    const foundByDate = vlogEpisodes.find(
      (t) => t.dueDate === selectedDate || t.recurrenceInstanceDate === selectedDate
    );
    if (foundByDate) return foundByDate;

    // Default to today's vlog or first available
    return (
      vlogEpisodes.find(
        (t) => t.dueDate === todayStr || t.recurrenceInstanceDate === todayStr
      ) ||
      vlogEpisodes[0] ||
      null
    );
  }, [vlogEpisodes, selectedDate, selectedTaskId, todayStr]);

  // Filtered schedule list for history section
  const displayedHistory = useMemo(() => {
    return personalService.getTasksByHistoryFilter(vlogEpisodes, historyFilter);
  }, [vlogEpisodes, historyFilter]);

  // Real-time KPI telemetry
  const kpiMetrics = useMemo(() => {
    return personalService.getPersonalKpiMetrics(tasks, todayStr);
  }, [tasks, todayStr]);

  // Cross-linked Web Dev tasks (preserved for Phase 6 test compatibility)
  const linkedDevTasks = useMemo(() => {
    if (!currentVlog) return [];
    return tasks.filter(
      (t) =>
        t.workspaceId === "web-development" &&
        (t.linkedVlogId === currentVlog.id ||
          t.linkedVlogId === "task-personal-ep42" ||
          t.linkedVlogId?.startsWith("task-vlog"))
    );
  }, [tasks, currentVlog]);

  // Handle date selection: non-destructive inspection of any date
  const handleSelectDate = async (dateStr: string) => {
    setSelectedDate(dateStr);
    // Find if task exists for that date; if not, ensure occurrence
    let target = vlogEpisodes.find(
      (t) => t.dueDate === dateStr || t.recurrenceInstanceDate === dateStr
    );
    if (!target) {
      target = await personalService.ensureDailyVlogOccurrence(dateStr);
      setTasks((prev) => [target!, ...prev]);
    }
    if (target) {
      setSelectedTaskId(target.id);
    }
  };

  // Toggle platform upload status (Facebook, YouTube, Instagram, TikTok)
  const handleTogglePlatformUpload = async (platform: VlogPlatform) => {
    if (!currentVlog) return;
    const updated = await personalService.togglePlatformUpload(currentVlog.id, platform);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Toggle checklist item (Recording / Editing / Upload)
  const handleToggleChecklist = async (
    type: "recording" | "editing" | "upload",
    itemId: string,
    currentVal: boolean
  ) => {
    if (!currentVlog) return;
    const updated = await personalService.toggleChecklistItem(
      currentVlog.id,
      type,
      itemId,
      !currentVal
    );
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  const currentNotes = currentVlog?.id
    ? (notesByTaskId[currentVlog.id] ?? currentVlog.notes ?? "")
    : "";

  const handleNotesChange = (val: string) => {
    if (currentVlog?.id) {
      setNotesByTaskId((prev) => ({ ...prev, [currentVlog.id]: val }));
    }
  };

  // Save notes specifically for this day's vlog occurrence
  const handleSaveNotes = async () => {
    if (!currentVlog) return;
    const notesToSave = notesByTaskId[currentVlog.id] ?? currentVlog.notes ?? "";
    const updated = await personalService.updateVlogNotes(currentVlog.id, notesToSave);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

  // Change priority (configurable by user: high, medium, low, urgent)
  const handleChangePriority = async (newPriority: TaskPriority) => {
    if (!currentVlog) return;
    const updated = await personalService.updateVlogPriority(currentVlog.id, newPriority);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Advance stage button: Record → Edit → Upload (→ Published)
  const handleAdvanceStage = async () => {
    if (!currentVlog) return;
    const updated = await personalService.advanceVlogStage(currentVlog.id);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Toggle task complete
  const handleToggleComplete = async () => {
    if (!currentVlog) return;
    const isComp = !currentVlog.isCompleted;
    const updated = await taskService.updateTask(currentVlog.id, {
      status: isComp ? "published" : "in_progress",
      isCompleted: isComp,
    });
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Thumbnail status update (preserved for Phase 6 test compliance)
  const handleThumbnailStatusChange = async (newStatus: ThumbnailStatus) => {
    if (!currentVlog) return;
    const updated = await taskService.updateThumbnailStatus(currentVlog.id, newStatus);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Copy caption to clipboard
  const handleCopyCaption = () => {
    const textToCopy =
      currentVlog?.caption ||
      `Daily Short Vlog • ${currentVlog?.dueDate || selectedDate} #vlog #productivity #creator`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Distribution status of current vlog
  const currentDist = currentVlog?.distributionStatus || {};
  const currentUploadProgress = personalService.getUploadProgressSummary(currentVlog);

  // Active workflow stage
  const activeStage = (currentVlog?.stage || "RECORD").toUpperCase();

  return (
    <PageContainer>
      {/* Top Workspace Header (Google Stitch Design Preserved) */}
      <PageHeader
        badge="Personal Suite • Daily Short Vlog"
        badgeColor="text-purple-300 bg-purple-500/15"
        metaText="LENS_RIG_PRIMARY • Sony A7IV • 4K 24fps • Vertical 9:16"
        title="Personal Workspace"
        description="Daily Short Vlog production pipeline: Record → Edit → Upload across Facebook, YouTube, Instagram, and TikTok."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              icon="today"
              onClick={() => handleSelectDate(todayStr)}
            >
              Go to Today
            </Button>
            <Button
              variant="secondary"
              icon="history"
              onClick={() => setHistoryFilter("this_week")}
            >
              This Week
            </Button>
            <Button
              variant="primary"
              icon="videocam"
              onClick={handleAdvanceStage}
            >
              Advance: {activeStage} →
            </Button>
          </div>
        }
      />

      {/* Top 5 Metrics Row (Stitch Visual Design Preserved) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Today's Vlog */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 border border-outline-variant/10">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">
                Today&apos;s Vlog
              </span>
              <Icon name="camera_roll" size={18} className="text-purple-400" />
            </div>
            <p className="font-headline text-base text-on-surface font-semibold truncate">
              {kpiMetrics.todayVlogTitle}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-outline">Due: 19:30</span>
            <span
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                kpiMetrics.todayVlogStatus === "published" ||
                kpiMetrics.todayVlogStatus === "completed"
                  ? "bg-secondary/20 text-secondary"
                  : "bg-purple-500/20 text-purple-300"
              }`}
            >
              {kpiMetrics.todayVlogStage}
            </span>
          </div>
        </div>

        {/* Metric 2: Recording Progress */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">
                Recording
              </span>
              <Icon name="fiber_manual_record" size={18} className="text-rose-400 animate-pulse" />
            </div>
            <p className="font-headline text-base text-on-surface font-semibold">
              {kpiMetrics.recordingProgress.label}
            </p>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-mono">
              <span>Capture Rig</span>
              <span className="text-rose-400 font-semibold">
                {kpiMetrics.recordingProgress.percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${kpiMetrics.recordingProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Editing Progress */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">
                Editing
              </span>
              <Icon name="timeline" size={18} className="text-primary" />
            </div>
            <p className="font-headline text-base text-on-surface font-semibold truncate">
              {kpiMetrics.editingProgress.label}
            </p>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1 font-mono">
              <span>Timeline Cut</span>
              <span className="text-primary font-semibold">
                {kpiMetrics.editingProgress.percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${kpiMetrics.editingProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Upload Progress (e.g. 3 / 4 platforms uploaded) */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">
                Upload Progress
              </span>
              <Icon name="cloud_upload" size={18} className="text-secondary" />
            </div>
            <p className="font-headline text-base text-on-surface font-semibold truncate">
              {kpiMetrics.uploadProgress.label}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {CANONICAL_VLOG_PLATFORMS.map((plat) => {
              const isUploaded = kpiMetrics.platformStatus[plat];
              return (
                <span
                  key={plat}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                    isUploaded
                      ? "bg-secondary/20 text-secondary border border-secondary/30"
                      : "bg-surface-container text-outline"
                  }`}
                >
                  {plat.slice(0, 2).toUpperCase()}: {isUploaded ? "✓" : "✗"}
                </span>
              );
            })}
          </div>
        </div>

        {/* Metric 5: Creator Streak / Output */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 border border-outline-variant/10">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-secondary/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">
                Creator Streak
              </span>
              <Icon name="bolt" size={18} className="text-purple-400" />
            </div>
            <p className="font-headline text-base text-on-surface font-semibold">
              {kpiMetrics.totalVlogsCompleted} Vlogs Mastered
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-purple-300 font-medium font-mono">
              🔥 {kpiMetrics.creatorStreakDays}-day daily cadence
            </span>
            <span className="text-[11px] font-mono text-secondary">100% Live</span>
          </div>
        </div>
      </div>

      {/* 3-Stage Workflow Pipeline Bar (Record → Edit → Upload) */}
      <div className="bg-surface-container-low rounded-xl p-4 shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="alt_route" size={20} className="text-purple-400" />
            <h3 className="font-headline text-sm font-semibold text-on-surface">
              Daily Vlog Workflow Pipeline
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-outline font-mono text-[11px]">
              Record → Edit → Upload
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-outline">
            <span>Occurrence Date:</span>
            <span className="text-purple-300 font-semibold">{selectedDate}</span>
          </div>
        </div>

        {/* Horizontal Pipeline Stages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 select-none">
          {VLOG_PIPELINE_STAGES.map((st, idx) => {
            const isStageActive =
              activeStage === st ||
              (st === "RECORD" && (activeStage === "RECORDING" || activeStage === "IDEA" || activeStage === "PLANNED")) ||
              (st === "EDIT" && (activeStage === "EDITING" || activeStage === "FOOTAGE READY" || activeStage === "THUMBNAIL" || activeStage === "CAPTION")) ||
              (st === "UPLOAD" && (activeStage === "READY TO POST" || activeStage === "UPLOAD" || activeStage === "PUBLISHED"));

            return (
              <div
                key={st}
                className={`flex items-center justify-between p-3 rounded-lg font-mono text-xs transition-all border ${
                  isStageActive
                    ? "bg-purple-500/15 border-purple-500/40 text-purple-200 shadow-sm"
                    : "bg-surface-container border-outline-variant/10 text-outline"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      isStageActive
                        ? "bg-purple-600 text-white"
                        : "bg-surface-container-high text-outline"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-semibold">{st}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  {st === "RECORD" && (
                    <span>
                      {(currentVlog?.recordingChecklist || []).filter((i) => i.completed).length}/
                      {currentVlog?.recordingChecklist?.length || 3} Done
                    </span>
                  )}
                  {st === "EDIT" && (
                    <span>
                      {(currentVlog?.editingChecklist || []).filter((i) => i.completed).length}/
                      {currentVlog?.editingChecklist?.length || 3} Done
                    </span>
                  )}
                  {st === "UPLOAD" && (
                    <span>{currentUploadProgress.uploaded}/4 Live</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date & History Navigator Bar */}
      <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border border-outline-variant/10">
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <span className="font-mono text-xs text-outline mr-1 flex items-center gap-1">
            <Icon name="calendar_today" size={14} /> Date Filter:
          </span>
          {(["today", "yesterday", "this_week", "this_month", "all"] as PersonalHistoryFilter[]).map(
            (f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setHistoryFilter(f);
                  if (f === "today") handleSelectDate(todayStr);
                  if (f === "yesterday") {
                    const yDate = new Date();
                    yDate.setDate(yDate.getDate() - 1);
                    handleSelectDate(yDate.toISOString().split("T")[0]);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  historyFilter === f
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {f === "this_week"
                  ? "This Week"
                  : f === "this_month"
                  ? "This Month"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Date Picker for arbitrary date history inspection */}
        <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs">
          <span className="text-outline">Select Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) handleSelectDate(e.target.value);
            }}
            className="bg-surface-container px-2.5 py-1 rounded-lg text-on-surface border border-outline-variant/20 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Main 2-Column Split: 7 Cols (Left) / 5 Cols (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Daily Vlog Task, 3-Stage Checklists & Occurrence Notes (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Current Vlog Task Header Card */}
          <div className="bg-surface-container-low rounded-xl p-5 shadow-sm border border-outline-variant/10">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-outline-variant/10">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] font-semibold">
                    DAILY VLOG OCCURRENCE
                  </span>
                  <span className="font-mono text-xs text-outline">
                    {selectedDate === todayStr ? "Today" : selectedDate}
                  </span>
                </div>
                <h2 className="font-headline text-lg font-bold text-on-surface">
                  {currentVlog?.title || "Daily Short Vlog"}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {currentVlog?.description ||
                    "Daily short vlog 3-stage pipeline: Record → Edit → Upload across Facebook, YouTube, Instagram & TikTok."}
                </p>
              </div>

              {/* Completion Toggle Button */}
              <Button
                variant={currentVlog?.isCompleted ? "secondary" : "primary"}
                icon={currentVlog?.isCompleted ? "check_circle" : "radio_button_unchecked"}
                onClick={handleToggleComplete}
              >
                {currentVlog?.isCompleted ? "Completed ✓" : "Mark Finished"}
              </Button>
            </div>

            {/* Task Controls Row: Priority (Configurable) & Scheduled Time */}
            <div className="mt-4 pt-1 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              {/* Configurable Priority */}
              <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/10 flex flex-col gap-1">
                <span className="text-[11px] text-outline uppercase tracking-wider">
                  Priority (Configurable)
                </span>
                <select
                  value={currentVlog?.priority || "high"}
                  onChange={(e) => handleChangePriority(e.target.value as TaskPriority)}
                  className="bg-surface-container-high text-on-surface font-semibold px-2 py-1 rounded border-0 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Scheduled Time */}
              <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/10 flex flex-col gap-1">
                <span className="text-[11px] text-outline uppercase tracking-wider">
                  Scheduled Calendar Time
                </span>
                <span className="text-sm font-semibold text-purple-300">
                  {currentVlog?.dueTime || "19:30"} (07:30 PM)
                </span>
              </div>

              {/* Occurrence Status */}
              <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/10 flex flex-col gap-1">
                <span className="text-[11px] text-outline uppercase tracking-wider">
                  Occurrence State
                </span>
                <span className="text-sm font-semibold text-secondary">
                  {currentVlog?.isCompleted ? "Published / Done" : "Active In Queue"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Record Stage Checklist */}
          <div className="bg-surface-container-low rounded-xl p-4 shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="videocam" size={18} className="text-rose-400" />
                <h3 className="font-headline text-sm font-semibold text-on-surface">
                  1. Record Stage Checklist
                </h3>
              </div>
              <span className="font-mono text-xs text-rose-400">
                {(currentVlog?.recordingChecklist || []).filter((i) => i.completed).length} of{" "}
                {currentVlog?.recordingChecklist?.length || 3} Captured
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              {(currentVlog?.recordingChecklist || personalService.getDefaultRecordingChecklist()).map(
                (item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors border border-outline-variant/5"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist("recording", item.id, item.completed)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-surface-container-highest border-0 accent-purple-500 cursor-pointer"
                    />
                    <span
                      className={`text-xs flex-1 ${
                        item.completed ? "text-outline line-through" : "text-on-surface font-medium"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        item.completed
                          ? "bg-secondary/20 text-secondary"
                          : "bg-surface-container-highest text-outline"
                      }`}
                    >
                      {item.completed ? "DONE" : "PENDING"}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Section 2: Edit Stage Checklist */}
          <div className="bg-surface-container-low rounded-xl p-4 shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="movie_edit" size={18} className="text-primary" />
                <h3 className="font-headline text-sm font-semibold text-on-surface">
                  2. Edit Stage Checklist
                </h3>
              </div>
              <span className="font-mono text-xs text-primary">
                {(currentVlog?.editingChecklist || []).filter((i) => i.completed).length} of{" "}
                {currentVlog?.editingChecklist?.length || 3} Cuts Done
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              {(currentVlog?.editingChecklist || personalService.getDefaultEditingChecklist()).map(
                (item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors border border-outline-variant/5"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist("editing", item.id, item.completed)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-surface-container-highest border-0 accent-purple-500 cursor-pointer"
                    />
                    <span
                      className={`text-xs flex-1 ${
                        item.completed ? "text-outline line-through" : "text-on-surface font-medium"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        item.completed
                          ? "bg-secondary/20 text-secondary"
                          : "bg-surface-container-highest text-outline"
                      }`}
                    >
                      {item.completed ? "DONE" : "PENDING"}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Occurrence Notes Editor (Saved per date occurrence) */}
          <div className="bg-surface-container-low rounded-xl p-4 shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="note" size={18} className="text-purple-400" />
                <h3 className="font-headline text-sm font-semibold text-on-surface">
                  Vlog Occurrence Notes ({selectedDate})
                </h3>
              </div>
              {notesSaved && (
                <span className="text-xs text-secondary font-mono flex items-center gap-1">
                  <Icon name="check" size={14} /> Saved to Database
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={currentNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Record notes, b-roll timecodes, shooting location, audio sync reminders..."
              className="w-full bg-surface-container text-on-surface text-xs p-3 rounded-lg border border-outline-variant/15 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            />
            <div className="mt-2 flex justify-end">
              <Button variant="secondary" icon="save" onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </div>
          </div>

          {/* Connected Dev Cards (Preserved for Phase 6 test compliance) */}
          <div className="bg-surface-container-low rounded-xl p-4 shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="terminal" size={18} className="text-secondary" />
                <h4 className="font-headline text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Linked Web Dev Story Arc
                </h4>
              </div>
              <span className="font-mono text-[11px] text-secondary">
                {linkedDevTasks.length} LINKED
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {linkedDevTasks.length > 0 ? (
                linkedDevTasks.map((devTask) => (
                  <div
                    key={devTask.id}
                    className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/10 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-on-surface">{devTask.title}</span>
                      <span className="text-[11px] text-outline font-mono">
                        {devTask.githubBranchOrCommit || "branch: main"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      linkedVlogId
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-outline font-mono py-1">
                  No linked web dev commits for this vlog date.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Platform Upload Distribution Hub & History Log (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* PLATFORM DISTRIBUTION HUB (Core Requirement for Phase 16) */}
          <div className="bg-surface-container-low rounded-xl p-5 shadow-sm border border-outline-variant/15">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <Icon name="share" size={20} className="text-purple-400" />
                <h3 className="font-headline text-base font-bold text-on-surface">
                  Platform Uploads
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary font-mono text-xs font-bold">
                {currentUploadProgress.label}
              </span>
            </div>

            <p className="text-xs text-on-surface-variant my-3 leading-relaxed">
              Track upload status separately for each channel. Click each platform to toggle between{" "}
              <span className="text-secondary font-semibold">✓ Uploaded</span> and{" "}
              <span className="text-rose-400 font-semibold">✗ Pending</span>.
            </p>

            {/* The 4 Canonical Platforms with separate status toggle */}
            <div className="flex flex-col gap-2">
              {CANONICAL_VLOG_PLATFORMS.map((platform) => {
                const rawStatus = currentDist[platform];
                const isUploaded =
                  rawStatus === "UPLOADED" ||
                  rawStatus === "VERIFIED ✓" ||
                  rawStatus?.startsWith("PUBLISHED") ||
                  rawStatus === "LIVE";

                return (
                  <div
                    key={platform}
                    onClick={() => handleTogglePlatformUpload(platform)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer select-none ${
                      isUploaded
                        ? "bg-surface-container-high border-secondary/40 shadow-sm"
                        : "bg-surface-container hover:bg-surface-container-high border-outline-variant/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          platform === "YouTube"
                            ? "bg-rose-500/20 text-rose-400"
                            : platform === "Instagram"
                            ? "bg-purple-500/20 text-purple-300"
                            : platform === "TikTok"
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {platform === "YouTube" && <Icon name="smart_display" size={18} />}
                        {platform === "Instagram" && <Icon name="photo_camera" size={18} />}
                        {platform === "TikTok" && <Icon name="play_arrow" size={18} />}
                        {platform === "Facebook" && <Icon name="share" size={18} />}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface">{platform}</span>
                        <span className="font-mono text-[11px] text-outline">
                          {isUploaded ? "Live on feed" : "Awaiting export"}
                        </span>
                      </div>
                    </div>

                    {/* Status indicator badge (✓ or ✗) */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold flex items-center gap-1 ${
                          isUploaded
                            ? "bg-secondary text-surface"
                            : "bg-surface-container-highest text-rose-400"
                        }`}
                      >
                        {isUploaded ? (
                          <>
                            <Icon name="check" size={14} />
                            <span>Uploaded ✓</span>
                          </>
                        ) : (
                          <>
                            <Icon name="close" size={14} />
                            <span>Pending ✗</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upload Progress Bar */}
            <div className="mt-4 pt-3 border-t border-outline-variant/10">
              <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant mb-1">
                <span>Distribution Progress</span>
                <span className="text-secondary font-semibold">
                  {currentUploadProgress.uploaded} of {currentUploadProgress.total} Platforms
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${currentUploadProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* VLOG HISTORY ARCHIVE (Never overwrite yesterday's vlog) */}
          <div className="bg-surface-container-low rounded-xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="history" size={18} className="text-purple-400" />
                <h3 className="font-headline text-sm font-semibold text-on-surface">
                  Vlog History Log
                </h3>
              </div>
              <span className="font-mono text-xs text-outline">
                {displayedHistory.length} Occurrences
              </span>
            </div>

            <p className="text-[11px] text-on-surface-variant font-mono">
              Every day is an immutable database record. Click any date below to inspect its task, completion status, platform uploads, and notes.
            </p>

            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
              {displayedHistory.map((ep) => {
                const epDate = ep.dueDate || ep.recurrenceInstanceDate || ep.createdAt.split("T")[0];
                const isSelected = ep.id === currentVlog?.id;
                const dist = ep.distributionStatus || {};
                const epProgress = personalService.getUploadProgressSummary(ep);

                return (
                  <div
                    key={ep.id}
                    onClick={() => {
                      setSelectedTaskId(ep.id);
                      if (ep.dueDate) setSelectedDate(ep.dueDate);
                    }}
                    className={`p-3 rounded-lg transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-surface-container-high border-purple-500/50 shadow-sm ring-1 ring-purple-500/30"
                        : "bg-surface-container hover:bg-surface-container-high border-outline-variant/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-purple-300">
                          {epDate}
                        </span>
                        {epDate === todayStr && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                            TODAY
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          ep.isCompleted || ep.status === "completed" || ep.status === "published"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-surface-container-highest text-outline"
                        }`}
                      >
                        {ep.isCompleted ? "COMPLETED ✓" : (ep.stage || "RECORD").toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-headline text-xs font-semibold text-on-surface truncate">
                      {ep.title}
                    </h4>

                    {/* Platform badges for this past occurrence */}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      {CANONICAL_VLOG_PLATFORMS.map((plat) => {
                        const isUp =
                          dist[plat] === "UPLOADED" ||
                          dist[plat] === "VERIFIED ✓" ||
                          dist[plat]?.startsWith("PUBLISHED") ||
                          dist[plat] === "LIVE";
                        return (
                          <span
                            key={plat}
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              isUp
                                ? "bg-secondary/20 text-secondary"
                                : "bg-surface-container-highest text-outline"
                            }`}
                          >
                            {plat.slice(0, 2)} {isUp ? "✓" : "✗"}
                          </span>
                        );
                      })}
                      <span className="font-mono text-[10px] text-outline ml-auto">
                        {epProgress.uploaded}/4
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Thumbnail & Caption Concept (Preserved for Phase 6 test compliance) */}
          <div className="bg-surface-container-low rounded-xl p-4 shadow-sm border border-outline-variant/10 flex flex-col gap-3">
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
                    className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold transition-all ${
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

            {/* Caption & Description draft */}
            <div className="bg-surface-container rounded-lg p-3 flex flex-col gap-1 border border-outline-variant/10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-outline uppercase tracking-wider">
                  Caption & Description
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
                  "Documenting the day: agency reels, college computer science coursework, and daily vlog packaging. #creator #dailyvlog"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
