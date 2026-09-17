import { WorkspaceType } from "./workspace";

export type ProjectStatus =
  | "planned"
  | "in_progress"
  | "active"
  | "paused"
  | "completed"
  | "Polish & Deploy"
  | "In Active Sprint"
  | "Active Study";

export interface Project {
  id: string;
  userId?: string;
  workspaceId: WorkspaceType;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number; // 0-100%
  tasksTotal?: number;
  tasksCompleted?: number;
  deadline?: string; // e.g. "Due Oct 25, 2025" or "2025-10-25"
  startDate?: string;
  focusHours?: number; // coding/focus hours logged
  techStack?: string[];
  color?: string;
  linkedVlogId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  workspaceId: WorkspaceType;
  status?: ProjectStatus;
  progress?: number;
  tasksTotal?: number;
  tasksCompleted?: number;
  deadline?: string;
  focusHours?: number;
  techStack?: string[];
  linkedVlogId?: string | null;
}
