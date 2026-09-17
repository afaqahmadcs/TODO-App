"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Task } from "@/types/task";
import { WorkspaceType } from "@/types/workspace";
import { RecurringRule } from "@/types/recurring";
import { Project } from "@/types/project";
import {
  CalendarViewType,
  CalendarFilterType,
  UnifiedCalendarEvent,
  DraggedCalendarEvent,
} from "@/types/calendar";
import { taskService } from "@/services/taskService";
import { recurringTaskService } from "@/services/recurringTaskService";
import { projectService } from "@/services/projectService";
import {
  DEFAULT_TIMEZONE,
  getDatePartsInTimezone,
  addDaysToDateString,
  formatTime12h,
} from "@/lib/recurrenceEngine";
import {
  aggregateCalendarEvents,
  timeStringToMinutes,
  minutesToTimeString,
} from "@/lib/calendarEvents";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { QuickTaskModal } from "@/components/tasks/QuickTaskModal";

const WORKSPACE_THEMES: Record<
  string,
  {
    border: string;
    bg: string;
    text: string;
    badgeBg: string;
    dotColor: string;
  }
> = {
  office: {
    border: "border-l-blue-500",
    bg: "bg-blue-500/10 hover:bg-blue-500/20",
    text: "text-blue-300",
    badgeBg: "bg-blue-500/20 text-blue-300",
    dotColor: "bg-blue-500",
  },
  personal: {
    border: "border-l-purple-500",
    bg: "bg-purple-500/10 hover:bg-purple-500/20",
    text: "text-purple-300",
    badgeBg: "bg-purple-500/20 text-purple-300",
    dotColor: "bg-purple-500",
  },
  college: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
    text: "text-emerald-300",
    badgeBg: "bg-emerald-500/20 text-emerald-300",
    dotColor: "bg-emerald-500",
  },
  "web-development": {
    border: "border-l-cyan-500",
    bg: "bg-cyan-500/10 hover:bg-cyan-500/20",
    text: "text-cyan-300",
    badgeBg: "bg-cyan-500/20 text-cyan-300",
    dotColor: "bg-cyan-500",
  },
  web_development: {
    border: "border-l-cyan-500",
    bg: "bg-cyan-500/10 hover:bg-cyan-500/20",
    text: "text-cyan-300",
    badgeBg: "bg-cyan-500/20 text-cyan-300",
    dotColor: "bg-cyan-500",
  },
};

