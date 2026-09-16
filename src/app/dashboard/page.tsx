"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TaskCard } from "@/components/tasks/TaskCard";
import { taskService } from "@/services/taskService";
import { Task } from "@/types/task";
import { WORKSPACES } from "@/lib/constants";
import Link from "next/link";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");

  useEffect(() => {
    taskService.getTasks().then(setTasks);
  }, []);

  const handleToggleComplete = async (taskId: string) => {
    const updated = await taskService.toggleTaskCompletion(taskId);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    }
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const pendingCount = tasks.filter((t) => !t.isCompleted).length;

  return (
    <PageContainer>
      {/* Top Welcome Header */}
      <PageHeader
        badge="System Online"
        badgeColor="text-emerald-400 bg-emerald-500/15"
        metaText="Tuesday, September 16 • 3 urgent items needing attention"
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
            <Button variant="secondary" icon="bolt" shortcut="F">
              Focus Mode
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
              {tasks.length}
            </span>
            <span className="text-xs text-outline font-mono">Scheduled</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-secondary font-medium">
            <span>+2 from yesterday</span>
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
              {tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}% done` : "0%"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span>↑ 12% vs last week</span>
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
              3 high priority
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>2 due within 3h</span>
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
              92%
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
        {/* Left Column: Active Tasks (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Priority Action Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-outline text-xs font-mono">
                {tasks.length}
              </span>
            </div>
            <Link
              href="/tasks"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <Icon name="arrow_forward" size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Workspaces Hub & Class Quick Glance (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
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
              Next.js 15 App Router, Server Actions & Optimistic UI Mutations.
            </p>
            <Link
              href="/web-development"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:underline"
            >
              <span>View Workspace details</span>
              <Icon name="arrow_forward" size={14} />
            </Link>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
