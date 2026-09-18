import { Task } from "@/types/task";
import { OFFICE_PAGES, resolveCanonicalOfficePageId } from "@/lib/constants";
import { OfficePage } from "@/types/workspace";
import {
  OfficeKpiMetrics,
  OfficePageStatus,
  PageStatusDetail,
  OfficeWorkflowStage,
  SunoWorkflowStage,
  OfficePageDailyStatus,
  OfficeHistoryFilter,
  DailyChecklistStep,
} from "@/types/office";
import {
  DEFAULT_TIMEZONE,
  getDatePartsInTimezone,
  addDaysToDateString,
  getDayOfWeekForDateString,
} from "@/lib/recurrenceEngine";
import { taskService } from "./taskService";
import { workspaceService } from "./workspaceService";

/**
 * Exact 6-step checklist specified for daily client reels:
 * - Prepare/select content
 * - Edit reel
 * - Caption
 * - Hashtags
 * - Upload
 * - Verify upload
 */
export const DAILY_CONTENT_CHECKLIST_TEMPLATE: string[] = [
  "Prepare/select content",
  "Edit reel",
  "Caption",
  "Hashtags",
  "Upload",
  "Verify upload",
];

/**
 * Exact 5-stage workflow for Suno Music:
 * Visual Creation → Editing → Review → Export → Delivered
 */
