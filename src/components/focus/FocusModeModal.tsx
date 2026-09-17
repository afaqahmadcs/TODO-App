"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Task } from "@/types/task";
import { FocusPreset } from "@/types/notification";
import { Icon } from "@/components/ui/Icon";
import { taskService } from "@/services/taskService";
import { analyticsService } from "@/services/analyticsService";
import { notificationService } from "@/services/notificationService";

export interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  onTaskCompleted?: (taskId: string) => void;
  onSessionSaved?: () => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  initialTask,
  onTaskCompleted,
  onSessionSaved,
}) => {
  const [preset, setPreset] = useState<FocusPreset>("pomodoro_25_5");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(initialTask || null);
  const [prevInitialTask, setPrevInitialTask] = useState<Task | null | undefined>(initialTask);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [customMinutesInput, setCustomMinutesInput] = useState("30");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<string>(new Date().toISOString());
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sync when initialTask changes without calling setState in an effect
  if (initialTask !== prevInitialTask) {
    setPrevInitialTask(initialTask);
    setSelectedTask(initialTask || null);
  }

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const handleTimerCompleteRef = useRef<() => void>(() => {});

  // Load available active tasks to allow user switching
  useEffect(() => {
    if (isOpen) {
      taskService.getTasks().then((tasks) => {
        const active = tasks.filter((t) => !t.isCompleted && t.status !== "completed");
        setAllTasks(active);
        if (!selectedTask && active.length > 0) {
          setSelectedTask(active[0]);
        }
      });
    }
  }, [isOpen, selectedTask]);

  // Apply preset changes
  const applyPreset = useCallback((newPreset: FocusPreset, customMin?: number) => {
    setPreset(newPreset);
    setIsRunning(false);
    setIsBreak(false);

    let workMin = 25;
    let brkMin = 5;

    if (newPreset === "deep_work_50_10") {
      workMin = 50;
      brkMin = 10;
    } else if (newPreset === "custom") {
      workMin = customMin || parseInt(customMinutesInput, 10) || 30;
      brkMin = 5;
    }

    setDurationMinutes(workMin);
    setBreakMinutes(brkMin);
    setRemainingSeconds(workMin * 60);
    setSessionStartedAt(new Date().toISOString());
  }, [customMinutesInput]);

  // Handle timer completion (either work or break ended)
  const handleTimerComplete = async () => {
    setIsRunning(false);
    notificationService.playNotificationSound();

    if (!isBreak) {
      // Work session completed! Save to Supabase focus_sessions
      const actualMinutes = durationMinutes;
      const endedAt = new Date().toISOString();

      try {
        await analyticsService.logFocusSession(
          selectedTask?.id,
          actualMinutes,
          true,
          sessionStartedAt,
          endedAt
        );
        onSessionSaved?.();
      } catch (err) {
        console.error("Failed to save focus session:", err);
      }

      notificationService.deliverSystemNotification("Focus Session Complete! 🏆", {
        body: `Great job! You logged ${actualMinutes}m of deep work. Ready for a ${breakMinutes}m break?`,
        icon: "/favicon.ico",
      });

      // Switch to break mode
      setIsBreak(true);
      setRemainingSeconds(breakMinutes * 60);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
    } else {
      // Break session completed!
      notificationService.deliverSystemNotification("Break Complete! ⚡", {
        body: "Rest period finished. Ready to enter your next focus sprint?",
        icon: "/favicon.ico",
      });
      setIsBreak(false);
      setRemainingSeconds(durationMinutes * 60);
    }
  };

  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  });

  // Countdown interval engine
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleTimerCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // User action: Complete Task & Finish Session
  const handleCompleteTaskAndSession = async () => {
    setIsSaving(true);
    setIsRunning(false);
    const elapsedSeconds = durationMinutes * 60 - remainingSeconds;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const endedAt = new Date().toISOString();

    try {
      // 1. Log focus session to Supabase focus_sessions
      await analyticsService.logFocusSession(
        selectedTask?.id,
        elapsedMinutes,
        true,
        sessionStartedAt,
        endedAt
      );

      // 2. Mark task complete if selected
      if (selectedTask) {
        await taskService.toggleTaskCompletion(selectedTask.id);
        onTaskCompleted?.(selectedTask.id);
      }

      onSessionSaved?.();
      notificationService.playNotificationSound();
      setShowSuccessToast(true);

      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Error completing focus session:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut listener (Space = pause/resume, ESC = close)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format MM:SS
  const minutesDisplay = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const secondsDisplay = String(remainingSeconds % 60).padStart(2, "0");

  // SVG circular gauge math
  const totalSeconds = (isBreak ? breakMinutes : durationMinutes) * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const gaugeRadius = 100;
  const circumference = 2 * Math.PI * gaugeRadius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Workspace color
  const getWorkspaceColor = (wsId?: string) => {
    switch (wsId) {
      case "office":
        return "#3b82f6";
      case "personal":
        return "#a855f7";
      case "college":
        return "#10b981";
      case "web-development":
        return "#06b6d4";
      default:
        return "#4f46e5";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#060e20]/90 backdrop-blur-2xl transition-all animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Focus Mode"
    >
      {/* Container Card matching Stitch Minimal Spec */}
      <div className="relative w-full max-w-2xl bg-surface-container-low rounded-3xl border border-outline-variant/20 shadow-2xl p-6 sm:p-8 flex flex-col items-center justify-between min-h-[620px] overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: isBreak ? "#10b981" : getWorkspaceColor(selectedTask?.workspaceId) }}
        />

        {/* Top Header & Presets Bar */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-outline-variant/10 z-10">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBreak ? "bg-emerald-400" : isRunning ? "bg-secondary" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isBreak ? "bg-emerald-400" : isRunning ? "bg-secondary" : "bg-amber-400"
                }`}
              />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface font-mono">
              {isBreak ? "Rest & Recovery Break" : isRunning ? "Flow State Active" : "Session Paused"}
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="inline-flex p-1 rounded-xl bg-surface-container border border-outline-variant/15 text-xs font-semibold">
            <button
              type="button"
              onClick={() => applyPreset("pomodoro_25_5")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                preset === "pomodoro_25_5"
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              25 / 5 Pomodoro
            </button>
            <button
              type="button"
              onClick={() => applyPreset("deep_work_50_10")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                preset === "deep_work_50_10"
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              50 / 10 Deep Work
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomPicker(true);
                applyPreset("custom");
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                preset === "custom"
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Custom
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
            title="Exit Focus Mode (ESC)"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Custom Duration Picker Modal/Inline */}
        {showCustomPicker && preset === "custom" && (
          <div className="w-full flex items-center justify-center gap-2 py-2 bg-surface-container/60 rounded-xl my-2 border border-outline-variant/10 text-xs">
            <span className="text-on-surface-variant">Set Focus Duration:</span>
            {[15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  setCustomMinutesInput(String(mins));
                  applyPreset("custom", mins);
                }}
                className={`px-2.5 py-1 rounded-md font-mono ${
                  durationMinutes === mins
                    ? "bg-primary-container text-white font-bold"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}

        {/* Selected Task Spotlight */}
        <div className="w-full text-center space-y-1.5 my-3 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-xs border border-outline-variant/15">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getWorkspaceColor(selectedTask?.workspaceId) }}
            />
            <span className="text-on-surface-variant uppercase font-mono tracking-wider text-[10px]">
              {selectedTask?.workspaceId?.replace("-", " ") || "Deep Work Focus"}
            </span>
            {selectedTask?.priority && (
              <span className="text-[10px] font-semibold text-rose-400">
                • {selectedTask.priority.toUpperCase()}
              </span>
            )}
          </div>

          {allTasks.length > 1 ? (
            <div className="flex items-center justify-center">
              <select
                aria-label="Select focus task"
                value={selectedTask?.id || ""}
                onChange={(e) => {
                  const found = allTasks.find((t) => t.id === e.target.value);
                  setSelectedTask(found || null);
                }}
                className="max-w-md bg-transparent text-center font-headline text-lg sm:text-xl font-bold text-on-surface outline-none border-b border-dashed border-outline-variant/30 hover:border-primary cursor-pointer px-2 py-1"
              >
                {allTasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-surface-container text-on-surface">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface max-w-md mx-auto line-clamp-2">
              {selectedTask?.title || "General Cognitive Focus Sprint"}
            </h2>
          )}
        </div>

        {/* Large Circular Timer Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
            {/* Background ring */}
            <circle
              className="text-surface-container-high fill-none"
              cx="120"
              cy="120"
              r={gaugeRadius}
              stroke="currentColor"
              strokeWidth="10"
            />
            {/* Active animated countdown ring */}
            <circle
              className="fill-none transition-all duration-500 ease-out"
              cx="120"
              cy="120"
              r={gaugeRadius}
              stroke={isBreak ? "#10b981" : getWorkspaceColor(selectedTask?.workspaceId)}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className="font-headline text-5xl sm:text-6xl font-extrabold text-on-surface tracking-tight font-mono">
              {minutesDisplay}:{secondsDisplay}
            </span>
            <span className="text-xs text-outline font-mono mt-1 uppercase tracking-wider">
              {isBreak ? `Break (${breakMinutes}m)` : `Target: ${durationMinutes}m sprint`}
            </span>
            <span className="text-[11px] text-secondary/80 font-mono mt-0.5">
              Press <kbd className="px-1 py-0.5 rounded bg-surface-container text-white">Space</kbd> to {isRunning ? "pause" : "resume"}
            </span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="w-full flex flex-col items-center gap-3 z-10">
          <div className="flex items-center gap-3">
            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={() => setIsRunning((prev) => !prev)}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-headline font-bold text-sm sm:text-base shadow-lg transition-all active:scale-95 ${
                isRunning
                  ? "bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/20"
                  : "bg-primary-container hover:bg-primary-container/90 text-white shadow-primary-container/25"
              }`}
            >
              <Icon name={isRunning ? "pause" : "play_arrow"} size={22} />
              <span>{isRunning ? "Pause" : "Start Focus"}</span>
            </button>

            {/* Complete Task & Session Button */}
            <button
              type="button"
              onClick={handleCompleteTaskAndSession}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-secondary-container/20 hover:bg-secondary-container/30 text-secondary border border-secondary/30 font-headline font-bold text-sm sm:text-base transition-all active:scale-95 disabled:opacity-50"
              title="Save focus duration and mark task complete"
            >
              <Icon name="check_circle" size={20} />
              <span>{isSaving ? "Saving..." : "Complete Task"}</span>
            </button>
          </div>

          {/* Secondary Actions: Reset / Skip to Break */}
          <div className="flex items-center gap-4 text-xs text-outline pt-1">
            <button
              type="button"
              onClick={() => applyPreset(preset)}
              className="hover:text-on-surface flex items-center gap-1 transition-colors"
            >
              <Icon name="replay" size={14} />
              <span>Reset Timer</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                if (!isBreak) {
                  setIsBreak(true);
                  setRemainingSeconds(breakMinutes * 60);
                } else {
                  setIsBreak(false);
                  setRemainingSeconds(durationMinutes * 60);
                }
              }}
              className="hover:text-on-surface flex items-center gap-1 transition-colors"
            >
              <Icon name="skip_next" size={14} />
              <span>{isBreak ? "Skip to Work" : "Skip to Break"}</span>
            </button>
          </div>
        </div>

        {/* Success Feedback Toast */}
        {showSuccessToast && (
          <div className="absolute bottom-6 px-4 py-2 rounded-xl bg-emerald-500 text-surface font-headline text-xs font-bold shadow-lg animate-in slide-in-from-bottom-2 flex items-center gap-2">
            <Icon name="verified" size={16} />
            <span>Focus session successfully recorded to Supabase!</span>
          </div>
        )}
      </div>
    </div>
  );
};
