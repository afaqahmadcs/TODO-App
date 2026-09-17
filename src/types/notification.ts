export type NotificationType = "reminder" | "deadline" | "system" | "streak";

export interface NotificationItem {
  id: string;
  userId: string;
  taskId?: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledFor?: string;
  read: boolean;
  createdAt: string;
  workspaceId?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}

export type FocusPreset = "pomodoro_25_5" | "deep_work_50_10" | "custom";

export interface FocusSessionState {
  taskId?: string;
  taskTitle: string;
  workspaceId?: string;
  preset: FocusPreset;
  durationMinutes: number;
  breakMinutes: number;
  remainingSeconds: number;
  isRunning: boolean;
  isBreak: boolean;
  startedAt: string;
}
