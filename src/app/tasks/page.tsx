"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { QuickTaskModal } from "@/components/tasks/QuickTaskModal";
import { EmptyState } from "@/components/common/EmptyState";
import { taskService } from "@/services/taskService";
import { Task, TaskFilterTab, TaskSortOption, TaskStatus, TaskPriority } from "@/types/task";
import { WorkspaceType, OfficePageId, OfficePage } from "@/types/workspace";
import { WORKSPACES, OFFICE_PAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active View and Tab
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [activeTab, setActiveTab] = useState<TaskFilterTab>("today");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType | "all">("all");
  const [selectedOfficePage, setSelectedOfficePage] = useState<OfficePageId | "all">("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Sorting
  const [sortBy, setSortBy] = useState<TaskSortOption>("due_time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Task Detail Drawer state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Quick Task Creation Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Inline Quick Add state
  const [inlineTaskTitle, setInlineTaskTitle] = useState("");
  const [inlineWorkspace, setInlineWorkspace] = useState<WorkspaceType>("office");
  const [inlinePriority, setInlinePriority] = useState<TaskPriority>("medium");
  const [isInlineAdding, setIsInlineAdding] = useState(false);

  // Reusable refresh callback
  const refreshTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await taskService.getTasks({
        tab: activeTab,
        workspaceId: selectedWorkspace,
        officePageId: selectedOfficePage,
        priority: selectedPriority,
        status: selectedStatus,
        tags: selectedTag !== "all" ? [selectedTag] : undefined,
        searchQuery,
        sortBy,
        sortOrder,
      });
      setTasks(data);
    } catch (err) {
      console.error("[MyTasksPage] Failed to load tasks:", err);
      setErrorMessage("Unable to sync tasks with Supabase. Displaying cached state.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedWorkspace, selectedOfficePage, selectedPriority, selectedStatus, selectedTag, searchQuery, sortBy, sortOrder]);

  // Load tasks on filter changes
  useEffect(() => {
    let isCancelled = false;

    taskService.getTasks({
      tab: activeTab,
      workspaceId: selectedWorkspace,
      officePageId: selectedOfficePage,
      priority: selectedPriority,
      status: selectedStatus,
      tags: selectedTag !== "all" ? [selectedTag] : undefined,
      searchQuery,
      sortBy,
      sortOrder,
    })
      .then((data) => {
        if (!isCancelled) {
          setTasks(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("[MyTasksPage] Failed to load tasks:", err);
          setErrorMessage("Unable to sync tasks with Supabase. Displaying cached state.");
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    activeTab,
    selectedWorkspace,
    selectedOfficePage,
    selectedPriority,
    selectedStatus,
    selectedTag,
    searchQuery,
    sortBy,
    sortOrder,
  ]);

  // Global keyboard shortcut ('n' for new task)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if ((e.key === "n" || e.key === "N") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute live tab counts
  const [allTasksForCounts, setAllTasksForCounts] = useState<Task[]>([]);
  useEffect(() => {
    taskService.getTasks().then(setAllTasksForCounts);
  }, [tasks]);

  const tabCounts = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return {
      all: allTasksForCounts.length,
      today: allTasksForCounts.filter((t) => t.dueDate === todayStr).length,
      upcoming: allTasksForCounts.filter(
        (t) => t.dueDate && t.dueDate > todayStr && !t.isCompleted
      ).length,
      overdue: allTasksForCounts.filter(
        (t) => t.dueDate && t.dueDate < todayStr && !t.isCompleted
      ).length,
      completed: allTasksForCounts.filter(
        (t) => t.isCompleted || t.status === "completed" || t.status === "done"
      ).length,
    };
  }, [allTasksForCounts]);

  // Extract all distinct tags from tasks for filter dropdown
  const allAvailableTags = useMemo(() => {
    const set = new Set<string>();
    allTasksForCounts.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [allTasksForCounts]);

  // Handle task completion toggle with optimistic UI
  const handleToggleComplete = async (taskId: string) => {
    // Optimistic update
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

    try {
      const updated = await taskService.toggleTaskCompletion(taskId);
      if (updated) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        if (selectedTask?.id === taskId) setSelectedTask(updated);
      }
    } catch (err) {
      console.error("Toggle complete failed:", err);
      setErrorMessage("Failed to update task completion in database.");
      refreshTasks(); // Rollback
    }
  };

  // Handle status change from UI
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const isComp = newStatus === "completed" || newStatus === "done";
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            isCompleted: isComp,
            completedAt: isComp ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );

    try {
      const updated = await taskService.updateTaskStatus(taskId, newStatus);
      if (updated) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        if (selectedTask?.id === taskId) setSelectedTask(updated);
      }
    } catch (err) {
      console.error("Status update failed:", err);
      setErrorMessage("Failed to update status in database.");
      refreshTasks();
    }
  };

  // Handle clicking a task to open detail drawer
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  // Handle task updated from drawer
  const handleTaskUpdatedFromDrawer = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  // Handle task deleted from drawer
  const handleTaskDeletedFromDrawer = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
    setIsDrawerOpen(false);
  };

  // Handle inline quick add form submit
  const handleInlineQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTaskTitle.trim()) return;

    setIsInlineAdding(true);
    try {
      const created = await taskService.createTask({
        title: inlineTaskTitle.trim(),
        workspaceId: inlineWorkspace,
        priority: inlinePriority,
        dueDate: new Date().toISOString().split("T")[0],
        dueTime: "17:00",
        estimatedDurationMin: 30,
        tags: ["today"],
      });

      if (created) {
        setTasks((prev) => [created, ...prev]);
        setInlineTaskTitle("");
      }
    } catch (err) {
      console.error("Inline task add failed:", err);
      setErrorMessage("Failed to save quick task.");
    } finally {
      setIsInlineAdding(false);
    }
  };

  // Grouped tasks for List view (matching Stitch layout: Overdue, Afternoon, Evening, Completed)
  const groupedTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const overdue = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && !t.isCompleted);
    const completed = tasks.filter((t) => t.isCompleted || t.status === "completed");
    const todayRemaining = tasks.filter(
      (t) => !t.isCompleted && t.status !== "completed" && (!t.dueDate || t.dueDate >= todayStr)
    );

    const afternoon = todayRemaining.filter((t) => {
      if (!t.dueTime) return true;
      const hour = parseInt(t.dueTime.split(":")[0], 10);
      return hour < 17;
    });

    const evening = todayRemaining.filter((t) => {
      if (!t.dueTime) return false;
      const hour = parseInt(t.dueTime.split(":")[0], 10);
      return hour >= 17;
    });

    return { overdue, afternoon, evening, completed };
  }, [tasks]);

  // Board columns for Kanban view
  const boardColumns: { id: TaskStatus; label: string; color: string }[] = [
    { id: "todo", label: "TODO", color: "border-slate-500" },
    { id: "in_progress", label: "IN PROGRESS", color: "border-amber-500" },
    { id: "review", label: "REVIEW", color: "border-purple-500" },
    { id: "ready", label: "READY", color: "border-cyan-500" },
    { id: "completed", label: "COMPLETED", color: "border-emerald-500" },
  ];

  return (
    <PageContainer>
      {/* Error state notification banner */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="warning" size={16} />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={refreshTasks}
            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded text-[11px] font-medium"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* 1. Workspace Header & Control Bar (Stitch fidelity) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
              My Tasks
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high font-mono text-xs text-primary font-semibold">
              {tasks.length} tasks
            </span>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant">
            Manage everything you need to get done today and this week with live Supabase persistence.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-space-sm">
          {/* View Switcher: List vs Board */}
          <div className="flex items-center p-1 rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === "list"
                  ? "bg-surface-container-highest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
              title="List View"
            >
              <Icon name="view_list" size={16} />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === "board"
                  ? "bg-surface-container-highest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
              title="Kanban Board"
            >
              <Icon name="view_kanban" size={16} />
              <span>Board</span>
            </button>
          </div>

          {/* Quick Hotkey Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant text-xs border border-outline-variant/15">
            <span>Press</span>
            <kbd className="font-mono px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-bold border border-outline-variant/20">
              N
            </kbd>
            <span>new</span>
          </div>

          {/* Primary CTA Button */}
          <Button
            variant="primary"
            icon="add"
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-[0_2px_12px_rgba(79,70,229,0.35)]"
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* 2. Segmented Status Tabs & Search Filter */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md pb-space-md">
        {/* Segmented Task Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "all"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            )}
          >
            <span>All</span>
            <span className="font-mono text-[11px] opacity-80">{tabCounts.all}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "today"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            )}
          >
            <span>Today</span>
            <span className="px-1.5 py-0.2 rounded-full bg-on-primary/20 font-mono text-[11px]">
              {tabCounts.today}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "upcoming"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            )}
          >
            <span>Upcoming</span>
            <span className="font-mono text-[11px] opacity-80">{tabCounts.upcoming}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overdue")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "overdue"
                ? "bg-error text-on-error shadow-sm"
                : "bg-error-container/30 text-error hover:bg-error-container/50"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            <span>Overdue</span>
            <span className="px-1.5 py-0.2 rounded-full bg-error/20 font-mono text-[11px]">
              {tabCounts.overdue}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "completed"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            )}
          >
            <span>Completed</span>
            <span className="font-mono text-[11px] opacity-80">{tabCounts.completed}</span>
          </button>
        </div>

        {/* Task List Search Input */}
        <div className="relative w-full lg:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tasks by keyword or tag..."
            className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-xs pl-9 pr-8 py-2 rounded-xl border border-outline-variant/20 focus:outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary/40 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Secondary Filter & Sorting Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-space-sm p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/20 mb-space-md text-on-surface-variant text-xs">
        <div className="flex items-center flex-wrap gap-2">
          {/* Workspace Filter */}
          <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/15">
            <Icon name="workspaces" size={14} />
            <select
              value={selectedWorkspace}
              onChange={(e) => {
                setSelectedWorkspace(e.target.value as WorkspaceType | "all");
                if (e.target.value !== "office") setSelectedOfficePage("all");
              }}
              className="bg-transparent text-on-surface text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Workspaces (4)</option>
              {WORKSPACES.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
          </div>

          {/* Office Page Filter (conditional) */}
          {selectedWorkspace === "office" && (
            <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/15">
              <Icon name="layers" size={14} />
              <select
                value={selectedOfficePage}
                onChange={(e) => setSelectedOfficePage(e.target.value as OfficePageId | "all")}
                className="bg-transparent text-on-surface text-xs focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="all">All Office Pages</option>
                {OFFICE_PAGES.map((p: OfficePage) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/15">
            <Icon name="flag" size={14} />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-on-surface text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/15">
            <Icon name="sync_alt" size={14} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-on-surface text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="todo">TODO</option>
              <option value="in_progress">IN_PROGRESS</option>
              <option value="review">REVIEW</option>
              <option value="ready">READY</option>
              <option value="completed">COMPLETED</option>
            </select>
          </div>

          {/* Tag Filter */}
          {allAvailableTags.length > 0 && (
            <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/15">
              <Icon name="sell" size={14} />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-transparent text-on-surface text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">Tags (All)</option>
                {allAvailableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/15">
            <Icon name="sort" size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TaskSortOption)}
              className="bg-transparent text-on-surface text-xs focus:outline-none cursor-pointer"
            >
              <option value="due_time">Sort: Due Time</option>
              <option value="priority">Sort: Priority</option>
              <option value="created_date">Sort: Created Date</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
            title={`Sort order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            <Icon name={sortOrder === "asc" ? "arrow_upward" : "arrow_downward"} size={14} />
          </button>
        </div>
      </div>

      {/* 4. Quick Add Task Inline Bar (Stitch design) */}
      <div className="p-space-sm rounded-xl bg-surface-container border border-outline-variant/15 mb-space-lg shadow-sm">
        <form onSubmit={handleInlineQuickAdd} className="flex flex-col gap-2">
          <div className="flex items-center gap-space-sm px-space-sm py-1">
            <span className="text-primary text-[20px]">
              <Icon name="add_circle" size={20} />
            </span>
            <input
              type="text"
              value={inlineTaskTitle}
              onChange={(e) => setInlineTaskTitle(e.target.value)}
              placeholder={`+ Add a task to '${activeTab.toUpperCase()}'...`}
              className="bg-transparent text-on-surface placeholder:text-outline text-sm w-full focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1 px-space-sm flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Inline workspace selector */}
              <select
                value={inlineWorkspace}
                onChange={(e) => setInlineWorkspace(e.target.value as WorkspaceType)}
                className="px-2 py-1 rounded bg-surface-container-high text-on-surface border border-outline-variant/20 text-xs focus:outline-none cursor-pointer"
              >
                {WORKSPACES.map((w) => (
                  <option key={w.id} value={w.id}>
                    @{w.title}
                  </option>
                ))}
              </select>

              {/* Inline priority selector */}
              <select
                value={inlinePriority}
                onChange={(e) => setInlinePriority(e.target.value as TaskPriority)}
                className="px-2 py-1 rounded bg-surface-container-high text-on-surface border border-outline-variant/20 text-xs focus:outline-none cursor-pointer uppercase font-mono"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <span className="px-2 py-1 rounded bg-surface-container-high text-secondary text-xs flex items-center gap-1">
                <Icon name="today" size={13} /> Due Today
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-outline text-xs">
                Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[10px]">Enter</kbd> to save
              </span>
              <button
                type="submit"
                disabled={isInlineAdding || !inlineTaskTitle.trim()}
                className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:brightness-110 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 5. Main Workspace Layout (Tasks Stream + Task Detail Drawer) */}
      <div className="flex flex-col xl:flex-row items-start gap-space-lg w-full">
        {/* Left Column: Task Stream / Board View */}
        <div className="flex-1 flex flex-col gap-space-xl w-full min-w-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-outline gap-3">
              <Icon name="progress_activity" size={28} className="animate-spin text-primary" />
              <span className="text-xs font-mono">Synchronizing tasks with Supabase...</span>
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon="task_alt"
              badge="Inbox Zero"
              title="No tasks match the active filters"
              description="Everything is completed or no action items fit your filter criteria. Create a new task or reset filters."
              primaryActionLabel="+ Add Task"
              onPrimaryAction={() => setIsCreateModalOpen(true)}
              secondaryActionLabel="Reset Filters"
              onSecondaryAction={() => {
                setSelectedWorkspace("all");
                setSelectedPriority("all");
                setSelectedStatus("all");
                setSelectedTag("all");
                setSearchQuery("");
                setActiveTab("all");
              }}
            />
          ) : viewMode === "board" ? (
            /* Kanban Board Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4 items-start w-full">
              {boardColumns.map((col) => {
                const colTasks = tasks.filter((t) => {
                  const s = t.status === "done" ? "completed" : t.status;
                  return s === col.id;
                });
                return (
                  <div
                    key={col.id}
                    className="flex flex-col gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/15 min-h-[400px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15 px-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full border-2", col.color)} />
                        <span className="font-bold text-xs uppercase tracking-wider text-on-surface">
                          {col.label}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[11px] text-outline">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="flex flex-col gap-3">
                      {colTasks.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          isSelected={selectedTask?.id === t.id}
                          onClick={handleTaskClick}
                          onToggleComplete={handleToggleComplete}
                          onStatusChange={handleStatusChange}
                          layoutMode="card"
                        />
                      ))}
                      {colTasks.length === 0 && (
                        <div className="p-6 text-center text-outline text-xs font-mono border border-dashed border-outline-variant/20 rounded-xl">
                          Empty stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List Mode (Grouped Streams matching Stitch design) */
            <div className="flex flex-col gap-6 w-full">
              {/* GROUP 1: OVERDUE (if any exist) */}
              {groupedTasks.overdue.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-error">
                        <Icon name="warning" size={18} />
                      </span>
                      <span className="font-bold text-xs text-error uppercase tracking-wider">
                        Overdue
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-error-container/40 text-error font-mono text-[11px]">
                        {groupedTasks.overdue.length} task
                        {groupedTasks.overdue.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {groupedTasks.overdue.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        isSelected={selectedTask?.id === t.id}
                        onClick={handleTaskClick}
                        onToggleComplete={handleToggleComplete}
                        onStatusChange={handleStatusChange}
                        layoutMode="row"
                        className="bg-error-container/10 border-error/20 hover:bg-error-container/20"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* GROUP 2: TODAY — AFTERNOON */}
              {groupedTasks.afternoon.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-secondary">
                        <Icon name="light_mode" size={18} />
                      </span>
                      <span className="font-bold text-xs text-on-surface uppercase tracking-wider">
                        Today — Daytime
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[11px]">
                        {groupedTasks.afternoon.length} tasks
                      </span>
                    </div>
                    <span className="text-outline text-xs">Priority Focus</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {groupedTasks.afternoon.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        isSelected={selectedTask?.id === t.id}
                        onClick={handleTaskClick}
                        onToggleComplete={handleToggleComplete}
                        onStatusChange={handleStatusChange}
                        layoutMode="row"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* GROUP 3: TODAY — EVENING */}
              {groupedTasks.evening.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">
                        <Icon name="dark_mode" size={18} />
                      </span>
                      <span className="font-bold text-xs text-on-surface uppercase tracking-wider">
                        Today — Evening & Night
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[11px]">
                        {groupedTasks.evening.length} tasks
                      </span>
                    </div>
                    <span className="text-outline text-xs">05:00 PM – 11:00 PM</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {groupedTasks.evening.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        isSelected={selectedTask?.id === t.id}
                        onClick={handleTaskClick}
                        onToggleComplete={handleToggleComplete}
                        onStatusChange={handleStatusChange}
                        layoutMode="row"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* GROUP 4: COMPLETED */}
              {groupedTasks.completed.length > 0 && (
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-2 px-1 text-outline">
                    <Icon name="check_circle" size={16} />
                    <span className="font-bold text-xs uppercase tracking-wider">
                      Completed ({groupedTasks.completed.length} tasks)
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 opacity-75">
                    {groupedTasks.completed.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        isSelected={selectedTask?.id === t.id}
                        onClick={handleTaskClick}
                        onToggleComplete={handleToggleComplete}
                        onStatusChange={handleStatusChange}
                        layoutMode="row"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Stitch Task Detail Drawer */}
        {isDrawerOpen && selectedTask && (
          <TaskDetailDrawer
            task={selectedTask}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onTaskUpdated={handleTaskUpdatedFromDrawer}
            onTaskDeleted={handleTaskDeletedFromDrawer}
          />
        )}
      </div>

      {/* Quick Task Full Creation Modal */}
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
