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
  OfficeHistoryFilter,
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
  const [historyFilter, setHistoryFilter] = useState<OfficeHistoryFilter>("today");

  // Modals & Drawers state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialStage, setQuickAddInitialStage] = useState<OfficeWorkflowStage | undefined>(undefined);

  // Rename Page Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTargetPageId, setRenameTargetPageId] = useState<string>("");
  const [renameInputValue, setRenameInputValue] = useState<string>("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Load live tasks for office workspace and ensure today's occurrences
  const fetchOfficeTasks = useCallback(async () => {
    try {
      // Guarantee today's working-day task occurrences exist in DB with zero duplicates
      await officeService.ensureDailyOccurrencesForOffice();
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
    (async () => {
      try {
        await officeService.ensureDailyOccurrencesForOffice();
        const data = await taskService.getTasks({ workspaceId: "office" });
        if (isMounted) {
          setTasks(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[Office] Initial setup error:", err);
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live dynamic KPI metrics from real task data
  const kpiMetrics = useMemo(() => {
    return officeService.getOfficeKpis(tasks, historyFilter);
  }, [tasks, historyFilter]);

  // Filter tasks based on history range (Today, Yesterday, This Week, This Month)
  const historyScopedTasks = useMemo(() => {
    return officeService.getTasksByHistoryFilter(tasks, historyFilter);
  }, [tasks, historyFilter]);

  // Compute live 8-page status details from real task data
  const pageStatuses = useMemo(() => {
    return officeService.getPageStatuses(undefined, historyScopedTasks);
  }, [historyScopedTasks]);

  // Compute daily checklist status for all 8 pages
  const dailyStatuses = useMemo(() => {
    return officeService.getDailyChecklistOverview(undefined, historyScopedTasks);
  }, [historyScopedTasks]);

  // Filter tasks based on selected page and platform
  const filteredTasks = useMemo(() => {
    return historyScopedTasks.filter((task) => {
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
  }, [historyScopedTasks, selectedPage, selectedPlatform]);

  // Handle stage transition
  const handleAdvanceStage = async (taskId: string, newStage: OfficeWorkflowStage) => {
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
    if (!stepId.startsWith("step-")) {
      await handleToggleSubtask(stepId);
    } else {
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

  // Mark all steps completed for an office page
  const handleMarkPageComplete = async (pageId: string) => {
    const pageTask = tasks.find(
      (t) => (t.officePageId === pageId || t.pageId === pageId) && !t.isCompleted
    );
    if (pageTask) {
      await taskService.updateTaskStage(pageTask.id, "PUBLISHED", "published");
      await fetchOfficeTasks();
    }
  };

  // Rename page handler
  const handleOpenRenameModal = (pageId: string, currentTitle: string) => {
    setRenameTargetPageId(pageId);
    setRenameInputValue(currentTitle);
    setIsRenameModalOpen(true);
  };

  const handleSavePageName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTargetPageId || !renameInputValue.trim()) return;

    setIsRenaming(true);
    try {
      await officeService.updatePageTitle(renameTargetPageId, renameInputValue.trim());
      setIsRenameModalOpen(false);
      await fetchOfficeTasks();
    } catch (err) {
      console.error("[Office] Failed to rename page:", err);
    } finally {
      setIsRenaming(false);
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
        badge="Office Workflow"
        badgeColor="text-blue-400 bg-blue-500/15"
        metaText={`Live DB Sync • ${kpiMetrics.dispatchedPagesCount} / 8 Pages Completed`}
        title="Office Workspace"
        description="Afaq's daily recurring content production, client reels dispatch & multi-channel publishing."
        actions={
          <>
            {/* History Filter Tabs: Today | Yesterday | This Week | This Month */}
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm">
              {[
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "this_week", label: "This Week" },
                { id: "this_month", label: "This Month" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHistoryFilter(tab.id as OfficeHistoryFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    historyFilter === tab.id
                      ? "bg-primary-container text-white shadow-sm font-bold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

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

      {/* 6 KPI Cards Grid (Today's Tasks, Completed Today, Pending Today, Overdue, High Priority, Medium Priority) */}
      <OfficeKpiGrid metrics={kpiMetrics} />

      {/* Page-Wise Daily Completion Matrix (8 Pages with ✓ Completed / ○ Pending and Rename Button) */}
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
        onRenamePage={handleOpenRenameModal}
      />

      {/* Page Filter Bar (All Pages + 8 Channels + Platform Chips) */}
      <OfficePageFilterBar
        selectedPage={selectedPage}
        onSelectPage={setSelectedPage}
        pageStatuses={pageStatuses}
        totalTasksCount={historyScopedTasks.length}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
      />

      {/* Suno Music Specialized 5-Stage Pipeline Spotlight */}
      {(selectedPage === "all" || selectedPage === "suno-music") && (
        <SunoPipelineSpotlight
          tasks={historyScopedTasks}
          onOpenTaskDetail={handleOpenDetail}
          onAdvanceStage={handleAdvanceSunoStage}
        />
      )}

      {/* Main View Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-outline">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
          <span className="text-xs font-mono">Syncing Office tasks from database...</span>
        </div>
      ) : activeWorkflowView === "board" ? (
        <OfficeKanbanBoard
          tasks={filteredTasks}
          onOpenTaskDetail={handleOpenDetail}
          onAdvanceStage={handleAdvanceStage}
          onRetreatStage={handleRetreatStage}
          onQuickAddAtStage={handleQuickAddAtStage}
          onToggleSubtask={handleToggleSubtask}
        />
      ) : activeWorkflowView === "list" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-headline text-base font-bold text-on-surface">
              Office Tasks ({filteredTasks.length})
            </h2>
            <span className="text-xs font-mono text-outline">
              Filtered by: {historyFilter.replace("_", " ").toUpperCase()} • {selectedPage === "all" ? "All Channels" : selectedPage}
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
              <p className="text-sm">No tasks found for this date range and filter.</p>
            </div>
          )}
        </div>
      ) : (
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

      {/* Rename Page Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface-container-high border border-outline-variant/20 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/15 text-primary">
                  <Icon name="edit" size={18} />
                </span>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Rename Client Page
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRenameModalOpen(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg transition-colors"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Update the display name of this page without breaking any historical task records or recurring rules.
            </p>

            <form onSubmit={handleSavePageName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-outline mb-1 font-mono uppercase">
                  Page Name
                </label>
                <input
                  type="text"
                  value={renameInputValue}
                  onChange={(e) => setRenameInputValue(e.target.value)}
                  placeholder="Enter page name..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsRenameModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isRenaming}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onTaskUpdated={fetchOfficeTasks}
      />

      {/* Quick Task Modal */}
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
