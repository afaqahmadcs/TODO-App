import { TaskPriority, TaskStatus } from "./task";

export type VlogPlatform = "Facebook" | "YouTube" | "Instagram" | "TikTok";

export type VlogPlatformStatus = "UPLOADED" | "PENDING";

export type VlogWorkflowStage = "RECORD" | "EDIT" | "UPLOAD" | "PUBLISHED";

export interface DailyChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export type PersonalHistoryFilter = "today" | "yesterday" | "this_week" | "this_month" | "all";

export interface PersonalVlogDetail {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  priority: TaskPriority;
  scheduledTime: string; // HH:MM (e.g. "19:30")
  stage: VlogWorkflowStage;
  status: TaskStatus;
  platforms: Record<VlogPlatform, VlogPlatformStatus>;
  recordingChecklist: DailyChecklistItem[];
  editingChecklist: DailyChecklistItem[];
  uploadChecklist: DailyChecklistItem[];
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface PersonalKpiMetrics {
  todayVlogTitle: string;
  todayVlogStatus: TaskStatus;
  todayVlogStage: VlogWorkflowStage;
  recordingProgress: {
    completed: number;
    total: number;
    percentage: number;
    label: string;
  };
  editingProgress: {
    completed: number;
    total: number;
    percentage: number;
    label: string;
  };
  uploadProgress: {
    uploaded: number;
    total: number;
    percentage: number;
    label: string; // e.g. "3 / 4 platforms uploaded"
  };
  platformStatus: Record<VlogPlatform, boolean>;
  totalVlogsCompleted: number;
  totalPlatformsUploaded: number;
  creatorStreakDays: number;
}
