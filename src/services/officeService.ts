import { Task } from "@/types/task";
import { OFFICE_PAGES } from "@/lib/constants";
import { OfficePage } from "@/types/workspace";
import {
  OfficeKpiMetrics,
  OfficePageStatus,
  PageStatusDetail,
  OfficeWorkflowStage,
  SunoWorkflowStage,
  OfficePageDailyStatus,
} from "@/types/office";

export const DAILY_CONTENT_CHECKLIST_TEMPLATE: string[] = [
  "Check new content",
  "Select content",
  "Edit",
  "Caption",
  "Hashtags",
  "Upload",
  "Verify published",
];

export const SUNO_MUSIC_STAGES: SunoWorkflowStage[] = [
  "BRIEF",
  "ASSETS",
  "DESIGN",
  "REVIEW",
  "EXPORT",
  "DELIVERED",
];

export const OFFICE_WORKFLOW_STAGES: OfficeWorkflowStage[] = [
  "IDEAS",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "READY",
  "PUBLISHED",
];

export const officeService = {
  /**
   * Template for standard 7-step daily content checklist
   */
  getDailyChecklistTemplate: (): string[] => [...DAILY_CONTENT_CHECKLIST_TEMPLATE],

  /**
   * Calculate live KPI metrics from tasks
   */
  getOfficeKpis: (tasks: Task[]): OfficeKpiMetrics => {
    const todayStr = new Date().toISOString().split("T")[0];
    const officeTasks = tasks.filter(
      (t) => t.workspaceId === "office" || t.workspaceId === ("office" as string)
    );

    // Filter tasks due today or created today or active
    const todayTasks = officeTasks.filter(
      (t) => !t.dueDate || t.dueDate === todayStr || t.isCompleted
    );

    const completed = officeTasks.filter(
      (t) => t.isCompleted || t.status === "completed" || t.status === "published" || t.stage === "PUBLISHED" || t.stage === "DELIVERED"
    );

    const pending = officeTasks.filter(
      (t) => !t.isCompleted && t.status !== "completed" && t.status !== "published" && t.stage !== "PUBLISHED" && t.stage !== "DELIVERED"
    );

    const inReview = officeTasks.filter(
      (t) => t.status === "review" || t.stage === "REVIEW"
    );

    const overdue = officeTasks.filter((t) => {
      if (t.isCompleted || t.status === "completed") return false;
      return Boolean(t.dueDate && t.dueDate < todayStr);
    });

    const urgent = officeTasks.filter(
      (t) => !t.isCompleted && (t.priority === "urgent" || (t.priority === "high" && t.dueDate && t.dueDate <= todayStr))
    );

    const totalTracked = Math.max(officeTasks.length, 1);
    const completionRate = Math.round((completed.length / totalTracked) * 100);

    // Identify urgent notice text
    let urgentNotice = "All channels on schedule";
    if (urgent.length > 0) {
      const highestUrgent = urgent[0];
      const pageName = OFFICE_PAGES.find((p) => p.id === highestUrgent.officePageId)?.shortTitle || "Office";
      urgentNotice = `${pageName}: ${highestUrgent.title.substring(0, 24)}...`;
    } else if (overdue.length > 0) {
      const firstOverdue = overdue[0];
      const pageName = OFFICE_PAGES.find((p) => p.id === firstOverdue.officePageId)?.shortTitle || "Office";
      urgentNotice = `${pageName}: Past due`;
    }

    // Dynamic Productivity Score calculation (weighted completion + review rate)
    const productivityScore = Math.min(
      100,
      Math.max(45, Math.round(completionRate * 0.7 + (inReview.length > 0 ? 15 : 10) + (overdue.length === 0 ? 15 : 0)))
    );

    // Compute dispatched pages count (pages that have completed today's workflow)
    const pageStatuses = officeService.getPageStatuses(OFFICE_PAGES, officeTasks);
    const dispatchedCount = pageStatuses.filter((ps) => ps.status === "completed").length;

    return {
      todayActiveTasks: todayTasks.length > 0 ? todayTasks.length : officeTasks.length,
      completedCount: completed.length,
      completionRate,
      pendingCount: pending.length,
      inReviewCount: inReview.length,
      overdueCount: overdue.length,
      urgentCount: urgent.length > 0 ? urgent.length : overdue.length,
      urgentNotice,
      productivityScore,
      streakDays: 8,
      dispatchedPagesCount: dispatchedCount,
      totalPagesCount: OFFICE_PAGES.length,
    };
  },

  /**
   * Computes real-time page completion status strings from live tasks.
   * e.g.:
   * Shooting Page — completed
   * Ismail Shahid Fans — completed
   * ZK Production — in progress
   * Jahangir Khan — pending
   */
  getPageStatuses: (
    pages: OfficePage[] = OFFICE_PAGES,
    tasks: Task[] = []
  ): PageStatusDetail[] => {
    return pages.map((page) => {
      // Find all tasks for this office page
      const pageTasks = tasks.filter(
        (t) => (t.workspaceId === "office" || t.workspaceId === ("office" as string)) &&
               (t.officePageId === page.id || t.pageId === page.id)
      );

      const totalTasks = pageTasks.length;
      const completedTasks = pageTasks.filter(
        (t) => t.isCompleted || t.status === "completed" || t.status === "published" || t.stage === "PUBLISHED" || t.stage === "DELIVERED"
      ).length;

      const hasInProgress = pageTasks.some(
        (t) => !t.isCompleted && (t.status === "in_progress" || t.status === "review" || t.stage === "IN_PROGRESS" || t.stage === "REVIEW" || t.stage === "DESIGN")
      );

      const hasUrgent = pageTasks.some(
        (t) => !t.isCompleted && (t.priority === "urgent" || t.priority === "high")
      );

      let status: OfficePageStatus = "pending";
      let statusLabel = "pending";
      let summary = page.statusSummary;

      if (totalTasks > 0 && completedTasks === totalTasks) {
        status = "completed";
        statusLabel = "completed";
        summary = "Dispatch complete";
      } else if (completedTasks > 0 && !hasInProgress && pageTasks.some((t) => t.stage === "PUBLISHED" || t.stage === "DELIVERED")) {
        status = "completed";
        statusLabel = "completed";
        summary = "Published today";
      } else if (hasInProgress) {
        status = "in_progress";
        statusLabel = "in progress";
        const inProgTask = pageTasks.find((t) => t.status === "in_progress" || t.stage === "IN_PROGRESS" || t.stage === "DESIGN");
        summary = inProgTask ? inProgTask.title.substring(0, 20) : "In production";
      } else if (totalTasks > 0) {
        status = "pending";
        statusLabel = "pending";
        const firstTask = pageTasks[0];
        summary = firstTask.dueTime ? `Today ${firstTask.dueTime}` : "Queued";
      } else {
        // Fallback default based on constants
        if (page.isCompletedToday) {
          status = "completed";
          statusLabel = "completed";
        } else {
          status = "pending";
          statusLabel = "pending";
        }
      }

      return {
        pageId: page.id,
        pageTitle: page.title,
        status,
        statusLabel,
        formattedDisplay: `${page.title} — ${statusLabel}`,
        summary,
        totalTasks,
        completedTasks,
        hasUrgentTask: hasUrgent,
      };
    });
  },

  /**
   * Builds the detailed 7-step checklist status for each of the 8 office pages.
   */
  getDailyChecklistOverview: (
    pages: OfficePage[] = OFFICE_PAGES,
    tasks: Task[] = []
  ): OfficePageDailyStatus[] => {
    return pages.map((page) => {
      // Find the main task for this page for today
      const pageTasks = tasks.filter(
        (t) => (t.workspaceId === "office" || t.workspaceId === ("office" as string)) &&
               (t.officePageId === page.id || t.pageId === page.id)
      );

      const activeOrPublishedTask =
        pageTasks.find((t) => t.stage === "PUBLISHED" || t.stage === "DELIVERED") ||
        pageTasks.find((t) => t.status === "in_progress" || t.stage === "IN_PROGRESS") ||
        pageTasks[0];

      // If task has subtasks, map them to the 7 steps
      const existingSubtasks = activeOrPublishedTask?.subtasks || [];
      const steps = DAILY_CONTENT_CHECKLIST_TEMPLATE.map((stepTitle, idx) => {
        const found = existingSubtasks.find(
          (st) => st.title.toLowerCase().includes(stepTitle.toLowerCase()) ||
                  stepTitle.toLowerCase().includes(st.title.toLowerCase())
        );

        // If the task is already published, all steps are completed
        const isPublished = activeOrPublishedTask?.stage === "PUBLISHED" || activeOrPublishedTask?.isCompleted;

        return {
          id: found?.id || `step-${page.id}-${idx}`,
          title: stepTitle,
          completed: isPublished ? true : (found ? found.completed : (idx < 2 && page.isCompletedToday)),
        };
      });

      const isFullyDispatched = steps.every((s) => s.completed) || activeOrPublishedTask?.stage === "PUBLISHED" || page.isCompletedToday;

      return {
        pageId: page.id,
        pageTitle: page.title,
        shortTitle: page.shortTitle,
        taskId: activeOrPublishedTask?.id,
        taskTitle: activeOrPublishedTask?.title || `${page.title} daily content post`,
        priority: activeOrPublishedTask?.priority || "medium",
        status: activeOrPublishedTask?.status || (isFullyDispatched ? "published" : "todo"),
        stage: activeOrPublishedTask?.stage || (isFullyDispatched ? "PUBLISHED" : "TODO"),
        scheduledTime: activeOrPublishedTask?.dueTime || "16:00",
        steps,
        isFullyDispatched,
      };
    });
  },

  /**
   * Advance generic office workflow stage
   */
  advanceStage: (stage: OfficeWorkflowStage): OfficeWorkflowStage => {
    const idx = OFFICE_WORKFLOW_STAGES.indexOf(stage);
    if (idx >= 0 && idx < OFFICE_WORKFLOW_STAGES.length - 1) {
      return OFFICE_WORKFLOW_STAGES[idx + 1];
    }
    return stage;
  },

  /**
   * Move generic office workflow stage backward
   */
  retreatStage: (stage: OfficeWorkflowStage): OfficeWorkflowStage => {
    const idx = OFFICE_WORKFLOW_STAGES.indexOf(stage);
    if (idx > 0) {
      return OFFICE_WORKFLOW_STAGES[idx - 1];
    }
    return stage;
  },

  /**
   * Advance Suno Music workflow stage
   */
  advanceSunoStage: (stage: SunoWorkflowStage): SunoWorkflowStage => {
    const idx = SUNO_MUSIC_STAGES.indexOf(stage);
    if (idx >= 0 && idx < SUNO_MUSIC_STAGES.length - 1) {
      return SUNO_MUSIC_STAGES[idx + 1];
    }
    return stage;
  },

  /**
   * Move Suno Music workflow stage backward
   */
  retreatSunoStage: (stage: SunoWorkflowStage): SunoWorkflowStage => {
    const idx = SUNO_MUSIC_STAGES.indexOf(stage);
    if (idx > 0) {
      return SUNO_MUSIC_STAGES[idx - 1];
    }
    return stage;
  },
};
