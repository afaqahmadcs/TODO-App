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
  | "BRIEF"
  | "ASSETS"
  | "DESIGN"
  | "REVIEW"
  | "EXPORT"
  | "DELIVERED";

export type OfficePageStatus = "completed" | "in_progress" | "pending" | "idle";

export interface PageStatusDetail {
  pageId: OfficePageId;
  pageTitle: string;
  status: OfficePageStatus;
  statusLabel: string; // e.g. "completed", "in progress", "pending"
  formattedDisplay: string; // e.g. "Shooting Page — completed"
  summary: string; // e.g. "Reel uploaded", "Color grade in prog"
  totalTasks: number;
  completedTasks: number;
  hasUrgentTask: boolean;
}

export interface OfficeKpiMetrics {
  todayActiveTasks: number;
  completedCount: number;
  completionRate: number; // 0 to 100
  pendingCount: number;
  inReviewCount: number;
  overdueCount: number;
  urgentCount: number;
  urgentNotice?: string;
  productivityScore: number; // 0 to 100
  streakDays: number;
  dispatchedPagesCount: number; // e.g. 4
  totalPagesCount: number; // 8
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
