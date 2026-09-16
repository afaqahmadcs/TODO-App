import { WorkspaceType, OfficePageId } from "./workspace";

export type TaskPriority = "high" | "medium" | "low";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  workspaceId: WorkspaceType;
  officePageId?: OfficePageId;
  status: TaskStatus;
  stage?: string; // Workflow stage (e.g. IDEAS, RECORDING, DESIGN)
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // e.g. "16:00"
  estimatedDurationMin?: number;
  actualDurationMin?: number;
  tags: string[];
  isRecurring?: boolean;
  recurringPattern?: string; // e.g. "Every Mon & Tue at 4:00 PM"
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
  linkedVlogEpisode?: string;
  githubBranchOrCommit?: string;
}