export default function CalendarPage() {
  const [view, setView] = useState<CalendarViewType>("week");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Set<CalendarFilterType>>(
    new Set(["all"])
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Quick Task Modal for Click-to-Schedule
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDefaults, setCreateModalDefaults] = useState<{
    date?: string;
    time?: string;
    duration?: number;
    workspace?: WorkspaceType;
  }>({});

  // Drag-and-drop state
  const [draggedItem, setDraggedItem] = useState<DraggedCalendarEvent | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Current Pakistan time anchor
  const todayParts = getDatePartsInTimezone(new Date(), DEFAULT_TIMEZONE);
  const [currentAnchorDate, setCurrentAnchorDate] = useState(todayParts.dateString);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  // Keep time ticker up to date
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    async function loadCalendarData() {
      try {
        await recurringTaskService.generateUpcomingTasks(14);
        const [loadedTasks, loadedRules, loadedProjects] = await Promise.all([
          taskService.getTasks(),
          recurringTaskService.getRules(),
          projectService.getProjects(),
        ]);
        if (isMounted) {
          setTasks(loadedTasks);
          setRecurringRules(loadedRules);
          setProjects(loadedProjects);
        }
      } catch (err) {
        console.error("Failed to load calendar data:", err);
      }
    }
    loadCalendarData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Clear toast notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // Navigate dates
  const navigateDate = (step: number) => {
    const daysToAdd = view === "day" ? step : view === "week" ? step * 7 : step * 30;
    setCurrentAnchorDate((prev) => addDaysToDateString(prev, daysToAdd));
  };

  const jumpToToday = () => {
    setCurrentAnchorDate(todayParts.dateString);
  };

  // Toggle filter
  const handleToggleFilter = (filter: CalendarFilterType) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (filter === "all") {
        return new Set(["all"]);
      }
      next.delete("all");
      if (next.has(filter)) {
        next.delete(filter);
        if (next.size === 0) next.add("all");
      } else {
        next.add(filter);
      }
      return next;
    });
  };

  // Week days calculation (Monday to Sunday)
  const weekDays = useMemo(() => {
    const [y, m, d] = currentAnchorDate.split("-").map(Number);
    const currDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const dayOfWeek = currDate.getUTCDay();
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

  // Month days calculation (35 days grid)
  const monthDays = useMemo(() => {
    const [y, m] = currentAnchorDate.split("-").map(Number);
    const firstOfMonth = new Date(Date.UTC(y, m - 1, 1, 12, 0, 0));
    const dayOfWeek = firstOfMonth.getUTCDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startGridDate = new Date(firstOfMonth);
    startGridDate.setUTCDate(firstOfMonth.getUTCDate() + diffToMonday);

    const days: {
      dateString: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    for (let i = 0; i < 35; i++) {
      const day = new Date(startGridDate);
      day.setUTCDate(startGridDate.getUTCDate() + i);
      const dateStr = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, "0")}-${String(
        day.getUTCDate()
      ).padStart(2, "0")}`;

      days.push({
        dateString: dateStr,
        dayNum: day.getUTCDate(),
        isCurrentMonth: day.getUTCMonth() === m - 1,
        isToday: dateStr === todayParts.dateString,
      });
    }

    return days;
  }, [currentAnchorDate, todayParts.dateString]);

  // Window dates based on active view
  const activeWindowDates = useMemo(() => {
    if (view === "day") return [currentAnchorDate];
    if (view === "week") return weekDays.map((d) => d.dateString);
    return monthDays.map((d) => d.dateString);
  }, [view, currentAnchorDate, weekDays, monthDays]);

  // Unified Calendar Events across all sources
  const allEvents = useMemo(() => {
    return aggregateCalendarEvents({
      tasks,
      recurringRules,
      projects,
      windowDates: activeWindowDates,
      timezone: DEFAULT_TIMEZONE,
    });
  }, [tasks, recurringRules, projects, activeWindowDates]);

  // Apply active filters
  const filteredEvents = useMemo(() => {
    if (selectedFilters.has("all")) return allEvents;

    return allEvents.filter((event) => {
      if (selectedFilters.has("recurring") && event.isRecurring) return true;
      if (selectedFilters.has("projects") && (event.sourceType === "project" || event.sourceType === "deadline")) return true;
      if (selectedFilters.has("office") && event.workspaceId === "office") return true;
      if (selectedFilters.has("personal") && event.workspaceId === "personal") return true;
      if (selectedFilters.has("college") && event.workspaceId === "college") return true;
      if (
        selectedFilters.has("web-development") &&
        (event.workspaceId === "web_development" || event.workspaceId === "web-development")
      ) {
        return true;
      }
      return false;
    });
  }, [allEvents, selectedFilters]);

  // Filter count statistics for badges
  const filterCounts = useMemo(() => {
    let office = 0;
    let personal = 0;
    let college = 0;
    let webdev = 0;
    let projectsCount = 0;
    let recurring = 0;

    for (const ev of allEvents) {
      if (ev.workspaceId === "office") office++;
      if (ev.workspaceId === "personal") personal++;
      if (ev.workspaceId === "college") college++;
      if (ev.workspaceId === "web_development" || ev.workspaceId === "web-development") webdev++;
      if (ev.sourceType === "project" || ev.sourceType === "deadline") projectsCount++;
      if (ev.isRecurring) recurring++;
    }

    return {
      all: allEvents.length,
      office,
      personal,
      college,
      webdev,
      projects: projectsCount,
      recurring,
    };
  }, [allEvents]);

  // Total booked hours in current window
  const totalBookedHours = useMemo(() => {
    const totalMinutes = filteredEvents
      .filter((e) => !e.isAllDay)
      .reduce((acc, e) => acc + (e.durationMin || 0), 0);
    return (totalMinutes / 60).toFixed(1);
  }, [filteredEvents]);

  // Open task detail drawer or synthesize inspection
  const handleEventClick = useCallback((event: UnifiedCalendarEvent) => {
    if (event.rawTask) {
      setSelectedTask(event.rawTask);
      setIsDrawerOpen(true);
      return;
    }

    // If it's a projected recurring rule or class event without a concrete task row, create synthetic task object
    const syntheticTask: Task = {
      id: event.id,
      title: event.title,
      description: event.description || "",
      workspaceId: event.workspaceId,
      status: (event.status as Task["status"]) || "todo",
      priority: event.priority || "medium",
      dueDate: event.date,
      dueTime: event.startTime,
      estimatedDurationMin: event.durationMin,
      isRecurring: event.isRecurring,
      recurringRuleId: event.recurringRuleId,
      subtasks: [],
      tags: [],
      isCompleted: false,
      notes: event.location ? `Location: ${event.location}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedTask(syntheticTask);
    setIsDrawerOpen(true);
  }, []);

  // Empty slot click to schedule rapidly
  const handleEmptySlotClick = (dateString: string, timeString: string) => {
    setCreateModalDefaults({
      date: dateString,
      time: timeString,
      duration: 60,
      workspace: "office",
    });
    setIsCreateModalOpen(true);
  };

  // Drag and Drop handlers
  const handleDragStart = (event: UnifiedCalendarEvent) => {
    if (!event.rawTask) return;
    setDraggedItem({
      eventId: event.id,
      originalDate: event.date,
      originalTime: event.startTime,
      sourceType: event.sourceType,
      taskId: event.rawTask.id,
    });
  };

  const handleDropOnSlot = async (targetDate: string, targetTime: string) => {
    if (!draggedItem || !draggedItem.taskId) return;

    const taskId = draggedItem.taskId;
    setDraggedItem(null);

    // Optimistic state update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: targetDate, dueTime: targetTime } : t))
    );

    setNotification(`Rescheduled to ${targetDate} at ${formatTime12h(targetTime)}`);

    try {
      await taskService.updateTask(taskId, {
        dueDate: targetDate,
        dueTime: targetTime,
      });
    } catch (err) {
      console.error("Failed to reschedule task:", err);
      setNotification("Error updating schedule in database.");
    }
  };

  // Duration Resize Handler (+15m or -15m)
  const handleResizeDuration = async (event: UnifiedCalendarEvent, deltaMinutes: number) => {
    if (!event.rawTask) return;
    const taskId = event.rawTask.id;
    const currentDur = event.durationMin || 45;
    const newDuration = Math.max(15, currentDur + deltaMinutes);

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, estimatedDurationMin: newDuration } : t))
    );

    setNotification(`Adjusted duration: ${newDuration} mins`);

    try {
      await taskService.updateTask(taskId, {
        estimatedDurationMin: newDuration,
      });
    } catch (err) {
      console.error("Failed to update duration:", err);
    }
  };

  // 15 hours from 07:00 to 22:00
  const hoursRange = useMemo(() => {
    const hours: { hour: number; label: string; time24: string }[] = [];
    for (let h = 7; h <= 21; h++) {
      const time24 = `${String(h).padStart(2, "0")}:00`;
      hours.push({
        hour: h,
        label: formatTime12h(time24),
        time24,
      });
    }
    return hours;
  }, []);

  // Formatted period title
  const periodTitle = useMemo(() => {
    const [y, m] = currentAnchorDate.split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, 15));
    const monthName = dateObj.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    if (view === "day") {
      return `${monthName} ${currentAnchorDate.split("-")[2]}, ${y}`;
    }
    if (view === "week") {
      return `${monthName} ${y} • ${weekDays[0].label} ${weekDays[0].dayNum} – ${weekDays[6].label} ${weekDays[6].dayNum}`;
    }
    return `${monthName} ${y}`;
  }, [currentAnchorDate, view, weekDays]);

  return (
    <PageContainer>
      <PageHeader
        badge="Productivity Calendar"
        metaText="Google Stitch Minimal • Timezone: Asia/Karachi (PKT UTC+5)"
        title="Calendar & Time-Blocking"
        description="Unified schedule combining daily content drops, live academic lectures, and web development sprints."
        actions={
          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-inner">
              {(["month", "week", "day"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    view === v
                      ? "bg-primary-container text-white shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              onClick={jumpToToday}
              className="text-xs font-mono font-bold"
            >
              Today
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                setCreateModalDefaults({
                  date: currentAnchorDate,
                  time: "10:00",
                  duration: 60,
                  workspace: "office",
                });
                setIsCreateModalOpen(true);
              }}
              className="text-xs flex items-center gap-1.5 shadow-md"
            >
              <Icon name="add" size={16} />
              <span>Schedule Block</span>
            </Button>
          </div>
        }
      />

      {/* Interactive Top Control Bar & Date Navigation */}
      <div className="w-full px-space-md py-space-sm flex flex-col gap-space-sm bg-surface-container-low rounded-2xl border border-outline-variant/20 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Date Stepper & Period Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigateDate(-1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-outline-variant/20"
                title="Previous Period"
              >
                <Icon name="chevron_left" size={18} />
              </button>
              <button
                type="button"
                onClick={() => navigateDate(1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-outline-variant/20"
                title="Next Period"
              >
                <Icon name="chevron_right" size={18} />
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <h2 className="font-headline text-lg font-bold text-on-surface">
                {periodTitle}
              </h2>
            </div>
          </div>

          {/* Right: Timezone Chip & Cadence Metric */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/20 text-outline text-xs font-mono">
              <Icon name="schedule" size={14} className="text-secondary" />
              <span>PKT (UTC+5) • {minutesToTimeString(currentTimeMinutes)} Current</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-outline">
              <span>Cadence:</span>
              <span className="font-mono text-on-surface bg-surface-container px-2 py-0.5 rounded-md border border-outline-variant/20 font-semibold">
                {totalBookedHours} hrs booked
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Select Scope Filter Bar */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-outline-variant/10 overflow-x-auto pb-1">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-outline">
              Scope:
            </span>

            {/* All Chip */}
            <button
              type="button"
              onClick={() => handleToggleFilter("all")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedFilters.has("all")
                  ? "bg-primary-container text-white border-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-on-surface"
              }`}
            >
              <span>All</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                {filterCounts.all}
              </span>
            </button>

            {/* Office Chip */}
            <button
              type="button"
              onClick={() => handleToggleFilter("office")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedFilters.has("office")
                  ? "bg-blue-600/30 text-blue-200 border-blue-500"
                  : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-on-surface"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Office</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-blue-300">
                {filterCounts.office}
              </span>
            </button>

            {/* Personal Chip */}
            <button
              type="button"
              onClick={() => handleToggleFilter("personal")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedFilters.has("personal")
                  ? "bg-purple-600/30 text-purple-200 border-purple-500"
                  : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-on-surface"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Personal</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-purple-300">
                {filterCounts.personal}
              </span>
            </button>

            {/* College Chip */}
            <button
              type="button"
              onClick={() => handleToggleFilter("college")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedFilters.has("college")
                  ? "bg-emerald-600/30 text-emerald-200 border-emerald-500"
                  : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-on-surface"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>College</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-emerald-300">
                {filterCounts.college}
              </span>
            </button>

            {/* Web Dev Chip */}
            <button
              type="button"
              onClick={() => handleToggleFilter("web-development")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedFilters.has("web-development")
                  ? "bg-cyan-600/30 text-cyan-200 border-cyan-500"
                  : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-on-surface"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Web Dev</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-cyan-300">
                {filterCounts.webdev}
              </span>
            </button>

            {/* Projects Chip */}
            <button
              type="button"
              onClick={() => handleToggleFilter("projects")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedFilters.has("projects")
                  ? "bg-amber-600/30 text-amber-200 border-amber-500"
                  : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-on-surface"
              }`}
            >
              <Icon name="folder" size={13} className="text-amber-400" />
              <span>Deadlines</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-amber-300">
                {filterCounts.projects}
              </span>
            </button>

            {/* Recurring Sync Chip */}
            <button
              type="button"
              onClick={() => handleToggleFilter("recurring")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedFilters.has("recurring")
                  ? "bg-indigo-600/30 text-indigo-200 border-indigo-500"
                  : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:text-on-surface"
              }`}
            >
              <Icon name="autorenew" size={13} className="text-purple-400" />
              <span>Recurring</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-purple-300">
                {filterCounts.recurring}
              </span>
            </button>
          </div>

          {/* Mini Legend */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-outline shrink-0 font-mono">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span>Event</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Deadline</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span>Class</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="autorenew" size={13} className="text-purple-400" />
              <span>Routine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-surface-container-high text-white text-xs font-mono shadow-2xl border border-primary/40 animate-fadeIn flex items-center gap-2">
          <Icon name="check_circle" size={16} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE DATE CAROUSEL (Visible on Small Screens) */}
      {/* ========================================================================= */}
      <div className="md:hidden flex items-center justify-between gap-1 p-2 bg-surface-container-low rounded-xl border border-outline-variant/15">
        {weekDays.map((day) => (
          <button
            key={day.dateString}
            type="button"
            onClick={() => setCurrentAnchorDate(day.dateString)}
            className={`flex flex-col items-center flex-1 py-1.5 rounded-lg text-xs transition-all ${
              day.dateString === currentAnchorDate
                ? "bg-primary-container text-white font-bold shadow-md"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="text-[10px] uppercase opacity-70">{day.label[0]}</span>
            <span className="font-mono text-sm">{day.dayNum}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* WEEK VIEW (Time-Slot Matrix) */}
      {/* ========================================================================= */}
      {view === "week" && (
        <div className="w-full flex flex-col bg-surface-container-low rounded-2xl border border-outline-variant/20 shadow-md overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] bg-surface-container sticky top-0 z-20 border-b border-outline-variant/20">
            <div className="p-3 flex flex-col items-center justify-center text-outline border-r border-outline-variant/15">
              <Icon name="schedule" size={16} />
              <span className="font-mono text-[10px]">PKT</span>
            </div>

            {weekDays.map((day) => (
              <div
                key={day.dateString}
                className={`p-2.5 flex flex-col items-center justify-center border-r border-outline-variant/15 last:border-r-0 transition-colors ${
                  day.isToday ? "bg-surface-container-highest relative" : "bg-surface-container"
                }`}
              >
                {day.isToday && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
                )}
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs uppercase font-bold tracking-wider ${
                      day.isToday ? "text-primary" : "text-outline"
                    }`}
                  >
                    {day.label}
                  </span>
                  {day.isToday && (
                    <span className="font-mono text-[9px] bg-primary text-white px-1 rounded-full uppercase">
                      Today
                    </span>
                  )}
                </div>
                <span className="font-headline text-base font-bold text-on-surface mt-0.5">
                  {day.dayNum}
                </span>
              </div>
            ))}
          </div>

          {/* All-Day Deadlines Banner Row */}
          <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] bg-surface-container-lowest py-2 border-b border-outline-variant/15">
            <div className="flex items-center justify-center font-mono text-[11px] text-outline border-r border-outline-variant/15">
              All-day
            </div>
            {weekDays.map((day) => {
              const allDayEvents = filteredEvents.filter(
                (e) => e.date === day.dateString && e.isAllDay
              );
              return (
                <div
                  key={day.dateString}
                  className="px-1.5 flex flex-col gap-1 border-r border-outline-variant/15 last:border-r-0"
                >
                  {allDayEvents.map((dl) => (
                    <div
                      key={dl.id}
                      onClick={() => handleEventClick(dl)}
                      className="px-2 py-0.5 rounded text-[11px] bg-red-500/15 border border-red-500/30 text-red-300 font-semibold truncate flex items-center justify-between cursor-pointer hover:bg-red-500/25"
                    >
                      <span className="truncate">{dl.title}</span>
                      <Icon name="flag" size={12} className="text-red-400 shrink-0" />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Hourly Grid Rows */}
          <div className="relative divide-y divide-outline-variant/10 min-h-[960px] bg-surface-container-low">
            {hoursRange.map((hr) => {
              return (
                <div
                  key={hr.hour}
                  className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] min-h-[72px]"
                >
                  {/* Time Label */}
                  <div className="flex items-start justify-center pt-2 font-mono text-xs text-outline border-r border-outline-variant/15 bg-surface-container-low select-none">
                    {hr.time24}
                  </div>

                  {/* Day Slots */}
                  {weekDays.map((day) => {
                    const slotEvents = filteredEvents.filter((e) => {
                      if (e.isAllDay) return false;
                      if (e.date !== day.dateString) return false;
                      const eventMins = timeStringToMinutes(e.startTime);
                      const startHour = Math.floor(eventMins / 60);
                      return startHour === hr.hour;
                    });

                    return (
                      <div
                        key={`${day.dateString}-${hr.hour}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnSlot(day.dateString, hr.time24)}
                        className="relative p-1 border-r border-outline-variant/10 last:border-r-0 hover:bg-surface-container/30 transition-colors group/slot"
                      >
                        {/* Event Cards inside this hour */}
                        {slotEvents.map((event) => {
                          const theme = WORKSPACE_THEMES[event.workspaceId] || WORKSPACE_THEMES.office;
                          return (
                            <div
                              key={event.id}
                              draggable={Boolean(event.rawTask)}
                              onDragStart={() => handleDragStart(event)}
                              onClick={() => handleEventClick(event)}
                              className={`rounded-xl p-2.5 border border-outline-variant/20 border-l-4 ${theme.border} ${theme.bg} shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between mb-1.5 select-none`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] uppercase font-bold ${theme.badgeBg}`}
                                    >
                                      {event.workspaceId.replace("_", " ")}
                                    </span>
                                    {event.isRecurring && (
                                      <Icon
                                        name="autorenew"
                                        size={12}
                                        className="text-purple-400"
                                      />
                                    )}
                                  </div>
                                  <h4 className="font-bold text-xs text-on-surface truncate mt-1">
                                    {event.title}
                                  </h4>
                                </div>
                                {event.rawTask && (
                                  <Icon
                                    name="drag_indicator"
                                    size={14}
                                    className="text-outline shrink-0 opacity-0 group-hover/slot:opacity-100"
                                  />
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[10px] font-mono text-outline pt-1 mt-1 border-t border-outline-variant/10">
                                <span className={theme.text}>
                                  {formatTime12h(event.startTime)} – {formatTime12h(event.endTime)}
                                </span>
                                <span>{event.durationMin}m</span>
                              </div>

                              {/* Interactive Resize Stepper Handle */}
                              {event.rawTask && (
                                <div
                                  className="w-full pt-1 flex items-center justify-center gap-2 opacity-30 hover:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    title="Decrease 15 mins"
                                    onClick={() => handleResizeDuration(event, -15)}
                                    className="w-4 h-4 rounded bg-surface-container text-on-surface-variant hover:text-white flex items-center justify-center text-[10px]"
                                  >
                                    -
                                  </button>
                                  <div className="w-8 h-1 bg-outline/40 rounded-full" />
                                  <button
                                    type="button"
                                    title="Increase 15 mins"
                                    onClick={() => handleResizeDuration(event, 15)}
                                    className="w-4 h-4 rounded bg-surface-container text-on-surface-variant hover:text-white flex items-center justify-center text-[10px]"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Hover Quick Add Hint on Empty Slot */}
                        {slotEvents.length === 0 && (
                          <div
                            onClick={() => handleEmptySlotClick(day.dateString, hr.time24)}
                            className="w-full h-full min-h-[58px] rounded-lg border-2 border-dashed border-transparent hover:border-outline-variant/40 hover:bg-surface-container/50 flex items-center justify-center transition-all cursor-pointer opacity-0 hover:opacity-100"
                          >
                            <span className="text-[11px] font-mono text-primary flex items-center gap-1 font-semibold">
                              <Icon name="add" size={14} /> Quick Block
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DAY VIEW (Vertical Hourly Timeline) */}
      {/* ========================================================================= */}
      {view === "day" && (
        <Card variant="low" className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
            <div className="flex items-center gap-3">
              <Icon name="calendar_today" size={24} className="text-primary" />
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  {periodTitle}
                </h3>
                <span className="font-mono text-xs text-outline">
                  {filteredEvents.length} events booked for this day
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleEmptySlotClick(currentAnchorDate, "12:00")}
              className="text-xs flex items-center gap-1"
            >
              <Icon name="add" size={14} />
              <span>Add Event to Day</span>
            </Button>
          </div>

          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="py-16 text-center text-on-surface-variant font-mono text-sm space-y-3">
                <Icon name="event_busy" size={32} className="text-outline mx-auto" />
                <p>No events or tasks scheduled for this day.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEmptySlotClick(currentAnchorDate, "10:00")}
                >
                  Schedule First Event
                </Button>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const theme = WORKSPACE_THEMES[event.workspaceId] || WORKSPACE_THEMES.office;
                return (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className={`p-4 rounded-xl border border-outline-variant/15 border-l-4 ${theme.border} ${theme.bg} cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-on-surface-variant flex items-center gap-1">
                          <Icon name="schedule" size={14} className="text-primary" />
                          <span>
                            {formatTime12h(event.startTime)} – {formatTime12h(event.endTime)}
                          </span>
                        </span>
                        <span className="font-mono text-xs text-outline">
                          ({event.durationMin} mins)
                        </span>
                        {event.isRecurring && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold flex items-center gap-1">
                            <Icon name="autorenew" size={12} />
                            <span>Recurring Automation</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-on-surface">{event.title}</h4>

                      {event.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {event.location && (
                        <div className="flex items-center gap-1 text-xs font-mono text-outline pt-1">
                          <Icon name="location_on" size={13} className="text-secondary" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full font-mono text-xs font-semibold capitalize ${theme.badgeBg}`}
                      >
                        {event.workspaceId.replace("_", " ")}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase ${
                          event.status === "completed" || event.status === "done"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : event.priority === "high" || event.priority === "urgent"
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-surface-container text-on-surface-variant border border-outline-variant/20"
                        }`}
                      >
                        {event.status}
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
      {/* MONTH VIEW (Heatmap Grid + Deadlines Widget) */}
      {/* ========================================================================= */}
      {view === "month" && (
        <div className="space-y-6">
          <Card variant="low" className="p-4 space-y-3">
            {/* Day Header Row */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs uppercase font-bold text-on-surface-variant pb-2 border-b border-outline-variant/15">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="p-1">
                  {d}
                </div>
              ))}
            </div>

            {/* 35-Day Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthDays.map((day) => {
                const dayEvents = filteredEvents.filter((e) => e.date === day.dateString);
                return (
                  <div
                    key={day.dateString}
                    onClick={() => {
                      setCurrentAnchorDate(day.dateString);
                      setView("day");
                    }}
                    className={`min-h-[85px] p-2 rounded-xl border border-outline-variant/10 bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col justify-between ${
                      day.isToday ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30" : ""
                    } ${!day.isCurrentMonth ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold ${
                          day.isToday
                            ? "w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-sm"
                            : "text-on-surface"
                        }`}
                      >
                        {day.dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-mono text-primary font-bold">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-hidden mt-1">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const theme = WORKSPACE_THEMES[ev.workspaceId] || WORKSPACE_THEMES.office;
                        return (
                          <div
                            key={ev.id}
                            className={`text-[9px] font-mono truncate px-1.5 py-0.5 rounded border border-outline-variant/15 flex items-center gap-1 ${theme.badgeBg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                            <span className="truncate">{ev.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[8px] font-mono text-outline pl-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Bottom Section: Month Density & Deadlines Widget */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Heatmap Overview Widget */}
            <div className="lg:col-span-2 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 shadow-md flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="calendar_month" size={20} className="text-primary" />
                  <span className="font-headline text-base font-bold text-on-surface">
                    Workspace Density & Capacity Map
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-outline">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-surface-container-highest" /> Low
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-primary-container" /> Mod
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-secondary" /> Peak
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-outline pt-2 bg-surface-container-lowest px-4 py-2 rounded-xl">
                <span>Cycle: Q3-Q4 Strategic Release</span>
                <span className="text-primary font-bold">87% On-Schedule Velocity</span>
              </div>
            </div>

            {/* Deadlines & Milestones Widget */}
            <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 shadow-md flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
                  <Icon name="flag" size={18} className="text-secondary" />
                  Deadlines & Milestones
                </span>
                <span className="font-mono text-xs text-outline">Q3/Q4</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-7 rounded-full bg-secondary shrink-0" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-on-surface truncate">CS301 Midterm Exam</h5>
                      <span className="text-[10px] text-outline font-mono">College • Algorithms</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-secondary shrink-0">Oct 22</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-7 rounded-full bg-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-on-surface truncate">Portfolio Redesign</h5>
                      <span className="text-[10px] text-outline font-mono">Web Dev • Showcase</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-cyan-300 shrink-0">Oct 25</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-7 rounded-full bg-primary shrink-0" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-on-surface truncate">TaskFlow Beta Launch</h5>
                      <span className="text-[10px] text-outline font-mono">Production Rollout</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-primary shrink-0">Nov 15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK TASK CREATION MODAL (Pre-filled on Click-to-Schedule) */}
      {/* ========================================================================= */}
      <QuickTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultDueDate={createModalDefaults.date}
        defaultDueTime={createModalDefaults.time}
        defaultEstimatedDurationMin={createModalDefaults.duration}
        defaultWorkspace={createModalDefaults.workspace}
        onTaskCreated={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
          setNotification(`Created schedule block: "${newTask.title}"`);
          setIsCreateModalOpen(false);
        }}
      />

      {/* ========================================================================= */}
      {/* TASK DETAIL DRAWER (Slide-over Inspector) */}
      {/* ========================================================================= */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={(updated) => {
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          setSelectedTask(updated);
        }}
        onTaskDeleted={(deletedId) => {
          setTasks((prev) => prev.filter((t) => t.id !== deletedId));
          setIsDrawerOpen(false);
          setSelectedTask(null);
        }}
      />
    </PageContainer>
  );
}
