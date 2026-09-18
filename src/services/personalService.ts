import { Task, TaskPriority, TaskStatus } from "@/types/task";
import {
  VlogPlatform,
  VlogPlatformStatus,
  VlogWorkflowStage,
  DailyChecklistItem,
  PersonalHistoryFilter,
  PersonalKpiMetrics,
} from "@/types/personal";
import {
  DEFAULT_TIMEZONE,
  getDatePartsInTimezone,
  addDaysToDateString,
} from "@/lib/recurrenceEngine";
import { taskService } from "./taskService";

export const CANONICAL_VLOG_PLATFORMS: VlogPlatform[] = [
  "Facebook",
  "YouTube",
  "Instagram",
  "TikTok",
];

export const CANONICAL_VLOG_STAGES: VlogWorkflowStage[] = [
  "RECORD",
  "EDIT",
  "UPLOAD",
];

export const DEFAULT_RECORDING_CHECKLIST: DailyChecklistItem[] = [
  { id: "rc-1", title: "Check camera rig, mic & audio levels", completed: false },
  { id: "rc-2", title: "Record hook & primary talking head story", completed: false },
  { id: "rc-3", title: "Capture situational & workspace B-roll", completed: false },
];

export const DEFAULT_EDITING_CHECKLIST: DailyChecklistItem[] = [
  { id: "ec-1", title: "Rough timeline assembly & cut pacing", completed: false },
  { id: "ec-2", title: "Color grade rec709 & sound design (SFX)", completed: false },
  { id: "ec-3", title: "Generate animated captions & hook subtitles", completed: false },
];

export const DEFAULT_UPLOAD_CHECKLIST: DailyChecklistItem[] = [
  { id: "uc-1", title: "Export 9:16 vertical 4K master", completed: false },
  { id: "uc-2", title: "High-CTR vertical thumbnail concept", completed: false },
  { id: "uc-3", title: "Copy title, description & optimized tags", completed: false },
];

