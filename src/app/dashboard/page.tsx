"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { QuickTaskModal } from "@/components/tasks/QuickTaskModal";
import { taskService } from "@/services/taskService";
import { analyticsService } from "@/services/analyticsService";
import { Task } from "@/types/task";
import { DashboardTelemetry } from "@/types/analytics";
import Link from "next/link";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [telemetry, setTelemetry] = useState<DashboardTelemetry | null>(null);
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "overdue" | "high" | "medium">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [allTasks, liveTelemetry] = await Promise.all([
          taskService.getTasks(),
          analyticsService.getDashboardTelemetry(),
        ]);
        if (mounted) {
          setTasks(allTasks);
          setTelemetry(liveTelemetry);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[Dashboard] Failed to load live telemetry:", err);
        if (mounted) setIsLoading(false);
      }
    }
    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // Keyboard shortcut listener (Cmd/Ctrl + K, N, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "n" || e.key === "N") {
        setIsCreateModalOpen(true);
      } else if (e.key === "f" || e.key === "F") {
        setFocusModeActive((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle task completion toggle with optimistic updates & telemetry refresh
  const handleToggleComplete = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextComp = !t.isCompleted;
          return {
            ...t,
            isCompleted: nextComp,
            status: nextComp ? "completed" : "todo",
            completedAt: nextComp ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );

    await taskService.toggleTaskCompletion(taskId);
    // Refresh telemetry
    const updatedTelemetry = await analyticsService.getDashboardTelemetry();
    setTelemetry(updatedTelemetry);

    if (selectedTask?.id === taskId) {
      const updated = await taskService.getTaskById(taskId);
      if (updated) setSelectedTask(updated);
    }
  };

  // Date and greeting
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Calculate live filtered tasks
  const overdueTasksList = useMemo(
    () => tasks.filter((t) => t.dueDate && t.dueDate < todayStr && !t.isCompleted),
    [tasks, todayStr]
  );
  const urgentCount = overdueTasksList.length;

  // Filter priority tasks
  const priorityTasksList = useMemo(() => {
    return tasks.filter((t) => {
      const isPending = !t.isCompleted && t.status !== "completed";
      const isHighOrUrgent = t.priority === "high" || t.priority === "urgent";
      const isOverdue = Boolean(t.dueDate && t.dueDate < todayStr && !t.isCompleted);

      if (priorityFilter === "overdue") return isOverdue;
      if (priorityFilter === "high") return isHighOrUrgent && isPending;
      if (priorityFilter === "medium") return t.priority === "medium" && isPending;

      // "all"
      if (activeTab === "today") {
        return (t.dueDate === todayStr || isOverdue || isHighOrUrgent) && isPending;
      }
      return isPending || isOverdue;
    });
  }, [tasks, priorityFilter, activeTab, todayStr]);

  // Today's schedule tasks sorted by time
  const todayScheduleTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate === todayStr || (!t.dueDate && (t.workspaceId === "office" || t.workspaceId === "college")))
      .sort((a, b) => (a.dueTime || "23:59").localeCompare(b.dueTime || "23:59"));
  }, [tasks, todayStr]);

  // Upcoming tasks (scheduled for tomorrow and beyond)
  const upcomingTasksList = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate && t.dueDate > todayStr && !t.isCompleted)
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
      .slice(0, 5);
  }, [tasks, todayStr]);

  // Workspace color helper
  const getWorkspaceColor = (wsId: string) => {
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

  const getWorkspaceName = (wsId: string) => {
    switch (wsId) {
      case "office":
        return "Office";
      case "personal":
        return "Personal";
      case "college":
        return "College";
      case "web-development":
        return "Web Dev";
      default:
        return "Workspace";
    }
  };

  return (
    <PageContainer>
      {/* Top Welcome Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight">
              {greeting}, Afaq
            </h1>
            <span className="text-2xl animate-pulse">👋</span>
          </div>
          <p className="text-sm text-on-surface-variant flex items-center flex-wrap gap-2">
            <span>{formattedDate}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-outline" />
            {urgentCount > 0 ? (
              <span className="text-error font-medium flex items-center gap-1">
                <Icon name="priority_high" size={16} />
                You have {urgentCount} urgent item{urgentCount > 1 ? "s" : ""} needing attention today
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Icon name="check_circle" size={16} />
                All priority workflows on schedule
              </span>
            )}
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="inline-flex p-1 rounded-xl bg-surface-container-low shadow-sm border border-outline-variant/20">
            <button
              type="button"
              onClick={() => setActiveTab("today")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "today"
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("week")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "week"
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              This Week
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFocusModeActive((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm border border-outline-variant/20 ${
              focusModeActive
                ? "bg-primary-container text-white shadow-md"
                : "bg-surface-container-low hover:bg-surface-container text-on-surface"
            }`}
          >
            <Icon name="bolt" size={18} className="text-tertiary" />
            <span>{focusModeActive ? "Focus Active" : "Focus Mode"}</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono text-on-surface-variant">
              F
            </span>
          </button>

          <Button
            variant="primary"
            icon="add"
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-sm"
          >
            <span>Quick Task</span>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono text-white">
              N
            </span>
          </Button>
        </div>
      </section>

      {/* Top 4 KPI Metrics Grid (Real Supabase Telemetry) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Total Tasks */}
        <Card variant="low" hoverEffect className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Total Tasks
            </span>
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Icon name="assignment" size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold font-headline text-on-surface">
              {telemetry?.totalTasks ?? (isLoading ? "..." : tasks.length)}
            </span>
            <span className="text-xs text-outline font-mono">
              {activeTab === "today" ? "Scheduled today" : "Active & Planned"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-secondary font-medium">
            <span>Live database sync</span>
          </div>
        </Card>

        {/* Metric 2: Completed Tasks */}
        <Card variant="low" hoverEffect className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Completed
            </span>
            <div className="w-9 h-9 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
              <Icon name="check_circle" size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold font-headline text-on-surface">
              {telemetry?.completedTasks ?? 0}
            </span>
            <span className="text-xs text-outline font-mono">
              {telemetry?.productivityMetrics.completionRate ?? 0}% completion rate
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-secondary font-medium">
            <Icon name="trending_up" size={14} />
            <span>↑ Realtime completion update</span>
          </div>
        </Card>

        {/* Metric 3: Pending Tasks */}
        <Card variant="low" hoverEffect className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Pending
            </span>
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-error">
              <Icon name="hourglass_top" size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold font-headline text-on-surface">
              {telemetry?.pendingTasks ?? 0}
            </span>
            <span className="text-xs text-error font-mono font-medium">
              {telemetry?.highPriorityPending ?? 0} high priority
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium">
            {(telemetry?.overdueTasks ?? 0) > 0 ? (
              <span className="text-error flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                <span>{telemetry?.overdueTasks} overdue items</span>
              </span>
            ) : (
              <span className="text-emerald-400">All deadlines on schedule</span>
            )}
          </div>
        </Card>

        {/* Metric 4: Productivity Score */}
        <Card variant="low" hoverEffect className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Productivity Score
            </span>
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <Icon name="local_fire_department" size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold font-headline text-on-surface">
              {telemetry?.productivityScore ?? 0}%
            </span>
            <span className="text-xs text-outline font-mono">Flow state index</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
            <span>🔥 {telemetry?.productivityMetrics.currentStreak ?? 1}-day streak active</span>
          </div>
        </Card>
      </section>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Today's Progress, Priority Tasks, Upcoming Tasks (~67%) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Today's Progress Hero Card */}
          <Card variant="low" className="p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline text-lg font-bold text-on-surface">
                    Today&apos;s Progress
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-xs font-medium">
                    {(telemetry?.todayProgress.percentage ?? 0) >= 70 ? "On Pace" : "In Progress"}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {(telemetry?.todayProgress.percentage ?? 0) >= 80
                    ? "Exceptional execution. You are well ahead of today's schedule."
                    : "Track and execute priority deliverables across all active workspaces."}
                </p>
              </div>

              {/* Radial Meter */}
              <div className="flex items-center gap-4 bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/10">
                <div className="flex flex-col text-right">
                  <span className="font-headline text-xl font-bold text-on-surface">
                    {telemetry?.todayProgress.percentage ?? 0}%
                  </span>
                  <span className="text-xs text-outline font-mono">
                    {telemetry?.todayProgress.completedToday ?? 0} of{" "}
                    {telemetry?.todayProgress.totalToday ?? 0} critical targets
                  </span>
                </div>

                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-highest"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-secondary transition-all duration-700"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${telemetry?.todayProgress.percentage ?? 0}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <Icon name="trending_up" size={16} className="absolute text-secondary" />
                </div>
              </div>
            </div>

            {/* Segmented multi-workspace progress bar */}
            <div className="space-y-3">
              <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden flex gap-1 p-0.5">
                <div
                  className="h-full rounded-full bg-[#3b82f6] transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      15,
                      Math.round(
                        ((telemetry?.todayProgress.workspaceBreakdown.office.completed ?? 1) /
                          Math.max(1, telemetry?.todayProgress.totalToday ?? 1)) *
                          100
                      )
                    )}%`,
                  }}
                  title="Office"
                />
                <div
                  className="h-full rounded-full bg-[#a855f7] transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      15,
                      Math.round(
                        ((telemetry?.todayProgress.workspaceBreakdown.personal.completed ?? 1) /
                          Math.max(1, telemetry?.todayProgress.totalToday ?? 1)) *
                          100
                      )
                    )}%`,
                  }}
                  title="Personal"
                />
                <div
                  className="h-full rounded-full bg-[#10b981] transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      15,
                      Math.round(
                        ((telemetry?.todayProgress.workspaceBreakdown.college.completed ?? 1) /
                          Math.max(1, telemetry?.todayProgress.totalToday ?? 1)) *
                          100
                      )
                    )}%`,
                  }}
                  title="College"
                />
                <div
                  className="h-full rounded-full bg-[#06b6d4] transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      15,
                      Math.round(
                        ((telemetry?.todayProgress.workspaceBreakdown.webDevelopment.completed ?? 1) /
                          Math.max(1, telemetry?.todayProgress.totalToday ?? 1)) *
                          100
                      )
                    )}%`,
                  }}
                  title="Web Dev"
                />
              </div>

              {/* Breakdown pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                  <span className="text-xs text-on-surface-variant">Office:</span>
                  <span className="font-mono text-xs text-on-surface font-semibold ml-auto">
                    {telemetry?.todayProgress.workspaceBreakdown.office.completed ?? 0}/
                    {telemetry?.todayProgress.workspaceBreakdown.office.total ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                  <span className="text-xs text-on-surface-variant">Personal:</span>
                  <span className="font-mono text-xs text-on-surface font-semibold ml-auto">
                    {telemetry?.todayProgress.workspaceBreakdown.personal.completed ?? 0}/
                    {telemetry?.todayProgress.workspaceBreakdown.personal.total ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span className="text-xs text-on-surface-variant">College:</span>
                  <span className="font-mono text-xs text-on-surface font-semibold ml-auto">
                    {telemetry?.todayProgress.workspaceBreakdown.college.completed ?? 0}/
                    {telemetry?.todayProgress.workspaceBreakdown.college.total ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                  <span className="text-xs text-on-surface-variant">WebDev:</span>
                  <span className="font-mono text-xs text-on-surface font-semibold ml-auto">
                    {telemetry?.todayProgress.workspaceBreakdown.webDevelopment.completed ?? 0}/
                    {telemetry?.todayProgress.workspaceBreakdown.webDevelopment.total ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Priority Tasks Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-headline text-lg font-bold text-on-surface">Priority Tasks</h2>
                <p className="text-xs text-on-surface-variant">
                  Urgent and high-impact assignments requiring action
                </p>
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setPriorityFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    priorityFilter === "all"
                      ? "bg-primary-container text-white"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  All ({priorityTasksList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("overdue")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                    priorityFilter === "overdue"
                      ? "bg-rose-500 text-white"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span>🔥 Overdue</span>
                  <span className="text-rose-400 font-semibold">{urgentCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("high")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    priorityFilter === "high"
                      ? "bg-primary-container text-white"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  High Priority
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("medium")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    priorityFilter === "medium"
                      ? "bg-primary-container text-white"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Medium
                </button>
              </div>
            </div>

            {/* Task list items */}
            <div className="space-y-2.5">
              {priorityTasksList.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-surface-container-low border border-outline-variant/10">
                  <Icon name="task_alt" size={32} className="mx-auto text-secondary mb-2" />
                  <p className="text-sm font-semibold text-on-surface">No priority tasks in this filter</p>
                  <p className="text-xs text-outline mt-0.5">All matching tasks are completed or scheduled.</p>
                </div>
              ) : (
                priorityTasksList.slice(0, 6).map((task) => {
                  const isOverdue = Boolean(task.dueDate && task.dueDate < todayStr && !task.isCompleted);
                  return (
                    <div
                      key={task.id}
                      className="group flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10 cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDrawerOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(task.id);
                          }}
                          className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            task.isCompleted
                              ? "bg-secondary text-surface"
                              : "bg-surface-container-highest border border-outline-variant/40 hover:border-primary text-transparent hover:text-outline"
                          }`}
                        >
                          <Icon name="check" size={14} />
                        </button>

                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium truncate group-hover:text-primary transition-colors ${
                              task.isCompleted ? "line-through text-outline" : "text-on-surface"
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                              style={{
                                backgroundColor: `${getWorkspaceColor(task.workspaceId)}15`,
                                color: getWorkspaceColor(task.workspaceId),
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: getWorkspaceColor(task.workspaceId) }}
                              />
                              {getWorkspaceName(task.workspaceId)}
                            </span>

                            {isOverdue ? (
                              <span className="text-xs text-error font-medium flex items-center gap-1">
                                <Icon name="timer" size={13} />
                                Due: {task.dueTime || "End of day"} (Overdue)
                              </span>
                            ) : task.dueTime ? (
                              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                <Icon name="schedule" size={13} />
                                Due: {task.dueTime}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Right pills */}
                      <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                        {task.priority === "high" || task.priority === "urgent" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container/30 text-error text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-error" />
                            High Priority
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-secondary text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            Medium
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                            setIsDrawerOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface-container-highest text-on-surface-variant transition-all"
                        >
                          <Icon name="more_vert" size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Tasks (Queue) Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">Upcoming Tasks</h3>
                <p className="text-xs text-on-surface-variant">
                  Scheduled for upcoming shifts and study intervals
                </p>
              </div>
              <Link
                href="/calendar"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View Full Schedule</span>
                <Icon name="arrow_forward" size={14} />
              </Link>
            </div>

            <div className="rounded-xl bg-surface-container-low divide-y divide-surface-container-highest/20 overflow-hidden shadow-sm border border-outline-variant/10">
              {upcomingTasksList.length === 0 ? (
                <div className="p-5 text-center text-xs text-outline">
                  No upcoming tasks scheduled for tomorrow yet.
                </div>
              ) : (
                upcomingTasksList.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task);
                      setIsDrawerOpen(true);
                    }}
                    className="flex items-center justify-between p-3.5 hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getWorkspaceColor(task.workspaceId) }}
                      />
                      <span className="text-sm text-on-surface truncate font-medium">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 text-on-surface-variant">
                      <span className="font-mono text-xs text-outline">
                        {task.dueDate} {task.dueTime ? `• ${task.dueTime}` : ""}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                            setIsDrawerOpen(true);
                          }}
                          className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                          title="Open Task"
                        >
                          <Icon name="arrow_forward" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Today's Schedule Live Timeline & Workspaces Overview (~33%) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Today's Schedule Live Timeline */}
          <Card variant="low" className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-headline text-base font-bold text-on-surface">Today&apos;s Schedule</h2>
                <p className="text-xs text-on-surface-variant">Live sequential agenda</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Live Timeline
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
              {todayScheduleTasks.length === 0 ? (
                <div className="text-xs text-outline py-2">No tasks scheduled for today yet.</div>
              ) : (
                todayScheduleTasks.slice(0, 7).map((task, idx) => {
                  const isDone = task.isCompleted || task.status === "completed";
                  const isCurrent = !isDone && idx === 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDrawerOpen(true);
                      }}
                      className={`relative group cursor-pointer ${
                        isCurrent ? "p-2.5 rounded-lg bg-surface-container shadow-sm -ml-2" : ""
                      }`}
                    >
                      {isDone ? (
                        <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-secondary ring-4 ring-surface-container-low flex items-center justify-center" />
                      ) : isCurrent ? (
                        <>
                          <span className="absolute -left-[35px] top-3 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-surface-container-low animate-ping" />
                          <span className="absolute -left-[35px] top-3 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-surface-container-low" />
                        </>
                      ) : (
                        <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-surface-container-highest ring-4 ring-surface-container-low" />
                      )}

                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-mono text-xs ${
                              isDone
                                ? "text-outline line-through"
                                : isCurrent
                                ? "text-primary font-bold"
                                : "text-outline"
                            }`}
                          >
                            {task.dueTime || "Scheduled"}
                            {isCurrent ? " • NOW" : ""}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-primary-container text-white text-[10px] font-semibold">
                              Active
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs mt-0.5 ${
                            isDone
                              ? "text-on-surface-variant line-through"
                              : isCurrent
                              ? "text-on-surface font-semibold"
                              : "text-on-surface font-medium"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Evening Wrap Item */}
              <div className="relative group">
                <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-surface-container-highest ring-4 ring-surface-container-low" />
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-outline">08:00 PM</span>
                  <span className="text-xs text-on-surface-variant">🌙 Evening Wrap & Task Review</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Workspace Overview (4 Domain Cards with real Supabase data) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-base font-bold text-on-surface">Workspaces</h2>
              <span className="font-mono text-xs text-outline">4 Active</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(telemetry?.workspaces || []).map((ws) => (
                <Link
                  key={ws.id}
                  href={`/${ws.id === "web-development" ? "web-development" : ws.id}`}
                  className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10 block group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ws.color }} />
                      <span className="font-headline text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {ws.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface">
                      {ws.completionPercentage}% Done
                    </span>
                  </div>

                  {/* Progress Mini Bar */}
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${ws.completionPercentage}%`, backgroundColor: ws.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
                    <span>
                      {ws.completed} / {ws.totalTasks} Tasks
                    </span>
                    <span>{ws.timeSpentFormatted} spent</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Drawer */}
      {selectedTask && (
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
            analyticsService.getDashboardTelemetry().then(setTelemetry);
          }}
          onTaskDeleted={(deletedId) => {
            setTasks((prev) => prev.filter((t) => t.id !== deletedId));
            setIsDrawerOpen(false);
            setSelectedTask(null);
            analyticsService.getDashboardTelemetry().then(setTelemetry);
          }}
        />
      )}

      {/* Quick Task Creation Modal */}
      <QuickTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
          analyticsService.getDashboardTelemetry().then(setTelemetry);
        }}
      />
    </PageContainer>
  );
}
