import { WorkspaceType, OfficePageId } from "./workspace";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "review"
  | "ready"
  | "completed"
  | "done"
  | "published";

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  isCompleted?: boolean;
  position?: number;
  createdAt?: string;
}

export interface TaskNote {
  id: string;
  taskId: string;
  title?: string;
  content: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  action: string;
  actor: string;
  timestamp: string;
  icon?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export type SocialPlatform = "Instagram" | "YouTube" | "TikTok" | "Facebook" | "X";
export type ThumbnailStatus = "pending" | "designed" | "approved";
export type PublishingStatus = "draft" | "scheduled" | "live" | "published" | "pending";

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  workspaceId: WorkspaceType;
  officePageId?: OfficePageId;
  pageId?: string | null;
  projectId?: string | null;
  status: TaskStatus;
  stage?: string; // Workflow stage (e.g. IDEAS, RECORDING, DESIGN, SPRINT)
  priority: TaskPriority;
  dueDate?: string | null; // YYYY-MM-DD
  dueTime?: string | null; // e.g. "16:00"
  estimatedDurationMin?: number;
  actualDurationMin?: number;
  tags: string[];
  isRecurring?: boolean;
  recurringPattern?: string; // e.g. "Every Mon & Thu at 4:00 PM"
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
  notes?: string | null;
  activity?: TaskActivity[];
  linkedVlogEpisode?: string;
  githubBranchOrCommit?: string;

  // Phase 7 Recurring System:
  recurringRuleId?: string | null; // ID of the parent RecurringRule that generated this instance
  recurrenceInstanceDate?: string; // YYYY-MM-DD that this instance was generated for

  // Phase 6 extensions:
  linkedVlogId?: string | null; // Relational foreign-key reference to a personal vlog task ID
  recordingChecklist?: ChecklistItem[];
  editingChecklist?: ChecklistItem[];
  thumbnailStatus?: ThumbnailStatus;
  thumbnailUrl?: string;
  caption?: string;
  platforms?: SocialPlatform[];
  publishingStatus?: PublishingStatus;
  distributionStatus?: Record<string, string>;

  // College metadata:
  subject?: string; // e.g. "Computer Science", "Database Systems", "Mathematics"
  collegeCategory?: "classes" | "assignments" | "projects" | "exams" | "notes";
  progressPercent?: number; // e.g. 85%
  focusHours?: number; // e.g. 38.5
  examDate?: string;
  examScope?: string;
  roomOrLocation?: string;
  instructor?: string;
}

export type TaskFilterTab = "all" | "today" | "upcoming" | "overdue" | "completed";

export type TaskSortOption = "due_time" | "priority" | "created_date";

export interface TaskFilterOptions {
  tab?: TaskFilterTab;
  workspaceId?: WorkspaceType | "all";
  officePageId?: OfficePageId | "all";
  pageId?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  date?: string;
  tags?: string[];
  searchQuery?: string;
  sortBy?: TaskSortOption;
  sortOrder?: "asc" | "desc";
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  workspaceId: WorkspaceType;
  officePageId?: OfficePageId;
  pageId?: string;
  projectId?: string;
  status?: TaskStatus;
  stage?: string;
  priority?: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  estimatedDurationMin?: number;
  tags?: string[];
  subtasks?: string[]; // initial subtask titles
  notes?: string;
  subject?: string;
  collegeCategory?: "classes" | "assignments" | "projects" | "exams" | "notes";
  linkedVlogId?: string | null;
  recurringRuleId?: string | null;
  recurrenceInstanceDate?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  workspaceId?: WorkspaceType;
  officePageId?: OfficePageId;
  pageId?: string | null;
  projectId?: string | null;
  status?: TaskStatus;
  stage?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  dueTime?: string | null;
  estimatedDurationMin?: number;
  actualDurationMin?: number;
  tags?: string[];
  notes?: string | null;
  subject?: string;
  collegeCategory?: "classes" | "assignments" | "projects" | "exams" | "notes";
  linkedVlogId?: string | null;
  recurringRuleId?: string | null;
  recurrenceInstanceDate?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  isCompleted?: boolean;
  completedAt?: string;
  platforms?: SocialPlatform[];
  distributionStatus?: Record<string, string>;
  recordingChecklist?: ChecklistItem[];
  editingChecklist?: ChecklistItem[];
  thumbnailStatus?: ThumbnailStatus;
}

export interface TemplateSubtask {
  title: string;
  completed?: boolean;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  workspaceType: WorkspaceType | "general";
  defaultPriority: TaskPriority;
  defaultDuration: number;
  workflowType: string;
  subtasks: TemplateSubtask[];
  tags: string[];
  isSystem: boolean;
  createdAt?: string;
}