export const personalService = {
  /**
   * Returns canonical platforms for daily short vlog distribution
   */
  getCanonicalPlatforms: (): VlogPlatform[] => [...CANONICAL_VLOG_PLATFORMS],

  /**
   * Returns default checklist items for recording stage
   */
  getDefaultRecordingChecklist: (): DailyChecklistItem[] =>
    DEFAULT_RECORDING_CHECKLIST.map((i) => ({ ...i })),

  /**
   * Returns default checklist items for editing stage
   */
  getDefaultEditingChecklist: (): DailyChecklistItem[] =>
    DEFAULT_EDITING_CHECKLIST.map((i) => ({ ...i })),

  /**
   * Returns default checklist items for upload stage
   */
  getDefaultUploadChecklist: (): DailyChecklistItem[] =>
    DEFAULT_UPLOAD_CHECKLIST.map((i) => ({ ...i })),

  /**
   * Ensures a daily short vlog occurrence exists in the database for target date.
   * Deterministic & non-destructive: Never overwrites yesterday's or past vlogs.
   */
  ensureDailyVlogOccurrence: async (
    targetDateStr?: string,
    timezone: string = DEFAULT_TIMEZONE
  ): Promise<Task> => {
    const todayStr =
      targetDateStr || getDatePartsInTimezone(new Date(), timezone).dateString;

    const allTasks = await taskService.getTasks();

    // Check if an existing vlog task already exists for this exact date
    const existing = allTasks.find(
      (t) =>
        t.workspaceId === "personal" &&
        (t.dueDate === todayStr || t.recurrenceInstanceDate === todayStr)
    );

    if (existing) {
      return existing;
    }

    // Generate deterministic task ID for this date
    const taskId = `task-vlog-${todayStr}`;

    // Default distribution status: all 4 platforms PENDING
    const initialDistribution: Record<string, string> = {
      Facebook: "PENDING",
      YouTube: "PENDING",
      Instagram: "PENDING",
      TikTok: "PENDING",
    };

    const newVlogTask: Task = {
      id: taskId,
      title: "Daily Short Vlog",
      description:
        "Daily short vlog 3-stage pipeline: Record → Edit → Upload across Facebook, YouTube, Instagram & TikTok.",
      workspaceId: "personal",
      status: "todo",
      stage: "RECORD",
      priority: "high", // default configurable priority
      dueDate: todayStr,
      dueTime: "19:30",
      estimatedDurationMin: 60,
      actualDurationMin: 0,
      tags: ["vlog", "personal", "daily-vlog", "short-vlog", "creator"],
      isRecurring: true,
      recurringRuleId: "rec-rule-daily-short-vlog",
      recurrenceInstanceDate: todayStr,
      isCompleted: false,
      createdAt: `${todayStr}T08:00:00.000Z`,
      updatedAt: `${todayStr}T08:00:00.000Z`,
      platforms: ["Facebook", "YouTube", "Instagram", "TikTok"],
      distributionStatus: initialDistribution,
      recordingChecklist: DEFAULT_RECORDING_CHECKLIST.map((i) => ({ ...i })),
      editingChecklist: DEFAULT_EDITING_CHECKLIST.map((i) => ({ ...i })),
      subtasks: [
        {
          id: `sub-${taskId}-1`,
          taskId,
          title: "Record footage",
          completed: false,
        },
        {
          id: `sub-${taskId}-2`,
          taskId,
          title: "Edit video",
          completed: false,
        },
        {
          id: `sub-${taskId}-3`,
          taskId,
          title: "Upload to social platforms",
          completed: false,
        },
      ],
      notes: "",
      activity: [
        {
          id: `act-${Date.now()}`,
          taskId,
          action: "Daily short vlog occurrence generated",
          actor: "Afaq",
          timestamp: "08:00 AM",
        },
      ],
    };

    const added = await taskService.batchAddTasks([newVlogTask]);
    return added[0] || newVlogTask;
  },

  /**
   * Toggle upload status for a specific platform (Facebook, YouTube, Instagram, TikTok)
   * Example:
   * Facebook ✓
   * YouTube ✓
   * Instagram ✓
   * TikTok ✗
   */
  togglePlatformUpload: async (
    taskId: string,
    platform: VlogPlatform
  ): Promise<Task | null> => {
    const task = await taskService.getTaskById(taskId);
    if (!task) return null;

    const currentDist = { ...(task.distributionStatus || {}) };
    const currentStatus = currentDist[platform];

    // Toggle: if currently UPLOADED or VERIFIED, mark PENDING; otherwise mark UPLOADED
    const isCurrentlyUploaded =
      currentStatus === "UPLOADED" ||
      currentStatus === "VERIFIED ✓" ||
      currentStatus?.startsWith("PUBLISHED") ||
      currentStatus === "LIVE";

    const nextStatus: VlogPlatformStatus = isCurrentlyUploaded
      ? "PENDING"
      : "UPLOADED";

    currentDist[platform] = nextStatus;

    // Ensure platforms array includes platform
    const currentPlatforms = task.platforms || [];
    const updatedPlatforms = Array.from(
      new Set([...currentPlatforms, platform])
    ) as VlogPlatform[];

    // Check if all 4 canonical platforms are now uploaded
    const allUploaded = CANONICAL_VLOG_PLATFORMS.every(
      (p) => currentDist[p] === "UPLOADED" || currentDist[p]?.includes("✓")
    );

    const updatePayload: Partial<Task> = {
      platforms: updatedPlatforms,
      distributionStatus: currentDist,
      stage: allUploaded ? "PUBLISHED" : task.stage || "UPLOAD",
      status: allUploaded ? "published" : task.status || "in_progress",
    };

    const updatedTask = await taskService.updateTask(taskId, updatePayload);
    return updatedTask;
  },

  /**
   * Toggle checklist item for recording, editing, or upload stage
   */
  toggleChecklistItem: async (
    taskId: string,
    type: "recording" | "editing" | "upload",
    itemId: string,
    completed: boolean
  ): Promise<Task | null> => {
    const task = await taskService.getTaskById(taskId);
    if (!task) return null;

    let recordingChecklist = task.recordingChecklist || [];
    let editingChecklist = task.editingChecklist || [];

    if (type === "recording") {
      recordingChecklist = recordingChecklist.map((item) =>
        item.id === itemId ? { ...item, completed } : item
      );
    } else if (type === "editing") {
      editingChecklist = editingChecklist.map((item) =>
        item.id === itemId ? { ...item, completed } : item
      );
    }

    const updatePayload: Partial<Task> = {
      recordingChecklist,
      editingChecklist,
    };

    const updated = await taskService.updateTask(taskId, updatePayload);
    return updated;
  },

  /**
   * Update notes specifically for this day's vlog occurrence
   */
  updateVlogNotes: async (
    taskId: string,
    notes: string
  ): Promise<Task | null> => {
    return taskService.updateTask(taskId, { notes });
  },

  /**
   * Update priority for vlog task (configurable by user: high, medium, low, urgent)
   */
  updateVlogPriority: async (
    taskId: string,
    priority: TaskPriority
  ): Promise<Task | null> => {
    return taskService.updateTask(taskId, { priority });
  },

  /**
   * Advance 3-stage workflow: Record → Edit → Upload (→ Published)
   */
  advanceVlogStage: async (taskId: string): Promise<Task | null> => {
    const task = await taskService.getTaskById(taskId);
    if (!task) return null;

    const currentStage = (task.stage || "RECORD").toUpperCase();
    let nextStage: VlogWorkflowStage = "RECORD";
    let nextStatus: TaskStatus = "in_progress";

    if (currentStage === "RECORD" || currentStage === "RECORDING") {
      nextStage = "EDIT";
    } else if (currentStage === "EDIT" || currentStage === "EDITING") {
      nextStage = "UPLOAD";
    } else if (currentStage === "UPLOAD" || currentStage === "READY TO POST") {
      nextStage = "PUBLISHED";
      nextStatus = "published";
    }

    return taskService.updateTask(taskId, {
      stage: nextStage,
      status: nextStatus,
    });
  },

  /**
   * Calculate upload progress summary for a given vlog task
   * e.g. "3 / 4 platforms uploaded"
   */
  getUploadProgressSummary: (
    task?: Task | null
  ): { uploaded: number; total: number; label: string; percentage: number } => {
    const total = CANONICAL_VLOG_PLATFORMS.length;
    if (!task) {
      return { uploaded: 0, total, label: `0 / ${total} platforms uploaded`, percentage: 0 };
    }

    const dist = task.distributionStatus || {};
    let uploaded = 0;

    for (const p of CANONICAL_VLOG_PLATFORMS) {
      const st = dist[p];
      if (
        st === "UPLOADED" ||
        st === "VERIFIED ✓" ||
        st?.startsWith("PUBLISHED") ||
        st === "LIVE"
      ) {
        uploaded++;
      }
    }

    const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;
    const label = `${uploaded} / ${total} platforms uploaded`;

    return { uploaded, total, label, percentage };
  },

  /**
   * Calculate complete Personal KPI metrics for dashboard and personal workspace
   */
  getPersonalKpiMetrics: (
    tasks: Task[],
    todayStr?: string,
    timezone: string = DEFAULT_TIMEZONE
  ): PersonalKpiMetrics => {
    const today =
      todayStr || getDatePartsInTimezone(new Date(), timezone).dateString;

    const personalTasks = tasks.filter((t) => t.workspaceId === "personal");
    const todayVlog =
      personalTasks.find(
        (t) => t.dueDate === today || t.recurrenceInstanceDate === today
      ) || personalTasks[0];

    // Recording Progress
    const recList = todayVlog?.recordingChecklist || [];
    const recCompleted = recList.filter((i) => i.completed).length;
    const recTotal = Math.max(1, recList.length);
    const recPercentage = Math.round((recCompleted / recTotal) * 100);

    // Editing Progress
    const editList = todayVlog?.editingChecklist || [];
    const editCompleted = editList.filter((i) => i.completed).length;
    const editTotal = Math.max(1, editList.length);
    const editPercentage = Math.round((editCompleted / editTotal) * 100);

    // Upload Progress
    const uploadSummary = personalService.getUploadProgressSummary(todayVlog);

    // Platform status map
    const dist = todayVlog?.distributionStatus || {};
    const platformStatus: Record<VlogPlatform, boolean> = {
      Facebook: dist["Facebook"] === "UPLOADED" || dist["Facebook"]?.includes("✓"),
      YouTube:
        dist["YouTube"] === "UPLOADED" ||
        dist["YouTube"]?.includes("✓") ||
        dist["YouTube"]?.startsWith("PUBLISHED"),
      Instagram:
        dist["Instagram"] === "UPLOADED" ||
        dist["Instagram"]?.includes("✓") ||
        dist["Instagram"]?.startsWith("PUBLISHED"),
      TikTok: dist["TikTok"] === "UPLOADED" || dist["TikTok"]?.includes("✓"),
    };

    // Overall historical counts
    const completedVlogs = personalTasks.filter(
      (t) => t.isCompleted || t.status === "completed" || t.status === "published"
    );

    let totalUploadedAcrossAll = 0;
    for (const t of personalTasks) {
      const d = t.distributionStatus || {};
      for (const p of CANONICAL_VLOG_PLATFORMS) {
        if (d[p] === "UPLOADED" || d[p]?.includes("✓")) {
          totalUploadedAcrossAll++;
        }
      }
    }

    return {
      todayVlogTitle: todayVlog?.title || "Daily Short Vlog",
      todayVlogStatus: todayVlog?.status || "todo",
      todayVlogStage: (todayVlog?.stage as VlogWorkflowStage) || "RECORD",
      recordingProgress: {
        completed: recCompleted,
        total: recList.length,
        percentage: recPercentage,
        label: `${recCompleted} of ${recList.length} Captured`,
      },
      editingProgress: {
        completed: editCompleted,
        total: editList.length,
        percentage: editPercentage,
        label: `${editCompleted} of ${editList.length} Cuts Done`,
      },
      uploadProgress: {
        uploaded: uploadSummary.uploaded,
        total: uploadSummary.total,
        percentage: uploadSummary.percentage,
        label: uploadSummary.label,
      },
      platformStatus,
      totalVlogsCompleted: completedVlogs.length,
      totalPlatformsUploaded: totalUploadedAcrossAll,
      creatorStreakDays: Math.max(1, completedVlogs.length),
    };
  },

  /**
   * Filter personal vlog tasks by history range (Today, Yesterday, This Week, This Month, All)
   */
  getTasksByHistoryFilter: (
    tasks: Task[],
    filter: PersonalHistoryFilter = "today",
    timezone: string = DEFAULT_TIMEZONE
  ): Task[] => {
    const todayParts = getDatePartsInTimezone(new Date(), timezone);
    const todayStr = todayParts.dateString;
    const yesterdayStr = addDaysToDateString(todayStr, -1);

    // Week boundaries (Monday to Sunday)
    const currentDow = todayParts.dayOfWeek;
    const daysSinceMonday = currentDow === 0 ? 6 : currentDow - 1;
    const startOfWeekStr = addDaysToDateString(todayStr, -daysSinceMonday);
    const endOfWeekStr = addDaysToDateString(startOfWeekStr, 6);

    const currentMonthPrefix = todayStr.substring(0, 7);

    const personalTasks = tasks.filter((t) => t.workspaceId === "personal");

    return personalTasks.filter((task) => {
      const taskDate =
        task.dueDate ||
        task.recurrenceInstanceDate ||
        (task.createdAt ? task.createdAt.split("T")[0] : todayStr);

      switch (filter) {
        case "today":
          return taskDate === todayStr;
        case "yesterday":
          return taskDate === yesterdayStr;
        case "this_week":
          return taskDate >= startOfWeekStr && taskDate <= endOfWeekStr;
        case "this_month":
          return taskDate.startsWith(currentMonthPrefix);
        case "all":
        default:
          return true;
      }
    });
  },
};
