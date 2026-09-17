"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Task, TaskPriority } from "@/types/task";
import { Project } from "@/types/project";
import { taskService, RECURRING_CLASSES } from "@/services/taskService";
import { projectService } from "@/services/projectService";

export default function WebDevelopmentWorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [vlogs, setVlogs] = useState<Task[]>([]);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [activeSprintFilter, setActiveSprintFilter] = useState<"all" | "high" | "in_progress">("all");

  // Load tasks, projects, and vlogs
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [allTasks, allProjects, allVlogs] = await Promise.all([
          taskService.getTasks(),
          projectService.getProjects("web-development"),
          taskService.getVlogs(),
        ]);
        if (mounted) {
          setTasks(allTasks);
          setProjects(allProjects);
          setVlogs(allVlogs);
        }
      } catch (err) {
        console.error("Failed to load web development workspace data:", err);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter tasks for web development workspace
  const webTasks = useMemo(() => {
    return tasks.filter((t) => t.workspaceId === "web-development");
  }, [tasks]);

  // Sprint tasks
  const sprintTasks = useMemo(() => {
    let filtered = webTasks.filter((t) => t.stage === "SPRINT" || !t.stage);
    if (activeSprintFilter === "high") {
      filtered = filtered.filter((t) => t.priority === "high" || t.priority === "urgent");
    } else if (activeSprintFilter === "in_progress") {
      filtered = filtered.filter((t) => t.status === "in_progress");
    }
    return filtered;
  }, [webTasks, activeSprintFilter]);

  // Practice tasks
  const practiceTasks = useMemo(() => {
    return webTasks.filter((t) => t.stage === "PRACTICE" || t.tags.includes("algorithms") || t.tags.includes("leetcode"));
  }, [webTasks]);

  // Bridge tasks: tasks linked to a personal vlog via relational reference
  const devJourneyVlogTasks = useMemo(() => {
    return webTasks.filter((t) => Boolean(t.linkedVlogId));
  }, [webTasks]);

  // Toggle sprint task checkbox
  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const isCompleted = currentStatus === "completed" || currentStatus === "done";
    const updated = await taskService.updateTask(taskId, {
      status: isCompleted ? "todo" : "completed",
    });
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Quick add sprint task
  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    const newTask = await taskService.createTask({
      title: quickTaskTitle.trim(),
      workspaceId: "web-development",
      stage: "SPRINT",
      priority: "medium" as TaskPriority,
      status: "todo",
      dueDate: new Date().toISOString().split("T")[0],
      dueTime: "18:00",
      estimatedDurationMin: 45,
      tags: ["webdev", "sprint"],
    });

    setTasks((prev) => [newTask, ...prev]);
    setQuickTaskTitle("");
  };

  // Helper to look up the vlog title for a linked task
  const getLinkedVlogTitle = (vlogId?: string | null) => {
    if (!vlogId) return null;
    const found = vlogs.find((v) => v.id === vlogId);
    return found ? found.title : "Building My Portfolio & Office Sprint";
  };

  return (
    <PageContainer>
      {/* Top Workspace Header Banner (Stitch Design) */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container p-6 shadow-xl border border-outline-variant/10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-highest text-secondary font-mono text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Fullstack Track • Next.js &amp; Systems
              </span>
              <span className="font-mono text-xs text-outline flex items-center gap-1">
                <Icon name="terminal" size={14} />
                branch: main@v2.4-beta
              </span>
            </div>
            <h1 className="font-headline text-2xl lg:text-3xl text-on-surface font-bold tracking-tight">
              Web Development Workspace
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Engineering sprint tasks, fullstack architecture projects, GitHub commits, and class scheduling.
            </p>
          </div>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high text-secondary font-mono text-xs shadow-sm border border-outline-variant/15">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-ping" />
              GitHub Sync [Active]
            </div>
            <Button variant="secondary" icon="add_to_photos">
              + New Project
            </Button>
            <Button variant="primary" icon="code">
              + New Dev Task
            </Button>
          </div>
        </div>
      </div>

      {/* Top 5 Telemetry Metric Cards (Stitch Design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Learning Progress */}
        <div className="group relative overflow-hidden rounded-xl bg-surface-container p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container-high border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-outline">Learning Track</span>
            <Icon name="school" size={20} className="text-secondary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-headline text-2xl text-on-surface font-bold">74%</span>
            <span className="font-mono text-xs text-secondary font-semibold">37 / 50</span>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant truncate">Fullstack Web &amp; Systems</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-lowest">
            <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: "74%" }} />
          </div>
        </div>

        {/* Card 2: Current Project */}
        <div className="group relative overflow-hidden rounded-xl bg-surface-container p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container-high border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-outline">Active Sprint</span>
            <Icon name="rocket_launch" size={20} className="text-primary" />
          </div>
          <div className="mt-2">
            <span className="font-headline text-base text-on-surface font-bold truncate block">
              Afaq TaskFlow
            </span>
            <span className="inline-block mt-0.5 font-mono text-xs text-primary">v2.4 Beta • NextAuth</span>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">Core auth tokens &amp; sync</p>
        </div>

        {/* Card 3: Practice Tasks */}
        <div className="group relative overflow-hidden rounded-xl bg-surface-container p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container-high border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-outline">Practice In Flight</span>
            <Icon name="data_object" size={20} className="text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-headline text-2xl text-on-surface font-bold">
              {practiceTasks.length || 5}
            </span>
            <span className="font-mono text-xs text-outline">Algorithms / Ops</span>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant truncate">Trees • Redis • Docker</p>
          <div className="mt-3 flex items-center gap-1">
            <span className="h-1.5 flex-1 rounded-full bg-secondary" />
            <span className="h-1.5 flex-1 rounded-full bg-secondary" />
            <span className="h-1.5 flex-1 rounded-full bg-secondary" />
            <span className="h-1.5 flex-1 rounded-full bg-surface-container-highest" />
            <span className="h-1.5 flex-1 rounded-full bg-surface-container-highest" />
          </div>
        </div>

        {/* Card 4: Upcoming Classes */}
        <div className="group relative overflow-hidden rounded-xl bg-surface-container p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container-high border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-outline">Class Schedule</span>
            <Icon name="event" size={20} className="text-secondary" />
          </div>
          <div className="mt-2">
            <span className="font-headline text-base text-on-surface font-bold">Mon &amp; Tue</span>
            <div className="flex items-center gap-1 text-secondary mt-0.5 font-mono text-xs font-bold">
              <Icon name="schedule" size={14} />
              <span>Today 4:00 PM</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant truncate">Virtual Lab #1 (Next.js 15)</p>
        </div>

        {/* Card 5: Weekly Coding Hours */}
        <div className="group relative overflow-hidden rounded-xl bg-surface-container p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container-high border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-outline">Telemetry</span>
            <Icon name="local_fire_department" size={20} className="text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-headline text-2xl text-on-surface font-bold">24.5h</span>
            <span className="font-mono text-xs text-outline">/ 30h Goal</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-rose-400 font-medium font-mono">🔥 12-day streak</span>
            <span className="font-mono text-outline">VS Code</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-lowest">
            <div
              className="h-full bg-gradient-to-r from-secondary to-primary-container rounded-full transition-all duration-500"
              style={{ width: "81%" }}
            />
          </div>
        </div>
      </div>

      {/* Mandatory Recurring Class Schedule Section (Monday 4 PM – 6 PM & Tuesday 4 PM – 6 PM) */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-high text-secondary border border-outline-variant/15">
              <Icon name="save_as" size={20} />
            </div>
            <div>
              <h2 className="font-headline text-lg text-on-surface font-semibold tracking-tight">
                Recurring Class Schedule (Mon &amp; Tue 4 PM – 6 PM)
              </h2>
              <p className="text-xs text-on-surface-variant">
                Live deep-dives &amp; architecture labs with automated calendar sync • Zero duplicate rows
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-full bg-surface-container text-secondary font-mono text-xs border border-outline-variant/15">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Auto-synced with Calendar view
          </div>
        </div>

        {/* Recurring Class Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RECURRING_CLASSES.map((cls) => (
            <div
              key={cls.id}
              className="relative overflow-hidden rounded-xl bg-surface-container p-5 shadow-md transition-all hover:bg-surface-container-high border border-outline-variant/10"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded font-mono text-xs uppercase font-semibold ${
                        cls.dayOfWeek === "Monday"
                          ? "bg-secondary/15 text-secondary"
                          : "bg-purple-500/15 text-purple-300"
                      }`}
                    >
                      Every {cls.dayOfWeek}
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">{cls.time}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-secondary bg-surface-container-highest px-2.5 py-0.5 rounded-full">
                    <Icon name={cls.dayOfWeek === "Monday" ? "videocam" : "memory"} size={14} />
                    {cls.lab}
                  </span>
                </div>

                <h3 className="font-headline text-base text-on-surface font-semibold">
                  {cls.title}
                </h3>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {cls.topics}
                </p>

                <div className="mt-2 pt-2 border-t border-outline-variant/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cls.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-surface-container-lowest font-mono text-[11px] text-outline"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded bg-secondary text-on-secondary font-mono text-xs font-semibold hover:bg-secondary-fixed transition-all"
                  >
                    <Icon name="open_in_new" size={14} />
                    <span>Join Lab</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Dev Journey ➔ Vlog Bridge Section (RELATIONAL DATABASE REFERENCES) */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-6 shadow-xl border border-outline-variant/15">
        <div className="flex flex-col gap-1 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container text-rose-400 border border-outline-variant/10">
              <Icon name="smart_display" size={22} />
            </div>
            <div>
              <h2 className="font-headline text-lg text-on-surface font-semibold tracking-tight">
                Development Journey • Turn Dev Tasks into Vlog Ideas
              </h2>
              <p className="text-xs text-on-surface-variant">
                Seamlessly link real engineering problems and milestones to personal vlog episodes via database foreign key references.
              </p>
            </div>
          </div>
        </div>

        {/* Bridge Cards Stack */}
        <div className="flex flex-col gap-3">
          {devJourneyVlogTasks.map((devTask, idx) => {
            const vlogTitle = getLinkedVlogTitle(devTask.linkedVlogId);
            return (
              <div
                key={devTask.id}
                className="group flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl bg-surface-container p-4 shadow-sm transition-all hover:bg-surface-container-high border border-outline-variant/10"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-secondary font-mono text-xs font-bold">
                    0{idx + 1}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-headline text-sm font-semibold text-on-surface">
                        {devTask.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono text-[11px] font-medium">
                        {devTask.status === "completed" ? "Code Complete" : "In Progress"}
                      </span>
                      {devTask.linkedVlogId && (
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-mono text-[11px]">
                          Vlog Linked ✓
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-outline">
                      <span className="text-secondary font-medium">
                        git: {devTask.githubBranchOrCommit || "main@feat"}
                      </span>
                      <span>•</span>
                      <span>Next.js Middleware</span>
                      <span>•</span>
                      <span>Production Ready</span>
                    </div>

                    <div className="mt-1 inline-flex items-center gap-1.5 text-on-surface-variant text-xs">
                      <Icon name="movie" size={16} className="text-rose-400" />
                      <span className="text-on-surface font-semibold">Vlog Target:</span>
                      <span className="italic text-purple-300">
                        &quot;{vlogTitle}&quot;
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-mono text-xs transition-all border border-outline-variant/10"
                  >
                    <Icon name="edit_note" size={16} className="text-rose-400" />
                    <span>View Script / Outline</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Projects Section (3 Active Projects from projectService) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-high text-primary border border-outline-variant/15">
              <Icon name="folder_special" size={20} />
            </div>
            <div>
              <h2 className="font-headline text-lg text-on-surface font-semibold tracking-tight">
                Active Engineering Projects
              </h2>
              <p className="text-xs text-on-surface-variant">
                Core systems, production portfolios, and active algorithm repositories
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-outline">
            {projects.length} Projects tracked
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between rounded-xl bg-surface-container p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:bg-surface-container-high border border-outline-variant/10 relative overflow-hidden"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono text-xs font-semibold">
                    {proj.status}
                  </span>
                  <span className="font-mono text-xs text-outline">{proj.deadline}</span>
                </div>

                <h3 className="font-headline text-base text-on-surface font-bold mt-1">
                  {proj.name}
                </h3>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {proj.description}
                </p>

                {/* Progress Bar & Metrics */}
                <div className="mt-2 flex flex-col gap-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface font-medium">{proj.progress}% completed</span>
                    <span className="text-outline">
                      {proj.tasksCompleted || Math.round((proj.progress / 100) * 20)} /{" "}
                      {proj.tasksTotal || 20} tasks
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-lowest">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-xs mt-1">
                  <Icon name="timelapse" size={16} className="text-secondary" />
                  <span>{proj.focusHours || 38.5} hrs logged</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/10 flex flex-wrap gap-1.5">
                {(proj.techStack || ["Next.js", "TypeScript", "TailwindCSS"]).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded bg-surface-container-lowest font-mono text-[11px] text-outline"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Tasks & Engineering Sprint Workboard (Stitch Design) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left 2 Cols: Sprint Task List */}
        <div className="xl:col-span-2 flex flex-col gap-3 rounded-xl bg-surface-container p-5 shadow-md border border-outline-variant/10">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
            <div className="flex items-center gap-2">
              <Icon name="checklist" size={20} className="text-secondary" />
              <h2 className="font-headline text-base text-on-surface font-semibold">
                Today&apos;s Engineering Sprint
              </h2>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              {(["all", "high", "in_progress"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveSprintFilter(filter)}
                  className={`px-2 py-0.5 rounded uppercase ${
                    activeSprintFilter === filter
                      ? "bg-surface-container-highest text-secondary font-bold"
                      : "text-outline hover:text-on-surface"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="flex flex-col gap-2">
            {sprintTasks.map((task) => {
              const isCompleted = task.status === "completed" || task.isCompleted;
              return (
                <div
                  key={task.id}
                  className="group flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-container-high hover:bg-surface-bright transition-all border border-outline-variant/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleToggleTask(task.id, task.status)}
                      className="w-4 h-4 rounded bg-surface-container-lowest text-secondary focus:ring-0 cursor-pointer accent-secondary shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-headline text-sm font-semibold truncate ${
                          isCompleted ? "text-outline line-through" : "text-on-surface"
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-outline mt-0.5">
                        <span
                          className={`flex items-center gap-0.5 ${
                            task.priority === "high" || task.priority === "urgent"
                              ? "text-rose-400"
                              : "text-secondary"
                          }`}
                        >
                          <Icon name="flag" size={12} /> {task.priority} Priority
                        </span>
                        <span>•</span>
                        <span className="text-secondary">{task.dueTime || "Due Today"}</span>
                        <span>•</span>
                        <span>{task.tags[0] || "Architecture"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono text-xs text-on-surface">
                      {task.githubBranchOrCommit || "main@sprint"}
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <Icon name="more_vert" size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add Task Input Affordance */}
          <form
            onSubmit={handleQuickAddTask}
            className="mt-2 flex items-center gap-2 rounded-lg bg-surface-container-lowest px-3 py-2 text-outline border border-outline-variant/10"
          >
            <Icon name="add" size={18} className="text-secondary" />
            <input
              type="text"
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              placeholder="Quick add task to current sprint (e.g. 'Optimize PostgreSQL compound indices #db')"
              className="bg-transparent text-on-surface text-xs placeholder-outline focus:outline-none flex-1 font-mono"
            />
            <kbd className="bg-surface-container px-1.5 py-0.5 rounded font-mono text-[10px] text-on-surface-variant">
              Enter
            </kbd>
          </form>
        </div>

        {/* Right 1 Col: Visual Commits & Architecture Telemetry */}
        <div className="flex flex-col justify-between rounded-xl bg-surface-container p-5 shadow-md border border-outline-variant/10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <Icon name="commit" size={20} className="text-secondary" />
                <h3 className="font-headline text-base text-on-surface font-semibold">
                  Live Git Stream
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary font-mono text-xs">
                afaq/main
              </span>
            </div>

            {/* Inline Commit History Timeline */}
            <div className="flex flex-col gap-3.5 mt-2">
              <div className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-secondary mt-1.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-on-surface font-medium">
                    feat(auth): token rotation logic
                  </span>
                  <span className="text-[11px] text-outline font-mono">
                    18 mins ago • commit 7b42f9a
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-on-surface font-medium">
                    perf(db): add b-tree index on user_id
                  </span>
                  <span className="text-[11px] text-outline font-mono">
                    2 hours ago • commit 4c89d12
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-on-surface font-medium">
                    docs(vlog): outline Episode #43 notes
                  </span>
                  <span className="text-[11px] text-outline font-mono">
                    Yesterday • commit a10ef5e
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Telemetry Sparkline Widget */}
          <div className="mt-4 pt-3 bg-surface-container-high rounded-xl p-3 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-2 font-mono text-xs">
              <span className="uppercase tracking-wider text-outline text-[11px]">
                Daily Commit Rhythm
              </span>
              <span className="text-secondary font-semibold">38 commits this week</span>
            </div>
            <svg className="w-full h-10 text-secondary" fill="none" viewBox="0 0 200 40">
              <path
                d="M0 32 L25 28 L50 35 L75 15 L100 22 L125 8 L150 14 L175 4 L200 12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M0 32 L25 28 L50 35 L75 15 L100 22 L125 8 L150 14 L175 4 L200 12 L200 40 L0 40 Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
            </svg>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
