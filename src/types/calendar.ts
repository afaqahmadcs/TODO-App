import { Task, TaskPriority } from "./task";
import { WorkspaceType } from "./workspace";

export type CalendarViewType = "month" | "week" | "day";

export type CalendarFilterType =
  | "all"
  | "office"
  | "personal"
  | "college"
  | "web-development"
  | "projects"
  | "recurring";

export type CalendarEventSource =
  | "task"
  | "recurring"
  | "college_class"
  | "web_class"
  | "deadline"
  | "project";

export interface UnifiedCalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  durationMin: number;
  workspaceId: WorkspaceType;
  sourceType: CalendarEventSource;
  priority: TaskPriority;
  status: string;
  location?: string;
  subtasksCount?: number;
  subtasksCompleted?: number;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurringRuleId?: string | null;
  rawTask?: Task;
}

export interface DayTimeSlot {
  hour: number;
  timeLabel: string;
  time24: string;
}

export interface DraggedCalendarEvent {
  eventId: string;
  originalDate: string;
  originalTime: string;
  sourceType: CalendarEventSource;
  taskId?: string;
}
