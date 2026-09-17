"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Task } from "@/types/task";
import { WorkspaceType } from "@/types/workspace";
import { taskService } from "@/services/taskService";
import { recurringTaskService } from "@/services/recurringTaskService";
import {
  DEFAULT_TIMEZONE,
  getDatePartsInTimezone,
  addDaysToDateString,
  formatTime12h,
} from "@/lib/recurrenceEngine";

type CalendarView = "day" | "week" | "month";

const WORKSPACE_THEMES: Record<
  WorkspaceType,
  { border: string; bg: string; text: string; badge: "primary" | "emerald" | "amber" | "cyan" | "purple" }
> = {
  office: {
    border: "border-l-blue-500",
    bg: "bg-blue-500/10 hover:bg-blue-500/20",
    text: "text-blue-300",
    badge: "primary",
  },
  personal: {
    border: "border-l-purple-500",
    bg: "bg-purple-500/10 hover:bg-purple-500/20",
    text: "text-purple-300",
    badge: "purple",
  },
  college: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
    text: "text-emerald-300",
    badge: "emerald",
  },
  "web-development": {
    border: "border-l-cyan-500",
    bg: "bg-cyan-500/10 hover:bg-cyan-500/20",
    text: "text-cyan-300",
    badge: "cyan",
  },
  web_development: {
    border: "border-l-cyan-500",
    bg: "bg-cyan-500/10 hover:bg-cyan-500/20",
    text: "text-cyan-300",
    badge: "cyan",
  },
};

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("week");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType | "all">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Timezone anchor
  const todayParts = getDatePartsInTimezone(new Date(), DEFAULT_TIMEZONE);
  const [currentAnchorDate, setCurrentAnchorDate] = useState(todayParts.dateString);

  // Load tasks & auto-generate upcoming recurring tasks if needed
  useEffect(() => {
    async function initCalendar() {
      // First ensure recurring tasks for window are generated without duplicates
      await recurringTaskService.generateUpcomingTasks(14);
      const allTasks = await taskService.getTasks();
      setTasks(allTasks);
    }
    initCalendar();
  }, []);

  // Filter tasks by selected workspace
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedWorkspace !== "all" && t.workspaceId !== selectedWorkspace) {
        return false;
      }
      return true;
    });
  }, [tasks, selectedWorkspace]);

  // Navigate dates
  const navigateDate = (step: number) => {
    const daysToAdd = view === "day" ? step : view === "week" ? step * 7 : step * 30;
    setCurrentAnchorDate((prev) => addDaysToDateString(prev, daysToAdd));
  };

  const jumpToToday = () => {
    setCurrentAnchorDate(todayParts.dateString);
  };

  // Calculate days in the current week view
  const weekDays = useMemo(() => {
    const [y, m, d] = currentAnchorDate.split("-").map(Number);
    const currDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const dayOfWeek = currDate.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    // Start week on Monday (1)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayDate = new Date(currDate);
    mondayDate.setUTCDate(currDate.getUTCDate() + diffToMonday);

    const days: { dateString: string; label: string; dayNum: number; isToday: boolean }[] = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const day = new Date(mondayDate);
      day.setUTCDate(mondayDate.getUTCDate() + i);
      const dateStr = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, "0")}-${String(
        day.getUTCDate()
      ).padStart(2, "0")}`;

      days.push({
        dateString: dateStr,
        label: dayNames[i],
        dayNum: day.getUTCDate(),
        isToday: dateStr === todayParts.dateString,
      });
    }

    return days;
  }, [currentAnchorDate, todayParts.dateString]);

  // Tasks for day view
  const dayTasks = useMemo(() => {
    return filteredTasks
      .filter((t) => t.dueDate === currentAnchorDate)
      .sort((a, b) => (a.dueTime || "00:00").localeCompare(b.dueTime || "00:00"));
  }, [filteredTasks, currentAnchorDate]);

  return (
    <PageContainer>
      <PageHeader
        badge="Productivity Calendar"
        metaText="Integrated with recurring automations • User timezone (Asia/Karachi • UTC+5)"
        title="Calendar & Time-Blocking"
        description="Synchronized schedule showing daily content publishing drops, live academic labs, and web development sprints."
        actions={
          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
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

            <Button variant="secondary" onClick={jumpToToday} className="text-xs">
              Today
            </Button>
          </div>
        }
      />

      {/* Workspace Domain Filter Chips & Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/15">
        {/* Workspace Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: "all", label: "All Workspaces", icon: "dashboard" },
              { id: "office", label: "Office", icon: "business_center" },
              { id: "personal", label: "Personal", icon: "videocam" },
              { id: "college", label: "College", icon: "school" },
              { id: "web_development", label: "Web Dev", icon: "code" },
            ] as const
          ).map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => setSelectedWorkspace(ws.id as WorkspaceType | "all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedWorkspace === ws.id
                  ? "bg-primary-container text-white border-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50"
              }`}
            >
              <Icon name={ws.icon} size={14} />
              <span>{ws.label}</span>
            </button>
          ))}
        </div>

        {/* Date Stepper Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
          <button
            type="button"
            onClick={() => navigateDate(-1)}
            className="p-1.5 rounded-lg bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-on-surface"
          >
            <Icon name="chevron_left" size={16} />
          </button>

          <span className="px-3 py-1 rounded-lg bg-surface-container font-semibold text-on-surface">
            {view === "week"
              ? `${weekDays[0].dateString} — ${weekDays[6].dateString}`
              : currentAnchorDate}
          </span>

          <button
            type="button"
            onClick={() => navigateDate(1)}
            className="p-1.5 rounded-lg bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-on-surface"
          >
            <Icon name="chevron_right" size={16} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WEEK VIEW (Default) */}
      {/* ========================================================================= */}
      {view === "week" && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayEvents = filteredTasks.filter((t) => t.dueDate === day.dateString);

            return (
              <Card
                key={day.dateString}
                variant="low"
                className={`p-3 space-y-3 min-h-[420px] flex flex-col ${
                  day.isToday ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30" : ""
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold uppercase text-on-surface-variant">
                      {day.label}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                        day.isToday
                          ? "bg-primary text-white shadow-sm"
                          : "text-on-surface bg-surface-container"
                      }`}
                    >
                      {day.dayNum}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-outline">
                    {dayEvents.length} items
                  </span>
                </div>

                {/* Day Tasks Stream */}
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {dayEvents.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-3 text-[11px] font-mono text-outline">
                      No events
                    </div>
                  ) : (
                    dayEvents.map((task) => {
                      const theme = WORKSPACE_THEMES[task.workspaceId] || WORKSPACE_THEMES.office;
                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`p-2 rounded-xl border border-outline-variant/15 border-l-4 ${theme.border} ${theme.bg} cursor-pointer transition-all space-y-1`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono font-bold text-on-surface-variant flex items-center gap-1">
                              <Icon name="schedule" size={10} />
                              <span>{formatTime12h(task.dueTime || "09:00")}</span>
                            </span>

                            {task.isRecurring && (
                              <span
                                title="Recurring Automation Routine"
                                className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold flex items-center gap-0.5"
                              >
                                <Icon name="repeat" size={9} />
                                <span>Repeat</span>
                              </span>
                            )}
                          </div>

                          <h5 className="text-xs font-bold text-on-surface line-clamp-2">
                            {task.title}
                          </h5>

                          <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant pt-1 border-t border-outline-variant/10">
                            <span className="capitalize">{task.workspaceId.replace("_", " ")}</span>
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span>✓ {task.subtasks.length} steps</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DAY VIEW */}
      {/* ========================================================================= */}
      {view === "day" && (
        <Card variant="low" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
            <div className="flex items-center gap-2">
              <Icon name="calendar_today" size={20} className="text-primary" />
              <h3 className="font-headline text-lg font-bold text-on-surface">
                {currentAnchorDate}
              </h3>
              {currentAnchorDate === todayParts.dateString && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-semibold">
                  Today
                </span>
              )}
            </div>
            <span className="font-mono text-xs text-outline">
              {dayTasks.length} Events Scheduled
            </span>
          </div>

          <div className="space-y-3">
            {dayTasks.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant font-mono text-sm">
                No events or tasks scheduled for this day.
              </div>
            ) : (
              dayTasks.map((task) => {
                const theme = WORKSPACE_THEMES[task.workspaceId] || WORKSPACE_THEMES.office;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`p-4 rounded-xl border border-outline-variant/15 border-l-4 ${theme.border} ${theme.bg} cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-on-surface-variant flex items-center gap-1">
                          <Icon name="schedule" size={14} className="text-primary" />
                          <span>{formatTime12h(task.dueTime || "09:00")}</span>
                        </span>
                        {task.estimatedDurationMin && (
                          <span className="font-mono text-xs text-outline">
                            ({task.estimatedDurationMin}m)
                          </span>
                        )}
                        {task.isRecurring && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold flex items-center gap-1">
                            <Icon name="repeat" size={12} />
                            <span>Recurring Automation</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-on-surface">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <span className="px-2.5 py-1 rounded-full bg-surface-container font-mono text-xs font-semibold text-on-surface capitalize">
                        {task.workspaceId.replace("_", " ")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase ${
                          task.status === "completed" || task.status === "done"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : task.priority === "high" || task.priority === "urgent"
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-surface-container text-on-surface-variant border border-outline-variant/20"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MONTH VIEW */}
      {/* ========================================================================= */}
      {view === "month" && (
        <Card variant="low" className="p-4 space-y-3">
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs uppercase font-bold text-on-surface-variant pb-2 border-b border-outline-variant/15">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="p-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, idx) => {
              const [y, m] = currentAnchorDate.split("-").map(Number);
              const dayDate = new Date(Date.UTC(y, m - 1, idx - 4, 12, 0, 0));
              const dateStr = `${dayDate.getUTCFullYear()}-${String(dayDate.getUTCMonth() + 1).padStart(
                2,
                "0"
              )}-${String(dayDate.getUTCDate()).padStart(2, "0")}`;

              const cellTasks = filteredTasks.filter((t) => t.dueDate === dateStr);
              const isToday = dateStr === todayParts.dateString;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentAnchorDate(dateStr);
                    setView("day");
                  }}
                  className={`min-h-[75px] p-1.5 rounded-xl border border-outline-variant/10 bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col justify-between ${
                    isToday ? "border-primary/60 bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        isToday
                          ? "w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {dayDate.getUTCDate()}
                    </span>
                    {cellTasks.length > 0 && (
                      <span className="text-[9px] font-mono text-primary font-bold">
                        {cellTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    {cellTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="text-[9px] truncate px-1 py-0.2 rounded bg-surface-container text-on-surface font-mono"
                      >
                        {t.isRecurring ? "🔁 " : ""}
                        {t.title}
                      </div>
                    ))}
                    {cellTasks.length > 2 && (
                      <div className="text-[8px] font-mono text-outline">
                        +{cellTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* EVENT DETAIL INSPECTOR MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs uppercase text-primary font-bold">
                  {selectedTask.workspaceId.replace("_", " ")} Task
                </span>
                <h3 className="text-base font-bold text-on-surface mt-0.5">{selectedTask.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {selectedTask.description && (
              <p className="text-xs text-on-surface-variant">{selectedTask.description}</p>
            )}

            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/15 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Scheduled Date:</span>
                <span className="text-on-surface font-semibold">{selectedTask.dueDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Time & Duration:</span>
                <span className="text-on-surface font-semibold">
                  {formatTime12h(selectedTask.dueTime || "09:00")} (
                  {selectedTask.estimatedDurationMin || 30}m)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Automation:</span>
                <span className="text-on-surface font-semibold">
                  {selectedTask.isRecurring ? "Recurring Routine" : "Standard Task"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Priority / Status:</span>
                <span className="text-on-surface font-semibold">
                  {selectedTask.priority.toUpperCase()} / {selectedTask.status.toUpperCase()}
                </span>
              </div>
            </div>

            {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-semibold text-on-surface-variant">
                  Checklist Steps ({selectedTask.subtasks.length})
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {selectedTask.subtasks.map((step, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-mono text-on-surface flex items-center gap-2"
                    >
                      <Icon
                        name={step.isCompleted ? "check_circle" : "radio_button_unchecked"}
                        size={14}
                        className={step.isCompleted ? "text-emerald-400" : "text-outline"}
                      />
                      <span className={step.isCompleted ? "line-through text-outline" : ""}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