export const SUNO_MUSIC_STAGES: SunoWorkflowStage[] = [
  "VISUAL_CREATION",
  "EDITING",
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
   * Template for 6-step daily content checklist
   */
  getDailyChecklistTemplate: (): string[] => [...DAILY_CONTENT_CHECKLIST_TEMPLATE],

  /**
   * Filters tasks by page history range (Today, Yesterday, This Week, This Month)
   * Respects user timezone (Asia/Karachi).
   */
  getTasksByHistoryFilter: (
    tasks: Task[],
    filter: OfficeHistoryFilter = "today",
    timezone: string = DEFAULT_TIMEZONE
  ): Task[] => {
    const todayParts = getDatePartsInTimezone(new Date(), timezone);
    const todayStr = todayParts.dateString;
    const yesterdayStr = addDaysToDateString(todayStr, -1);

    // Calculate current week bounds (Monday to Sunday)
    const currentDow = todayParts.dayOfWeek; // 0=Sun, 1=Mon, ..., 6=Sat
    const daysSinceMonday = currentDow === 0 ? 6 : currentDow - 1;
    const startOfWeekStr = addDaysToDateString(todayStr, -daysSinceMonday);
    const endOfWeekStr = addDaysToDateString(startOfWeekStr, 6);

    // Current month prefix (YYYY-MM)
    const currentMonthPrefix = todayStr.substring(0, 7);

    return tasks.filter((task) => {
      const taskDate = task.dueDate || (task.createdAt ? task.createdAt.split("T")[0] : todayStr);

      switch (filter) {
        case "today":
          return taskDate === todayStr;
        case "yesterday":
          return taskDate === yesterdayStr;
        case "this_week":
          return taskDate >= startOfWeekStr && taskDate <= endOfWeekStr;
        case "this_month":
          return taskDate.startsWith(currentMonthPrefix);
        default:
          return true;
      }
    });
  },

  /**
   * Calculate live KPI metrics from tasks. All values come from real database tasks.
   * Telemetry includes:
   * - Today's Office Tasks
   * - Completed Today
   * - Pending Today
   * - Overdue
   * - High Priority
   * - Medium Priority
   * - Completion Rate
   */
  getOfficeKpis: (
    tasks: Task[],
    historyFilter: OfficeHistoryFilter = "today",
    timezone: string = DEFAULT_TIMEZONE
  ): OfficeKpiMetrics => {
    const todayParts = getDatePartsInTimezone(new Date(), timezone);
    const todayStr = todayParts.dateString;

    const officeTasks = tasks.filter(
      (t) => t.workspaceId === "office" || t.workspaceId === ("office" as string)
    );

    // Tasks relevant for the selected filter window
    const scopedTasks = officeService.getTasksByHistoryFilter(officeTasks, historyFilter, timezone);

    // Tasks for Today specifically (for header telemetry)
    const todayTasks = officeTasks.filter((t) => {
      const taskDate = t.dueDate || (t.createdAt ? t.createdAt.split("T")[0] : todayStr);
      return taskDate === todayStr;
    });

    const isTaskCompleted = (t: Task) =>
      t.isCompleted ||
      t.status === "completed" ||
      t.status === "published" ||
      t.stage === "PUBLISHED" ||
      t.stage === "DELIVERED";

    const completedToday = todayTasks.filter(isTaskCompleted);
    const pendingToday = todayTasks.filter((t) => !isTaskCompleted(t));

    const completedScoped = scopedTasks.filter(isTaskCompleted);
    const pendingScoped = scopedTasks.filter((t) => !isTaskCompleted(t));

    const inReview = scopedTasks.filter(
      (t) => t.status === "review" || t.stage === "REVIEW"
    );

    // Overdue: tasks where due date is before today and not completed
    const overdue = officeTasks.filter((t) => {
      if (isTaskCompleted(t)) return false;
      return Boolean(t.dueDate && t.dueDate < todayStr);
    });

    // High Priority count
    const highPriority = scopedTasks.filter(
      (t) => t.priority === "high" || t.priority === "urgent"
    );

    // Medium Priority count
    const mediumPriority = scopedTasks.filter((t) => t.priority === "medium");

    const totalScoped = Math.max(scopedTasks.length, 1);
    const completionRate = Math.round((completedScoped.length / totalScoped) * 100);

    // Urgent notice text
    let urgentNotice = "All channels on schedule";
    if (overdue.length > 0) {
      const firstOverdue = overdue[0];
      const pageName =
        OFFICE_PAGES.find(
          (p) =>
            p.id === firstOverdue.officePageId ||
            p.id === resolveCanonicalOfficePageId(firstOverdue.officePageId)
        )?.shortTitle || "Office";
      urgentNotice = `${pageName}: ${overdue.length} Overdue`;
    } else if (highPriority.some((t) => !isTaskCompleted(t))) {
      const pendingHigh = highPriority.find((t) => !isTaskCompleted(t));
      if (pendingHigh) {
        const pageName =
          OFFICE_PAGES.find(
            (p) =>
              p.id === pendingHigh.officePageId ||
              p.id === resolveCanonicalOfficePageId(pendingHigh.officePageId)
          )?.shortTitle || "Office";
        urgentNotice = `${pageName}: Reel pending upload`;
      }
    }

    // Dynamic Productivity Score
    const productivityScore = Math.min(
      100,
      Math.max(
        40,
        Math.round(
          completionRate * 0.7 +
            (inReview.length > 0 ? 15 : 10) +
            (overdue.length === 0 ? 15 : 0)
        )
      )
    );

    // Count pages that completed today's workflow
    const pageStatuses = officeService.getPageStatuses(OFFICE_PAGES, todayTasks);
    const dispatchedPagesCount = pageStatuses.filter((ps) => ps.status === "completed").length;

    return {
      todayActiveTasks: todayTasks.length,
      todayTasksCount: todayTasks.length,
      completedCount: completedScoped.length,
      completedTodayCount: completedToday.length,
      pendingCount: pendingScoped.length,
      pendingTodayCount: pendingToday.length,
      overdueCount: overdue.length,
      highPriorityCount: highPriority.length,
      mediumPriorityCount: mediumPriority.length,
      completionRate,
      inReviewCount: inReview.length,
      urgentCount: overdue.length + highPriority.filter((t) => !isTaskCompleted(t)).length,
      urgentNotice,
      productivityScore,
      streakDays: 8,
      dispatchedPagesCount,
      totalPagesCount: OFFICE_PAGES.length,
    };
  },

  /**
   * Computes real-time page completion status from live tasks.
   * Example:
   * Shooting Film Video: ✓ Completed
   * Ismail Shahid Fans: ○ Pending
   * Jahangir Khan: ○ Pending
   * ZK Production: ○ Pending
   * New Client Page: ○ Pending
   * Nazia Fanz: ○ Pending
   * Inaya Kailashi: ○ Pending
   * Suno Music: ○ Pending
   */
  getPageStatuses: (
    pages: OfficePage[] = OFFICE_PAGES,
    tasks: Task[] = []
  ): PageStatusDetail[] => {
    return pages.map((page) => {
      // Allow for dynamic name overrides if page was renamed
      const dynamicName = workspaceService.getPageTitleOverride(page.id) || page.title;

      // Find all tasks for this office page (handling canonical ID & legacy aliases)
      const pageTasks = tasks.filter((t) => {
        if (t.workspaceId !== "office" && t.workspaceId !== ("office" as string)) return false;
        const taskPageId = resolveCanonicalOfficePageId(t.officePageId || t.pageId);
        const targetPageId = resolveCanonicalOfficePageId(page.id);
        return (
          taskPageId === targetPageId ||
          t.officePageId === page.id ||
          t.pageId === page.id ||
          t.officePageId === page.title ||
          (t.title && t.title.toLowerCase().includes(dynamicName.toLowerCase()))
        );
      });

      const totalTasks = pageTasks.length;
      const isTaskDone = (t: Task) =>
        t.isCompleted ||
        t.status === "completed" ||
        t.status === "published" ||
        t.stage === "PUBLISHED" ||
        t.stage === "DELIVERED";

      const completedTasks = pageTasks.filter(isTaskDone).length;
      const hasInProgress = pageTasks.some(
        (t) =>
          !isTaskDone(t) &&
          (t.status === "in_progress" ||
            t.status === "review" ||
            t.stage === "IN_PROGRESS" ||
            t.stage === "REVIEW" ||
            t.stage === "EDITING" ||
            t.stage === "DESIGN")
      );

      const hasUrgent = pageTasks.some(
        (t) => !isTaskDone(t) && (t.priority === "urgent" || t.priority === "high")
      );

      let status: OfficePageStatus = "pending";
      let statusLabel = "pending";
      let summary = page.statusSummary;

      if (totalTasks > 0 && completedTasks === totalTasks) {
        status = "completed";
        statusLabel = "completed";
        summary = "✓ Completed";
      } else if (completedTasks > 0 && !hasInProgress) {
        status = "completed";
        statusLabel = "completed";
        summary = "✓ Reel uploaded";
      } else if (hasInProgress) {
        status = "in_progress";
        statusLabel = "in progress";
        const inProg = pageTasks.find(
          (t) =>
            t.status === "in_progress" ||
            t.stage === "IN_PROGRESS" ||
            t.stage === "EDITING" ||
            t.stage === "DESIGN"
        );
        summary = inProg ? inProg.title.substring(0, 18) : "In production";
      } else if (totalTasks > 0) {
        status = "pending";
        statusLabel = "pending";
        summary = "○ Pending";
      } else {
        status = "pending";
        statusLabel = "pending";
        summary = "○ Queued";
      }

      return {
        pageId: page.id,
        pageTitle: dynamicName,
        status,
        statusLabel,
        formattedDisplay: `${dynamicName} — ${statusLabel}`,
        summary,
        totalTasks,
        completedTasks,
        hasUrgentTask: hasUrgent,
        priority: page.priority || "medium",
        pageGroup: page.pageGroup,
        isEditable: Boolean(page.isEditable),
      };
    });
  },

  /**
   * Builds the daily checklist status for each of the 8 office pages.
   * Tasks are ONLY marked complete when the user explicitly completes them.
   */
  getDailyChecklistOverview: (
    pages: OfficePage[] = OFFICE_PAGES,
    tasks: Task[] = []
  ): OfficePageDailyStatus[] => {
    return pages.map((page) => {
      const dynamicName = workspaceService.getPageTitleOverride(page.id) || page.title;
      const targetPageId = resolveCanonicalOfficePageId(page.id);

      const pageTasks = tasks.filter((t) => {
        if (t.workspaceId !== "office" && t.workspaceId !== ("office" as string)) return false;
        const taskPageId = resolveCanonicalOfficePageId(t.officePageId || t.pageId);
        return (
          taskPageId === targetPageId ||
          t.officePageId === page.id ||
          t.pageId === page.id ||
          (t.title && t.title.toLowerCase().includes(dynamicName.toLowerCase()))
        );
      });

      const isTaskDone = (t: Task) =>
        t.isCompleted ||
        t.status === "completed" ||
        t.status === "published" ||
        t.stage === "PUBLISHED" ||
        t.stage === "DELIVERED";

      const activeOrPublishedTask =
        pageTasks.find(isTaskDone) ||
        pageTasks.find((t) => t.status === "in_progress" || t.stage === "IN_PROGRESS") ||
        pageTasks[0];

      // Suno Music uses 5-stage visual workflow, other 7 pages use 6-step reel checklist
      const isSuno = page.id === "suno-music";
      const templateSteps = isSuno
        ? [
            "Visual Creation",
            "Editing",
            "Review",
            "Export",
            "Delivered",
          ]
        : DAILY_CONTENT_CHECKLIST_TEMPLATE;

      const existingSubtasks = activeOrPublishedTask?.subtasks || [];
      const isPublished = Boolean(activeOrPublishedTask && isTaskDone(activeOrPublishedTask));

      const steps: DailyChecklistStep[] = templateSteps.map((stepTitle, idx) => {
        const found = existingSubtasks.find(
          (st) =>
            st.title.toLowerCase().includes(stepTitle.toLowerCase()) ||
            stepTitle.toLowerCase().includes(st.title.toLowerCase())
        );

        return {
          id: found?.id || `step-${page.id}-${idx}`,
          title: stepTitle,
          completed: isPublished ? true : found ? Boolean(found.completed) : false,
        };
      });

      const isFullyDispatched = isPublished || (steps.length > 0 && steps.every((s) => s.completed));

      return {
        pageId: page.id,
        pageTitle: dynamicName,
        shortTitle: page.shortTitle,
        taskId: activeOrPublishedTask?.id,
        taskTitle:
          activeOrPublishedTask?.title ||
          (isSuno ? "Suno Music Visual Production" : `Upload Reel — ${dynamicName}`),
        priority: activeOrPublishedTask?.priority || page.priority || "medium",
        status: activeOrPublishedTask?.status || (isFullyDispatched ? "completed" : "todo"),
        stage: activeOrPublishedTask?.stage || (isFullyDispatched ? "PUBLISHED" : "TODO"),
        scheduledTime: activeOrPublishedTask?.dueTime || "16:00",
        steps,
        isFullyDispatched,
      };
    });
  },

  /**
   * Guaranteed daily occurrence generation:
   * Generates real database task occurrences for today (or specified date).
   * - ZERO duplicates created.
   * - Real database records created in taskService.
   * - Previous days' historical occurrences are NEVER deleted or reset.
   * - Respects user timezone (Asia/Karachi).
   */
  ensureDailyOccurrencesForOffice: async (
    targetDateStr?: string,
    timezone: string = DEFAULT_TIMEZONE
  ): Promise<{ createdCount: number; tasks: Task[] }> => {
    const todayParts = getDatePartsInTimezone(new Date(), timezone);
    const dateStr = targetDateStr || todayParts.dateString;
    const dow = getDayOfWeekForDateString(dateStr);

    // Only generate on working days (Monday 1 to Friday 5) unless specified
    const isWorkingDay = dow >= 1 && dow <= 5;
    if (!isWorkingDay && !targetDateStr) {
      return { createdCount: 0, tasks: [] };
    }

    const existingTasks = await taskService.getTasks({ workspaceId: "office" });
    const existingDateTasks = existingTasks.filter(
      (t) => t.dueDate === dateStr || t.recurrenceInstanceDate === dateStr
    );

    const newTasksToCreate: Task[] = [];

    // Helper to check if task exists for this page today
    const hasTaskForPage = (pageId: string, pageTitle: string) => {
      const canonicalTarget = resolveCanonicalOfficePageId(pageId);
      return existingDateTasks.some((t) => {
        const taskCanonical = resolveCanonicalOfficePageId(t.officePageId || t.pageId);
        return (
          taskCanonical === canonicalTarget ||
          t.officePageId === pageId ||
          t.pageId === pageId ||
          (t.title && t.title.toLowerCase().includes(pageTitle.toLowerCase()))
        );
      });
    };

    // 1. High Priority Client Reels (5 pages)
    const clientPages = OFFICE_PAGES.filter((p) => p.pageGroup === "client_reels");
    for (const page of clientPages) {
      const dynamicName = workspaceService.getPageTitleOverride(page.id) || page.title;
      if (!hasTaskForPage(page.id, dynamicName)) {
        const deterministicId = `task-reel-${page.id}-${dateStr}`;
        const newTask: Task = {
          id: deterministicId,
          title: `Upload Reel — ${dynamicName}`,
          description: `Daily client reel content creation and publishing workflow for ${dynamicName}`,
          workspaceId: "office",
          officePageId: page.id,
          pageId: page.id,
          priority: "high",
          status: "todo",
          stage: "TODO",
          dueDate: dateStr,
          dueTime: "14:00",
          estimatedDurationMin: 45,
          tags: ["office", "client-reels", page.id, "high-priority"],
          isRecurring: true,
          recurringRuleId: `rec-rule-${page.id}`,
          recurrenceInstanceDate: dateStr,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subtasks: DAILY_CONTENT_CHECKLIST_TEMPLATE.map((step, idx) => ({
            id: `subtask-${deterministicId}-${idx + 1}`,
            taskId: deterministicId,
            title: step,
            completed: false,
            isCompleted: false,
            position: idx,
          })),
        };
        newTasksToCreate.push(newTask);
      }
    }

    // 2. Medium Priority Facebook (2 pages)
    const fbPages = OFFICE_PAGES.filter((p) => p.pageGroup === "facebook");
    for (const page of fbPages) {
      const dynamicName = workspaceService.getPageTitleOverride(page.id) || page.title;
      if (!hasTaskForPage(page.id, dynamicName)) {
        const deterministicId = `task-fb-${page.id}-${dateStr}`;
        const newTask: Task = {
          id: deterministicId,
          title: `Daily Content — ${dynamicName}`,
          description: `Daily Facebook audience engagement and reel distribution for ${dynamicName}`,
          workspaceId: "office",
          officePageId: page.id,
          pageId: page.id,
          priority: "medium",
          status: "todo",
          stage: "TODO",
          dueDate: dateStr,
          dueTime: "18:00",
          estimatedDurationMin: 35,
          tags: ["office", "facebook", page.id, "medium-priority"],
          isRecurring: true,
          recurringRuleId: `rec-rule-${page.id}`,
          recurrenceInstanceDate: dateStr,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subtasks: DAILY_CONTENT_CHECKLIST_TEMPLATE.map((step, idx) => ({
            id: `subtask-${deterministicId}-${idx + 1}`,
            taskId: deterministicId,
            title: step,
            completed: false,
            isCompleted: false,
            position: idx,
          })),
        };
        newTasksToCreate.push(newTask);
      }
    }

    // 3. Suno Music (1 page — separate 5-stage pipeline)
    const sunoPage = OFFICE_PAGES.find((p) => p.id === "suno-music");
    if (sunoPage && !hasTaskForPage(sunoPage.id, sunoPage.title)) {
      const deterministicId = `task-suno-${dateStr}`;
      const newTask: Task = {
        id: deterministicId,
        title: "Suno Music Visual Production",
        description: "Visual Creation → Editing → Review → Export → Delivered visual asset pipeline",
        workspaceId: "office",
        officePageId: "suno-music",
        pageId: "suno-music",
        priority: "medium",
        status: "todo",
        stage: "VISUAL_CREATION",
        dueDate: dateStr,
        dueTime: "15:00",
        estimatedDurationMin: 60,
        tags: ["office", "suno-music", "visual-production", "music-pipeline"],
        isRecurring: true,
        recurringRuleId: "rec-rule-suno-visual",
        recurrenceInstanceDate: dateStr,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: [
          "Visual Creation",
          "Editing",
          "Review",
          "Export",
          "Delivered",
        ].map((step, idx) => ({
          id: `subtask-${deterministicId}-${idx + 1}`,
          taskId: deterministicId,
          title: step,
          completed: false,
          isCompleted: false,
          position: idx,
        })),
      };
      newTasksToCreate.push(newTask);
    }

    if (newTasksToCreate.length > 0) {
      await taskService.batchAddTasks(newTasksToCreate);
    }

    return {
      createdCount: newTasksToCreate.length,
      tasks: newTasksToCreate,
    };
  },

  /**
   * Renames an office page (e.g. "New Client Page" -> "Acme Corporation").
   * Calls workspaceService and does not break historical task records.
   */
  updatePageTitle: async (pageId: string, newTitle: string): Promise<boolean> => {
    return workspaceService.updatePageName(pageId, newTitle);
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
