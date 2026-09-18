import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { TaskTemplate, Task, TaskPriority } from "@/types/task";
import { WorkspaceType, OfficePageId } from "@/types/workspace";
import { taskService } from "./taskService";

// Built-in global templates available to all users
export const BUILT_IN_TEMPLATES: TaskTemplate[] = [
  {
    id: "tmpl-daily-task",
    name: "Daily Task Template",
    description: "Structured workflow for daily planning, priority execution, and evening retrospective review.",
    workspaceType: "personal",
    defaultPriority: "high",
    defaultDuration: 60,
    workflowType: "daily_planning",
    subtasks: [
      { title: "Review calendar commitments & deadlines", completed: false },
      { title: "Identify top 3 non-negotiable priority tasks", completed: false },
      { title: "Execute morning focus block (deep work)", completed: false },
      { title: "Clear communication inbox & status updates", completed: false },
      { title: "Evening log: document progress & prepare tomorrow", completed: false },
    ],
    tags: ["daily", "planning", "routine"],
    isSystem: true,
  },
  {
    id: "tmpl-weekly-review",
    name: "Weekly Review Template",
    description: "Comprehensive end-of-week audit to review open loops, project milestones, and upcoming goals.",
    workspaceType: "personal",
    defaultPriority: "high",
    defaultDuration: 45,
    workflowType: "weekly_audit",
    subtasks: [
      { title: "Process inbox notes and loose papers to zero", completed: false },
      { title: "Review previous week completed tasks vs targets", completed: false },
      { title: "Audit all active project progress bars", completed: false },
      { title: "Schedule upcoming week focus sessions & deadlines", completed: false },
      { title: "Backup critical design assets and code repositories", completed: false },
    ],
    tags: ["review", "planning", "milestones"],
    isSystem: true,
  },
  {
    id: "tmpl-vlog-workflow",
    name: "Vlog Workflow Template",
    description: "Complete multi-stage production pipeline from initial concept to master release.",
    workspaceType: "personal",
    defaultPriority: "high",
    defaultDuration: 120,
    workflowType: "creator_pipeline",
    subtasks: [
      { title: "Draft episode outline, hook & B-roll shotlist", completed: false },
      { title: "Film A-roll dialogue and 4K B-roll footage", completed: false },
      { title: "Import media, sync audio & build assembly cut", completed: false },
      { title: "Color grade, sound design & motion graphics", completed: false },
      { title: "Design 16:9 and 9:16 high-CTR thumbnail variants", completed: false },
      { title: "Write title, description, chapters & schedule upload", completed: false },
    ],
    tags: ["vlog", "youtube", "production"],
    isSystem: true,
  },
  {
    id: "tmpl-study-session",
    name: "Study Session Template",
    description: "Focused academic deep-work block incorporating spaced repetition and problem-solving.",
    workspaceType: "college",
    defaultPriority: "medium",
    defaultDuration: 90,
    workflowType: "academic_study",
    subtasks: [
      { title: "Review lecture slides and core theoretical concepts", completed: false },
      { title: "Solve 3-5 textbook problems / algorithmic challenges", completed: false },
      { title: "Summarize key formulas and architectural diagrams", completed: false },
      { title: "Self-quiz on challenging definitions and proofs", completed: false },
    ],
    tags: ["study", "college", "deep-work"],
    isSystem: true,
  },
  {
    id: "tmpl-content-publishing",
    name: "Content Publishing Workflow",
    description: "Standard publishing and multi-platform distribution checklist for client channels.",
    workspaceType: "office",
    defaultPriority: "high",
    defaultDuration: 60,
    workflowType: "content_distribution",
    subtasks: [
      { title: "Final review of visual assets and video export quality", completed: false },
      { title: "Craft tailored captions, hashtags & CTA per platform", completed: false },
      { title: "Schedule publication across YouTube, IG, TikTok & FB", completed: false },
      { title: "Monitor first-hour engagement & reply to top comments", completed: false },
    ],
    tags: ["office", "publishing", "social-media"],
    isSystem: true,
  },
];

export interface InstantiateTemplateOptions {
  dueDate?: string;
  dueTime?: string;
  priority?: TaskPriority;
  workspaceId?: WorkspaceType;
  officePageId?: OfficePageId;
  projectId?: string;
}

export const templateService = {
  /**
   * Fetch all global templates, optionally filtered by workspace type
   */
  getTemplates: async (workspaceType?: string): Promise<TaskTemplate[]> => {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from("task_templates").select("*").order("created_at", { ascending: true });
        if (workspaceType && workspaceType !== "all") {
          query = query.or(`workspace_type.eq.${workspaceType},workspace_type.eq.general`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description || "",
            workspaceType: row.workspace_type as WorkspaceType,
            defaultPriority: row.default_priority,
            defaultDuration: row.default_duration,
            workflowType: row.workflow_type,
            subtasks: Array.isArray(row.subtasks) ? (row.subtasks as { title: string; completed?: boolean }[]) : [],
            tags: row.tags || [],
            isSystem: row.is_system,
            createdAt: row.created_at,
          }));
        }
      } catch (err) {
        console.warn("[templateService] Supabase getTemplates failed, using built-in:", err);
      }
    }

    if (workspaceType && workspaceType !== "all") {
      return BUILT_IN_TEMPLATES.filter(
        (t) => t.workspaceType === workspaceType || t.workspaceType === "general"
      );
    }
    return BUILT_IN_TEMPLATES;
  },

  /**
   * Get single template by ID
   */
  getTemplateById: async (id: string): Promise<TaskTemplate | null> => {
    const templates = await templateService.getTemplates();
    return templates.find((t) => t.id === id) || null;
  },

  /**
   * Instantiate a global template into a brand new user-owned task
   * GUARANTEE: Generates a distinct task record owned by the authenticated Supabase user.
   */
  instantiateTemplate: async (
    templateId: string,
    options?: InstantiateTemplateOptions
  ): Promise<Task> => {
    const template = await templateService.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with ID "${templateId}" not found.`);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const targetWorkspace = options?.workspaceId || (template.workspaceType === "general" ? "personal" : template.workspaceType as WorkspaceType);

    // Call taskService to create a new user-owned task record
    const createdTask = await taskService.createTask({
      title: template.name,
      description: template.description,
      workspaceId: targetWorkspace,
      officePageId: options?.officePageId,
      projectId: options?.projectId,
      priority: options?.priority || template.defaultPriority,
      dueDate: options?.dueDate || todayStr,
      dueTime: options?.dueTime || "09:00",
      estimatedDurationMin: template.defaultDuration,
      tags: [...template.tags],
      subtasks: template.subtasks.map((s) => s.title),
      status: "todo",
    });

    return createdTask;
  },
};
