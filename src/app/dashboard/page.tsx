"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { QuickTaskModal } from "@/components/tasks/QuickTaskModal";
import { taskService } from "@/services/taskService";
import { Task, TaskStatus } from "@/types/task";
import { WORKSPACES } from "@/lib/constants";
import Link from "next/link";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    taskService
      .getTasks()
      .then((allTasks) => {
        if (!isCancelled) setTasks(allTasks);
      })
      .catch((err) => {
        if (!isCancelled) console.error("Failed to load dashboard tasks:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleToggleComplete = async (taskId: string) => {
    // Optimistic UI update
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

    const updated = await taskService.toggleTaskCompletion(taskId);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const isComp = newStatus === "completed" || newStatus === "done";
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              isCompleted: isComp,
              completedAt: isComp ? new Date().toISOString() : undefined,
            }
          : t
      )
    );

    const updated = await taskService.updateTaskStatus(taskId, newStatus);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted || t.status === "completed").length;
  const pendingCount = totalTasks - completedCount;
  const overdueCount = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && !t.isCompleted).length;
  const highPriorityCount = tasks.filter((t) => t.priority === "high" && !t.isCompleted).length;
  const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Filter tasks based on activeTab (today vs week)
  const priorityQueueTasks = tasks
    .filter((t) => {
      if (activeTab === "today") {
        return t.dueDate === todayStr || (!t.isCompleted && !t.dueDate);
      }
      return true;
    })
    .slice(0, 6);

  return (
    <PageContainer>
      {/* Top Welcome Header */}
      <PageHeader
        badge="System Online"
        badgeColor="text-emerald-400 bg-emerald-500/15"
        metaText={`Tuesday, September 16 • ${pendingCount} items in priority queue`}
        title="Good Evening, Afaq 👋"
        description="Unified command center across Office publishing, Personal vlogs, College academics, and Web Development."
        actions={
          <>
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("today")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "week"
                    ? "bg-primary-container text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                This Week
              </button>
            </div>
            <Button
              variant="primary"
              icon="add"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Add Task
            </Button>
          </>
        }
      />

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Tasks */}
        <Card variant="low" hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Total Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Icon name="assignment" size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-bold font-headline text-on-surface">
              {totalTasks}
            </span>
            <span className="text-xs text-outline font-mono">Scheduled</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-secondary font-medium">
            <span>Live database sync</span>
          </div>
        </Card>

        {/* Metric 2: Completed */}
        <Card variant="low" hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Icon name="check_circle" size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-bold font-headline text-on-surface">
              {completedCount}
            </span>
            <span className="text-xs text-outline font-mono">
              {completionPercent}% done
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span>↑ Realtime completion update</span>
          </div>
        </Card>

        {/* Metric 3: Pending */}
        <Card variant="low" hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Pending
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Icon name="hourglass_top" size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-bold font-headline text-on-surface">
              {pendingCount}
            </span>
            <span className="text-xs text-rose-400 font-mono font-medium">
              {highPriorityCount} high priority
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
            {overdueCount > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                <span>{overdueCount} overdue items</span>
              </>
            ) : (
              <span>All deadlines on schedule</span>
            )}
          </div>
        </Card>

        {/* Metric 4: Productivity Score */}
        <Card variant="low" hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-outline font-mono">
              Productivity
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <Icon name="local_fire_department" size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-bold font-headline text-on-surface">
              {completionPercent > 0 ? `${completionPercent}%` : "92%"}
            </span>
            <span className="text-xs text-secondary font-mono">Top 5%</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
            <span>🔥 8-day streak active</span>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Priority Queue (8 cols or 12 if drawer open) */}
        <div className={isDrawerOpen ? "lg:col-span-8 space-y-4" : "lg:col-span-8 space-y-4"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Priority Action Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-outline text-xs font-mono">
                {priorityQueueTasks.length}
              </span>
            </div>
            <Link
              href="/tasks"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <span>View all in My Tasks</span>
              <Icon name="arrow_forward" size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {priorityQueueTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={selectedTask?.id === task.id}
                onClick={(t) => {
                  setSelectedTask(t);
                  setIsDrawerOpen(true);
                }}
                onToggleComplete={handleToggleComplete}
                onStatusChange={handleStatusChange}
                layoutMode="card"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Workspaces Matrix & Detail Drawer or Quick Glance (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {isDrawerOpen && selectedTask ? (
            <TaskDetailDrawer
              task={selectedTask}
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
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
          ) : (
            <>
              <Card variant="low" className="space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
                  <span className="font-headline text-sm font-bold text-on-surface">
                    Workspaces Matrix
                  </span>
                  <span className="font-mono text-xs text-outline">4 Active</span>
                </div>

                <div className="space-y-2.5">
                  {WORKSPACES.map((w) => (
                    <Link
                      key={w.id}
                      href={w.route}
                      className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all flex items-center justify-between group border border-outline-variant/10"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: w.color }}
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                            {w.title}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant line-clamp-1">
                            {w.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-outline bg-surface-container-highest px-2 py-0.5 rounded">
                        {w.metaBadge}
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>

              {/* Web Dev Recurring Class Reminder */}
              <Card variant="default" className="border-l-4 border-l-cyan-400 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 font-mono">
                    <Icon name="event" size={16} />
                    <span>TODAY • 4:00 PM — 6:00 PM</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold">
                    LAB #1
                  </span>
                </div>
                <h4 className="text-sm font-bold text-on-surface">
                  Advanced Fullstack Web Development
                </h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  Next.js 16 App Router, Server Actions & Optimistic UI Mutations.
                </p>
                <Link
                  href="/web-development"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:underline"
                >
                  <span>View Workspace details</span>
                  <Icon name="arrow_forward" size={14} />
                </Link>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Quick Task Creation Modal */}
      <QuickTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
        }}
      />
    </PageContainer>
  );
}
