import { TaskPriority } from "./task";
import { WorkspaceType, OfficePageId } from "./workspace";

export type RecurrenceType =
  | "EVERY_DAY"
  | "WEEKDAYS"
  | "SPECIFIC_WEEKDAYS"
  | "WEEKLY"
  | "MONTHLY"
  | "CUSTOM_INTERVAL";

export type RecurringRuleStatus = "ACTIVE" | "PAUSED" | "EXPIRED";

export type TemplateId =
  | "OFFICE_DAILY_CONTENT"
  | "SUNO_MUSIC_VISUAL"
  | "PERSONAL_VLOG"
  | "COLLEGE_STUDY"
  | "WEB_DEV_PRACTICE"
  | "CUSTOM";

export interface RecurringTaskTemplate {
  id: TemplateId;
  name: string;
  description: string;
  workspaceId: WorkspaceType;
  officePageId?: OfficePageId;
  priority: TaskPriority;
  dueTime: string; // e.g. "13:15"
  estimatedDurationMin: number;
  recurrenceType: RecurrenceType;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  checklist: string[];
  tags: string[];
}

export interface RecurringRule {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  templateId?: TemplateId;
  workspaceId: WorkspaceType;
  officePageId?: OfficePageId;
  pageId?: string | null;
  projectId?: string | null;
  priority: TaskPriority;
  dueTime: string; // e.g. "13:15"
  estimatedDurationMin: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD (null = indefinite)
  recurrenceType: RecurrenceType;
  interval: number; // e.g. 1 for daily/weekly, or N for custom interval
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  dayOfMonth?: number; // 1-31 for monthly recurrence
  status: RecurringRuleStatus;
  checklist: string[]; // Subtask titles to auto-generate
  tags: string[];
  lastGeneratedDate?: string | null; // YYYY-MM-DD
  nextOccurrence: string; // ISO 8601 string (e.g. 2026-09-17T13:15:00.000Z)
  timezone: string; // e.g. "Asia/Karachi"
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringRuleInput {
  title: string;
  description?: string;
  templateId?: TemplateId;
  workspaceId: WorkspaceType;
  officePageId?: OfficePageId;
  pageId?: string | null;
  projectId?: string | null;
  priority?: TaskPriority;
  dueTime: string;
  estimatedDurationMin?: number;
  startDate?: string;
  endDate?: string | null;
  recurrenceType: RecurrenceType;
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  checklist?: string[];
  tags?: string[];
  timezone?: string;
}

export interface UpdateRecurringRuleInput {
  title?: string;
  description?: string;
  templateId?: TemplateId;
  workspaceId?: WorkspaceType;
  officePageId?: OfficePageId;
  pageId?: string | null;
  projectId?: string | null;
  priority?: TaskPriority;
  dueTime?: string;
  estimatedDurationMin?: number;
  startDate?: string;
  endDate?: string | null;
  recurrenceType?: RecurrenceType;
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  status?: RecurringRuleStatus;
  checklist?: string[];
  tags?: string[];
  timezone?: string;
}

export type RecurringFilterTab = "all" | "active" | "paused" | "upcoming" | "expired";
