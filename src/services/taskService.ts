import { Task } from "@/types/task";
import { WorkspaceType, OfficePageId } from "@/types/workspace";

// Initial mock tasks representing real content across the 4 workspaces
const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Behind-the-scenes B-roll for ZK Production set",
    workspaceId: "office",
    officePageId: "zk-production",
    status: "todo",
    stage: "IDEAS",
    priority: "high",
    dueDate: "2026-09-16",
    dueTime: "15:00",
    estimatedDurationMin: 45,
    tags: ["reels", "cinematic", "4K"],
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Select today's reel footage from interview card B",
    workspaceId: "office",
    officePageId: "jahangir-khan",
    status: "in_progress",
    stage: "TODO",
    priority: "medium",
    dueDate: "2026-09-16",
    dueTime: "16:00",
    estimatedDurationMin: 20,
    tags: ["interview", "reel"],
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Suno Music: Album Cover Art v3 - Synthwave Track",
    workspaceId: "office",
    officePageId: "suno-music",
    status: "in_progress",
    stage: "DESIGN",
    priority: "high",
    dueDate: "2026-09-16",
    dueTime: "15:00",
    estimatedDurationMin: 60,
    tags: ["spotify", "3000x3000px", "cover"],
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Vlog EP #42: Shoot Next.js learning montage & morning routine",
    workspaceId: "personal",
    status: "in_progress",
    stage: "RECORDING",
    priority: "high",
    dueDate: "2026-09-16",
    dueTime: "11:30",
    estimatedDurationMin: 40,
    tags: ["vlog", "b-roll", "sony-a7iv"],
    linkedVlogEpisode: "EP #42",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Refactor indexedDB cache hydration worker & optimistic sync",
    workspaceId: "web-development",
    status: "in_progress",
    stage: "SPRINT",
    priority: "high",
    dueDate: "2026-09-16",
    dueTime: "18:00",
    estimatedDurationMin: 45,
    tags: ["nextjs15", "indexeddb", "telemetry"],
    githubBranchOrCommit: "main@8f2a1b",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-6",
    title: "Submit Data Structures Algorithm Analysis Chapter 4",
    workspaceId: "college",
    status: "todo",
    stage: "ASSIGNMENT",
    priority: "medium",
    dueDate: "2026-09-17",
    dueTime: "23:59",
    estimatedDurationMin: 90,
    tags: ["academics", "algorithms"],
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface TaskFilterOptions {
  workspaceId?: WorkspaceType;
  officePageId?: OfficePageId;
  status?: string;
  priority?: string;
  searchQuery?: string;
}

export const taskService = {
  getTasks: async (filters?: TaskFilterOptions): Promise<Task[]> => {
    let result = [...INITIAL_TASKS];

    if (filters?.workspaceId) {
      result = result.filter((t) => t.workspaceId === filters.workspaceId);
    }
    if (filters?.officePageId) {
      result = result.filter((t) => t.officePageId === filters.officePageId);
    }
    if (filters?.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return result;
  },

  getTaskById: async (id: string): Promise<Task | null> => {
    const task = INITIAL_TASKS.find((t) => t.id === id);
    return task ?? null;
  },

  createTask: async (taskInput: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
    const newTask: Task = {
      ...taskInput,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    INITIAL_TASKS.unshift(newTask);
    return newTask;
  },

  toggleTaskCompletion: async (id: string): Promise<Task | null> => {
    const task = INITIAL_TASKS.find((t) => t.id === id);
    if (!task) return null;

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date().toISOString() : undefined;
    task.status = task.isCompleted ? "done" : "todo";
    task.updatedAt = new Date().toISOString();
    return { ...task };
  },
};
