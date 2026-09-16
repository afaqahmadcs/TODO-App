"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Task, TaskStatus } from "@/types/task";
import { taskService } from "@/services/taskService";
import { officeService } from "@/services/officeService";
import { OfficePageId } from "@/types/workspace";
import {
  OfficeWorkflowStage,
  SunoWorkflowStage,
  OfficePlatform,
} from "@/types/office";
import { OfficeKpiGrid } from "@/components/office/OfficeKpiGrid";
import { DailyPublishingMatrix } from "@/components/office/DailyPublishingMatrix";
import { OfficePageFilterBar } from "@/components/office/OfficePageFilterBar";
import { SunoPipelineSpotlight } from "@/components/office/SunoPipelineSpotlight";
import { OfficeKanbanBoard } from "@/components/office/OfficeKanbanBoard";
import { DailyContentChecklist } from "@/components/office/DailyContentChecklist";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { QuickTaskModal } from "@/components/tasks/QuickTaskModal";

type ActiveViewMode = "board" | "list" | "checklist";

export default function OfficeWorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [activeWorkflowView, setActiveWorkflowView] = useState<ActiveViewMode>("board");
  const [selectedPlatform, setSelectedPlatform] = useState<OfficePlatform>("all");

  // Modals & Drawers state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialStage, setQuickAddInitialStage] = useState<OfficeWorkflowStage | undefined>(undefined);

  // Load live tasks for office workspace
  const fetchOfficeTasks = useCallback(async () => {
    try {
      const data = await taskService.getTasks({ workspaceId: "office" });
      setTasks(data);
    } catch (err) {
      console.error("[Office] Failed to fetch tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    taskService
      .getTasks({ workspaceId: "office" })
      .then((data) => {
        if (isMounted) {
          setTasks(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("[Office] Initial fetch error:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live dynamic KPI metrics from real task data
  const kpiMetrics = useMemo(() => {
    return officeService.getOfficeKpis(tasks);
  }, [tasks]);

  // Compute live 8-page status details from real task data
  const pageStatuses = useMemo(() => {
    return officeService.getPageStatuses(undefined, tasks);
  }, [tasks]);

  // Compute daily 7-step checklist status for all 8 pages
  const dailyStatuses = useMemo(() => {
    return officeService.getDailyChecklistOverview(undefined, tasks);
  }, [tasks]);

  // Filter tasks based on selected page and platform
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Office page filter
      if (selectedPage !== "all") {
        const matchesPage =
          task.officePageId === selectedPage || task.pageId === selectedPage;
        if (!matchesPage) return false;
      }

      // Platform filter
      if (selectedPlatform !== "all") {
        const matchesPlatform = task.tags.some(
          (tag) => tag.toLowerCase() === selectedPlatform.toLowerCase()
        );
        if (!matchesPlatform) return false;
      }

      return true;
    });
  }, [tasks, selectedPage, selectedPlatform]);

  // Handle stage transition
  const handleAdvanceStage = async (taskId: string, newStage: OfficeWorkflowStage) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, stage: newStage } : t))
    );

    try {
      await taskService.updateTaskStage(taskId, newStage);
      await fetchOfficeTasks();
    } catch (err) {
      console.error("[Office] Failed to advance stage:", err);
    }
  };

  const handleRetreatStage = async (taskId: string, newStage: OfficeWorkflowStage) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, stage: newStage } : t))
    );

    try {
      await taskService.updateTaskStage(taskId, newStage);
      await fetchOfficeTasks();
    } catch (err) {
      console.error("[Office] Failed to retreat stage:", err);
    }
  };

  // Advance Suno Music stage
  const handleAdvanceSunoStage = async (task: Task, nextStage: SunoWorkflowStage) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, stage: nextStage } : t))
    );

    try {
      await taskService.updateTaskStage(task.id, nextStage);
      await fetchOfficeTasks();
    } catch (err) {
      console.error("[Office] Failed to advance Suno stage:", err);
    }
  };

  // Toggle subtask
  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await taskService.toggleSubtask(subtaskId);
      await fetchOfficeTasks();
    } catch (err) {
      console.error("[Office] Failed to toggle subtask:", err);
    }
  };

  // Daily checklist toggle step
  const handleToggleDailyChecklistStep = async (
    pageId: string,
    stepId: string,
    completed: boolean
  ) => {
    // If stepId is an actual subtask, update it in taskService
    if (!stepId.startsWith("step-")) {
      await handleToggleSubtask(stepId);
    } else {
      // Find the page task and toggle/advance
      const pageTask = tasks.find(
        (t) => t.officePageId === pageId || t.pageId === pageId
      );
      if (pageTask) {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === pageTask.id && t.subtasks) {
              return {
                ...t,
                subtasks: t.subtasks.map((st) =>
                  st.id === stepId ? { ...st, completed } : st
                ),
              };
            }
            return t;
          })
        );
      }
    }
  };

  // Mark all 7 steps completed for an office page
  const handleMarkPageComplete = async (pageId: string) => {
    const pageTask = tasks.find(
      (t) => (t.officePageId === pageId || t.pageId === pageId) && !t.isCompleted
    );
    if (pageTask) {
      await taskService.updateTaskStage(pageTask.id, "PUBLISHED", "published");
      await fetchOfficeTasks();
    }
  };

  // Open detail modal for a task
  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  // Open quick add preset to an office stage
  const handleQuickAddAtStage = (stage: OfficeWorkflowStage) => {
    setQuickAddInitialStage(stage);
    setIsQuickAddOpen(true);
  };

  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        badge="Production Engine"
        badgeColor="text-blue-400 bg-blue-500/15"
        metaText={`Live DB Sync • ${kpiMetrics.dispatchedPagesCount} / 8 Channels Dispatched Today`}
        title="Office Workspace"
        description="Daily social-media content production & multi-channel campaign publishing pipeline."
        actions={
          <>
            {/* View Switcher: Board, List, Daily Checklist */}
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveWorkflowView("board")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeWorkflowView === "board"
                    ? "bg-primary-container text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                <Icon name="view_kanban" size={16} />
                <span>Board</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkflowView("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeWorkflowView === "list"
                    ? "bg-primary-container text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                <Icon name="format_list_bulleted" size={16} />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkflowView("checklist")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeWorkflowView === "checklist"
                    ? "bg-primary-container text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                <Icon name="checklist" size={16} />
                <span>Daily Checklist</span>
              </button>
            </div>

            <Button
              variant="primary"
              icon="add_circle"
              onClick={() => {
                setQuickAddInitialStage(undefined);
                setIsQuickAddOpen(true);
              }}
            >
              New Content Task
            </Button>
          </>
        }
      />

      {/* 5 KPI Summary Cards Grid (Computed from Live Database Data) */}
      <OfficeKpiGrid metrics={kpiMetrics} />

      {/* Daily Publishing Matrix (8 Pages Status Strip) */}
      <DailyPublishingMatrix
        pageStatuses={pageStatuses}
        selectedPage={selectedPage}
        onSelectPage={(pageId) =>
          setSelectedPage(selectedPage === pageId ? "all" : pageId)
        }
        dispatchedCount={kpiMetrics.dispatchedPagesCount}
        totalCount={kpiMetrics.totalPagesCount}
        isChecklistViewActive={activeWorkflowView === "checklist"}
        onToggleChecklistView={() =>
          setActiveWorkflowView(activeWorkflowView === "checklist" ? "board" : "checklist")
        }
      />

      {/* Page Horizontal Filter Bar (All Pages + 8 Channels + Platform Chips) */}
      <OfficePageFilterBar
        selectedPage={selectedPage}
        onSelectPage={setSelectedPage}
        pageStatuses={pageStatuses}
        totalTasksCount={tasks.length}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
      />

      {/* Suno Music Specialized Pipeline Spotlight (Shown for All or Suno page) */}
      {(selectedPage === "all" || selectedPage === "suno-music") && (
        <SunoPipelineSpotlight
          tasks={tasks}
          onOpenTaskDetail={handleOpenDetail}
          onAdvanceStage={handleAdvanceSunoStage}
        />
      )}

      {/* Main View Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-outline">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
          <span className="text-xs font-mono">Syncing Office tasks from Supabase...</span>
        </div>
      ) : activeWorkflowView === "board" ? (
        /* 6-Stage Content Production Kanban Board */
        <OfficeKanbanBoard
          tasks={filteredTasks}
          onOpenTaskDetail={handleOpenDetail}
          onAdvanceStage={handleAdvanceStage}
          onRetreatStage={handleRetreatStage}
          onQuickAddAtStage={handleQuickAddAtStage}
          onToggleSubtask={handleToggleSubtask}
        />
      ) : activeWorkflowView === "list" ? (
        /* Categorized List View */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-headline text-base font-bold text-on-surface">
              Office Tasks List ({filteredTasks.length})
            </h2>
            <span className="text-xs font-mono text-outline">
              Showing {selectedPage === "all" ? "all 8 channels" : selectedPage}
            </span>
          </div>

          {filteredTasks.length > 0 ? (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  layoutMode="row"
                  onClick={handleOpenDetail}
                  onToggleComplete={async (id) => {
                    await taskService.toggleTaskCompletion(id);
                    await fetchOfficeTasks();
                  }}
                  onStatusChange={async (id, status: TaskStatus) => {
                    await taskService.updateTaskStatus(id, status);
                    await fetchOfficeTasks();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/20 text-center text-outline">
              <Icon name="task" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks found for this filter combination.</p>
            </div>
          )}
        </div>
      ) : (
        /* 7-Step Daily Content Checklist View */
        <DailyContentChecklist
          dailyStatuses={dailyStatuses}
          onToggleStep={handleToggleDailyChecklistStep}
          onMarkPageComplete={handleMarkPageComplete}
          onOpenTaskDetail={(taskId) => {
            const t = tasks.find((item) => item.id === taskId);
            if (t) handleOpenDetail(t);
          }}
        />
      )}

      {/* Task Detail Drawer (Reused Generic Component from Phase 4) */}
      <TaskDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onTaskUpdated={fetchOfficeTasks}
      />

      {/* Quick Task Modal (Preset to Office Workspace and Selected Page) */}
      <QuickTaskModal
        key={`office-modal-${isQuickAddOpen}-${selectedPage}-${quickAddInitialStage || "none"}`}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onTaskCreated={fetchOfficeTasks}
        defaultWorkspace="office"
        defaultPage={selectedPage !== "all" ? (selectedPage as OfficePageId) : undefined}
        defaultStage={quickAddInitialStage}
      />
    </PageContainer>
  );
}
