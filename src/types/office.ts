import { OfficePageId } from "./workspace";
import { TaskPriority, TaskStatus } from "./task";

export type OfficeWorkflowStage =
  | "IDEAS"
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "READY"
  | "PUBLISHED";

export type SunoWorkflowStage =
  | "VISUAL_CREATION"
  | "EDITING"
  | "REVIEW"
  | "EXPORT"
  | "DELIVERED"
  | "BRIEF"
  | "ASSETS"
  | "DESIGN";

export type OfficeHistoryFilter = "today" | "yesterday" | "this_week" | "this_month";

export type OfficePageGroup = "client_reels" | "facebook" | "music";

export type OfficePageStatus = "completed" | "in_progress" | "pending" | "idle";

export interface PageStatusDetail {
  pageId: OfficePageId;
  pageTitle: string;
  status: OfficePageStatus;
  statusLabel: string; // e.g. "completed", "pending"
  formattedDisplay: string; // e.g. "Shooting Film Video — completed"
  summary: string;
  totalTasks: number;
  completedTasks: number;
  hasUrgentTask: boolean;
  priority?: "high" | "medium";
  pageGroup?: OfficePageGroup;
  isEditable?: boolean;
}

export interface OfficeKpiMetrics {
  todayActiveTasks: number;
  todayTasksCount: number;
  completedCount: number;
  completedTodayCount: number;
  pendingCount: number;
  pendingTodayCount: number;
  overdueCount: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  completionRate: number; // 0 to 100
  inReviewCount: number;
  urgentCount: number;
  urgentNotice?: string;
  productivityScore: number; // 0 to 100
  streakDays: number;
  dispatchedPagesCount: number;
  totalPagesCount: number;
}

export type OfficePlatform = "all" | "reels" | "tiktok" | "shorts";

export interface DailyChecklistStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface OfficePageDailyStatus {
  pageId: OfficePageId;
  pageTitle: string;
  shortTitle: string;
  taskId?: string;
  taskTitle?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  stage: OfficeWorkflowStage | SunoWorkflowStage | string;
  scheduledTime?: string;
  steps: DailyChecklistStep[];
  isFullyDispatched: boolean;
}
