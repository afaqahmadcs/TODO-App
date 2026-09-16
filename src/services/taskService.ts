import { Task } from "@/types/task";
import { WorkspaceType, OfficePageId } from "@/types/workspace";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Database, TaskDbRow, TaskPriority, TaskStatus } from "@/types/database";

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

// Convert Supabase Database Task Row to Frontend Task Interface
function mapDbRowToTask(row: TaskDbRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    workspaceId: (row.workspace_id as WorkspaceType) || "office",
    officePageId: (row.page_id as OfficePageId) || undefined,
    status: (row.status as Task["status"]) || "todo",
    priority: (row.priority as Task["priority"]) || "medium",
    dueDate: row.due_date || undefined,
    dueTime: row.due_time || undefined,
    estimatedDurationMin: row.estimated_minutes,
    actualDurationMin: row.actual_minutes,
    tags: [],
    isCompleted: row.status === "completed" || Boolean(row.completed_at),
    completedAt: row.completed_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const taskService = {
  getTasks: async (filters?: TaskFilterOptions): Promise<Task[]> => {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from("tasks").select("*");

        if (filters?.workspaceId) {
          query = query.eq("workspace_id", filters.workspaceId);
        }
        if (filters?.officePageId) {
          query = query.eq("page_id", filters.officePageId);
        }
        if (filters?.priority) {
          query = query.eq("priority", filters.priority as TaskPriority);
        }
        if (filters?.status) {
          const statusValue = filters.status === "done" ? "completed" : filters.status;
          query = query.eq("status", statusValue as TaskStatus);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          let tasks = data.map(mapDbRowToTask);
          if (filters?.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            tasks = tasks.filter((t) => t.title.toLowerCase().includes(q));
          }
          return tasks;
        }
      } catch (err) {
        console.warn("[taskService] Live Supabase query failed, falling back to local cache:", err);
      }
    }

    // Local Fallback Store
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
    if (filters?.status) {
      result = result.filter((t) => t.status === filters.status);
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
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (!error && data) {
          return mapDbRowToTask(data);
        }
      } catch (err) {
        console.warn("[taskService] getTaskById failed:", err);
      }
    }

    const task = INITIAL_TASKS.find((t) => t.id === id);
    return task ?? null;
  },

  createTask: async (taskInput: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
    if (isSupabaseConfigured()) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const insertPayload: Database["public"]["Tables"]["tasks"]["Insert"] = {
            user_id: user.id,
            workspace_id: taskInput.workspaceId.replace("-", "_"),
            title: taskInput.title,
            description: taskInput.description || null,
            status: taskInput.status === "done" ? "completed" : taskInput.status,
            priority: taskInput.priority,
            due_date: taskInput.dueDate || null,
            due_time: taskInput.dueTime || null,
            estimated_minutes: taskInput.estimatedDurationMin || 0,
          };

          const { data, error } = await supabase
            .from("tasks")
            .insert(insertPayload)
            .select()
            .single();

          if (!error && data) {
            return mapDbRowToTask(data);
          }
        }
      } catch (err) {
        console.warn("[taskService] Live task insertion failed:", err);
      }
    }

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
    if (isSupabaseConfigured()) {
      try {
        const current = await taskService.getTaskById(id);
        if (current) {
          const nextCompleted = !current.isCompleted;
          const updatePayload: Database["public"]["Tables"]["tasks"]["Update"] = {
            status: nextCompleted ? "completed" : "todo",
            completed_at: nextCompleted ? new Date().toISOString() : null,
          };

          const { data, error } = await supabase
            .from("tasks")
            .update(updatePayload)
            .eq("id", id)
            .select()
            .single();

          if (!error && data) {
            return mapDbRowToTask(data);
          }
        }
      } catch (err) {
        console.warn("[taskService] toggleTaskCompletion remote failed:", err);
      }
    }

    const task = INITIAL_TASKS.find((t) => t.id === id);
    if (!task) return null;

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date().toISOString() : undefined;
    task.status = task.isCompleted ? "done" : "todo";
    task.updatedAt = new Date().toISOString();
    return { ...task };
  },
};
