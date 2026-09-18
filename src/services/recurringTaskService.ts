import {
  RecurringRule,
  CreateRecurringRuleInput,
  UpdateRecurringRuleInput,
  RecurringFilterTab,
  RecurringTaskTemplate,
  RecurrenceType,
  RecurringRuleStatus,
  TemplateId,
} from "@/types/recurring";
import { WorkspaceType, OfficePageId } from "@/types/workspace";
import { Task } from "@/types/task";
import {
  DEFAULT_TIMEZONE,
  getDatePartsInTimezone,
  calculateNextOccurrence,
  generateTaskInstancesForWindow,
  addDaysToDateString,
} from "@/lib/recurrenceEngine";
import { getAllTemplates, getTemplateById } from "@/lib/recurringTemplates";
import { taskService } from "./taskService";
import { authService } from "./authService";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const today = getDatePartsInTimezone(new Date(), DEFAULT_TIMEZONE).dateString;

const REEL_CHECKLIST_6_STEPS = [
  "Prepare/select content",
  "Edit reel",
  "Caption",
  "Hashtags",
  "Upload",
  "Verify upload",
];

const INITIAL_RECURRING_RULES: RecurringRule[] = [
  // HIGH PRIORITY — 5 CLIENT REELS (Working Days: Mon-Fri)
  {
    id: "rec-rule-shooting-film-video",
    title: "Upload Reel — Shooting Film Video",
    description: "Daily high-priority client reel publishing workflow for Shooting Film Video",
    templateId: "CLIENT_DAILY_REEL",
    workspaceId: "office",
    officePageId: "shooting-film-video",
    priority: "high",
    dueTime: "13:15",
    estimatedDurationMin: 45,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5],
    status: "ACTIVE",
    checklist: [...REEL_CHECKLIST_6_STEPS],
    tags: ["office", "client-reels", "shooting-film-video", "high-priority"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T13:15:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "rec-rule-ismail-shahid-fans",
    title: "Upload Reel — Ismail Shahid Fans",
    description: "Daily high-priority client reel publishing workflow for Ismail Shahid Fans",
    templateId: "CLIENT_DAILY_REEL",
    workspaceId: "office",
    officePageId: "ismail-shahid-fans",
    priority: "high",
    dueTime: "14:00",
    estimatedDurationMin: 45,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5],
    status: "ACTIVE",
    checklist: [...REEL_CHECKLIST_6_STEPS],
    tags: ["office", "client-reels", "ismail-shahid-fans", "high-priority"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T14:00:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "rec-rule-jahangir-khan",
    title: "Upload Reel — Jahangir Khan",
    description: "Daily high-priority client reel publishing workflow for Jahangir Khan",
    templateId: "CLIENT_DAILY_REEL",
    workspaceId: "office",
    officePageId: "jahangir-khan",
    priority: "high",
    dueTime: "15:00",
    estimatedDurationMin: 45,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5],
    status: "ACTIVE",
    checklist: [...REEL_CHECKLIST_6_STEPS],
    tags: ["office", "client-reels", "jahangir-khan", "high-priority"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T15:00:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "rec-rule-zk-production",
    title: "Upload Reel — ZK Production",
    description: "Daily high-priority client reel publishing workflow for ZK Production",
    templateId: "CLIENT_DAILY_REEL",
    workspaceId: "office",
    officePageId: "zk-production",
    priority: "high",
    dueTime: "16:00",
    estimatedDurationMin: 45,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5],
    status: "ACTIVE",
    checklist: [...REEL_CHECKLIST_6_STEPS],
    tags: ["office", "client-reels", "zk-production", "high-priority"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T16:00:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "rec-rule-new-client-page",
    title: "Upload Reel — New Client Page",
    description: "Daily high-priority client reel workflow for New Client Page (editable)",
    templateId: "CLIENT_DAILY_REEL",
    workspaceId: "office",
    officePageId: "new-client-page",
    priority: "high",
    dueTime: "17:00",
    estimatedDurationMin: 45,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5],
    status: "ACTIVE",
    checklist: [...REEL_CHECKLIST_6_STEPS],
    tags: ["office", "client-reels", "new-client-page", "high-priority"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T17:00:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },

  // MEDIUM PRIORITY — 2 FACEBOOK PAGES (Working Days: Mon-Fri)
  {
    id: "rec-rule-nazia-fanz",
    title: "Daily Content — Nazia Fanz",
    description: "Daily medium-priority Facebook content for Nazia Fanz",
    templateId: "FACEBOOK_DAILY_CONTENT",
    workspaceId: "office",
    officePageId: "nazia-fanz",
    priority: "medium",
    dueTime: "18:00",
    estimatedDurationMin: 35,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5],
    status: "ACTIVE",
    checklist: [...REEL_CHECKLIST_6_STEPS],
    tags: ["office", "facebook", "nazia-fanz", "medium-priority"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T18:00:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "rec-rule-inaya-kailashi",
    title: "Daily Content — Inaya Kailashi",
    description: "Daily medium-priority Facebook content for Inaya Kailashi",
    templateId: "FACEBOOK_DAILY_CONTENT",
    workspaceId: "office",
    officePageId: "inaya-kailashi",
    priority: "medium",
    dueTime: "19:00",
    estimatedDurationMin: 35,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5],
    status: "ACTIVE",
    checklist: [...REEL_CHECKLIST_6_STEPS],
    tags: ["office", "facebook", "inaya-kailashi", "medium-priority"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T19:00:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },

  // MUSIC — SUNO MUSIC (Separate 5-Stage Visual Workflow)
  {
    id: "rec-rule-suno-visual",
    title: "Suno Music Visual Production",
    description: "Multi-stage visual asset rendering: Visual Creation → Editing → Review → Export → Delivered",
    templateId: "SUNO_MUSIC_WORKFLOW",
    workspaceId: "office",
    officePageId: "suno-music",
    priority: "medium",
    dueTime: "15:00",
    estimatedDurationMin: 60,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5],
    status: "ACTIVE",
    checklist: [
      "Visual Creation",
      "Editing",
      "Review",
      "Export",
      "Delivered",
    ],
    tags: ["suno-music", "visual-production", "music-pipeline"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T15:00:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "rec-rule-daily-short-vlog",
    title: "Daily Short Vlog",
    description: "Daily short vlog 3-stage pipeline: Record → Edit → Upload across Facebook, YouTube, Instagram & TikTok",
    templateId: "DAILY_SHORT_VLOG",
    workspaceId: "personal",
    priority: "high", // default configurable priority
    dueTime: "19:30",
    estimatedDurationMin: 60,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "EVERY_DAY",
    interval: 1,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    status: "ACTIVE",
    checklist: [
      "Record: Hook, A-roll & essential B-roll",
      "Edit: Timeline cut, sound & captions",
      "Upload: Publish to social platforms",
    ],
    tags: ["vlog", "creator", "daily-vlog", "personal", "short-vlog"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T19:30:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "rec-rule-college-study",
    title: "Academic Focus & Algorithms Review",
    description: "Lecture review, problem sets & 25-minute Pomodoro focus session",
    templateId: "COLLEGE_STUDY",
    workspaceId: "college",
    priority: "medium",
    dueTime: "17:00",
    estimatedDurationMin: 50,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5],
    status: "ACTIVE",
    checklist: [
      "Review today's lecture notes & class slides",
      "Solve 2 practice problem sets or coding exercises",
      "Check assignment submission deadlines",
      "Run 25-minute Pomodoro study focus sprint",
      "Summarize takeaways in digital course notebook",
    ],
    tags: ["college", "academics", "study-focus", "pomodoro"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T17:00:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "rec-rule-webdev-sprint",
    title: "Web Dev Architecture Sprint & Git Push",
    description: "Advanced Next.js 15, systems architecture, unit tests & clean git commits",
    templateId: "WEB_DEV_PRACTICE",
    workspaceId: "web_development",
    priority: "high",
    dueTime: "20:00",
    estimatedDurationMin: 120,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "SPECIFIC_WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 4, 6], // Mon, Tue, Thu, Sat
    status: "ACTIVE",
    checklist: [
      "Review sprint architecture specs & schema models",
      "Implement feature component with strict TypeScript",
      "Run automated unit & integration test suites",
      "Verify ESLint rules (0 errors, 0 warnings)",
      "Stage changes, create semantic commit & push to GitHub",
    ],
    tags: ["web-dev", "nextjs", "coding", "git-push"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T20:00:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "rec-rule-backup-paused",
    title: "Weekly Cloud Backup & Cold Storage Sync",
    description: "Sync all 4K raw archives to cold cloud backup repository",
    workspaceId: "office",
    priority: "low",
    dueTime: "23:00",
    estimatedDurationMin: 30,
    startDate: "2026-09-01",
    endDate: null,
    recurrenceType: "WEEKLY",
    interval: 1,
    daysOfWeek: [0], // Sunday
    status: "PAUSED",
    checklist: ["Verify local SSD mount", "Run rsync to cold vault", "Audit checksums"],
    tags: ["maintenance", "backup"],
    lastGeneratedDate: null,
    nextOccurrence: `${today}T23:00:00`,
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-09-01T08:00:00.000Z",
    updatedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "rec-rule-midterm-expired",
    title: "Summer Term Project Deliverable Drill",
    description: "Completed summer project milestone drills",
    workspaceId: "college",
    priority: "high",
    dueTime: "10:00",
    estimatedDurationMin: 60,
    startDate: "2026-08-01",
    endDate: "2026-08-30", // Expired
    recurrenceType: "WEEKDAYS",
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5],
    status: "EXPIRED",
    checklist: ["Final proofing", "PDF binder compilation", "Submission to portal"],
    tags: ["college", "expired"],
    lastGeneratedDate: "2026-08-30",
    nextOccurrence: "2026-08-30T10:00:00",
    timezone: DEFAULT_TIMEZONE,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-30T10:00:00.000Z",
  },
];

// In-memory cache
let localRules: RecurringRule[] = [...INITIAL_RECURRING_RULES];

// Recalculate nextOccurrence for all initial active rules
localRules = localRules.map((rule) => {
  if (rule.status === "ACTIVE") {
    const nextOcc = calculateNextOccurrence(rule, undefined, rule.timezone || DEFAULT_TIMEZONE);
    if (nextOcc) {
      return { ...rule, nextOccurrence: nextOcc.nextTimestamp };
    }
  }
  return rule;
});

export const recurringTaskService = {
  /**
   * Get all recurring rules with optional tab filter
   */
  getRules: async (filterTab: RecurringFilterTab = "all"): Promise<RecurringRule[]> => {
    // If Supabase is configured, attempt fetch
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("recurring_rules")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          // Map DB to model
          const mapped: RecurringRule[] = data.map((row) => ({
            id: row.id,
            userId: row.user_id || undefined,
            title: row.title,
            description: row.description || undefined,
            templateId: (row.template_id as TemplateId) || undefined,
            workspaceId: row.workspace_id as WorkspaceType,
            officePageId: (row.office_page_id as OfficePageId) || undefined,
            pageId: row.page_id,
            projectId: row.project_id,
            priority: row.priority,
            dueTime: row.due_time,
            estimatedDurationMin: row.estimated_duration_min,
            startDate: row.start_date,
            endDate: row.end_date,
            recurrenceType: row.recurrence_type as RecurrenceType,
            interval: row.interval,
            daysOfWeek: row.days_of_week || [],
            dayOfMonth: row.day_of_month || undefined,
            status: row.status as RecurringRuleStatus,
            checklist: Array.isArray(row.checklist) ? row.checklist : [],
            tags: row.tags || [],
            lastGeneratedDate: row.last_generated_date,
            nextOccurrence: row.next_occurrence || "",
            timezone: row.timezone || DEFAULT_TIMEZONE,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));

          localRules = mapped;
        }
      } catch (err) {
        console.warn("[recurringTaskService] Live rules query failed, using local cache:", err);
      }
    }

    // Refresh dynamic status (e.g. check if endDate is now passed)
    const currentDateStr = getDatePartsInTimezone(new Date(), DEFAULT_TIMEZONE).dateString;
    localRules.forEach((rule) => {
      if (rule.endDate && rule.endDate < currentDateStr && rule.status !== "EXPIRED") {
        rule.status = "EXPIRED";
      }
    });

    if (filterTab === "all") return [...localRules];
    if (filterTab === "active") return localRules.filter((r) => r.status === "ACTIVE");
    if (filterTab === "paused") return localRules.filter((r) => r.status === "PAUSED");
    if (filterTab === "expired") return localRules.filter((r) => r.status === "EXPIRED");
    if (filterTab === "upcoming") {
      return localRules
        .filter((r) => r.status === "ACTIVE")
        .sort((a, b) => (a.nextOccurrence || "").localeCompare(b.nextOccurrence || ""));
    }

    return [...localRules];
  },

  /**
   * Get single rule by ID
   */
  getRuleById: async (id: string): Promise<RecurringRule | null> => {
    const rule = localRules.find((r) => r.id === id);
    return rule ? { ...rule } : null;
  },

  /**
   * Create a new recurring rule
   */
  createRule: async (input: CreateRecurringRuleInput): Promise<RecurringRule> => {
    const newId = `rec-rule-${Date.now()}`;
    const userProfile = await authService.getUser();
    const tz = input.timezone || userProfile?.timezone || DEFAULT_TIMEZONE;
    const startDate = input.startDate || getDatePartsInTimezone(new Date(), tz).dateString;

    // Prefill from template if templateId provided
    let templateChecklist: string[] = input.checklist || [];
    let templateTags: string[] = input.tags || [];
    if (input.templateId) {
      const tpl = getTemplateById(input.templateId);
      if (tpl) {
        if (!input.checklist || input.checklist.length === 0) {
          templateChecklist = [...tpl.checklist];
        }
        if (!input.tags || input.tags.length === 0) {
          templateTags = [...tpl.tags];
        }
      }
    }

    const newRule: RecurringRule = {
      id: newId,
      title: input.title,
      description: input.description,
      templateId: input.templateId,
      workspaceId: input.workspaceId,
      officePageId: input.officePageId,
      pageId: input.pageId,
      projectId: input.projectId,
      priority: input.priority || "medium",
      dueTime: input.dueTime,
      estimatedDurationMin: input.estimatedDurationMin || 45,
      startDate: startDate,
      endDate: input.endDate || null,
      recurrenceType: input.recurrenceType,
      interval: input.interval || 1,
      daysOfWeek: input.daysOfWeek || [1, 2, 3, 4, 5],
      dayOfMonth: input.dayOfMonth,
      status: "ACTIVE",
      checklist: templateChecklist,
      tags: templateTags,
      lastGeneratedDate: null,
      nextOccurrence: "",
      timezone: tz,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextOcc = calculateNextOccurrence(newRule, startDate, tz);
    if (nextOcc) {
      newRule.nextOccurrence = nextOcc.nextTimestamp;
    }

    localRules.unshift(newRule);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("recurring_rules").insert({
          id: newRule.id,
          title: newRule.title,
          description: newRule.description,
          template_id: newRule.templateId,
          workspace_id: newRule.workspaceId,
          office_page_id: newRule.officePageId,
          page_id: newRule.pageId,
          project_id: newRule.projectId,
          priority: newRule.priority,
          due_time: newRule.dueTime,
          estimated_duration_min: newRule.estimatedDurationMin,
          start_date: newRule.startDate,
          end_date: newRule.endDate,
          recurrence_type: newRule.recurrenceType,
          interval: newRule.interval,
          days_of_week: newRule.daysOfWeek,
          day_of_month: newRule.dayOfMonth,
          status: newRule.status,
          checklist: newRule.checklist,
          tags: newRule.tags,
          next_occurrence: newRule.nextOccurrence,
          timezone: newRule.timezone,
        });
      } catch (err) {
        console.warn("[recurringTaskService] Supabase insert rule failed:", err);
      }
    }

    return { ...newRule };
  },

  /**
   * Update an existing recurring rule
   */
  updateRule: async (id: string, updates: UpdateRecurringRuleInput): Promise<RecurringRule | null> => {
    const idx = localRules.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const existing = localRules[idx];
    const updated: RecurringRule = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate next occurrence if schedule fields changed
    if (
      updates.dueTime ||
      updates.recurrenceType ||
      updates.daysOfWeek ||
      updates.startDate ||
      updates.endDate ||
      updates.status
    ) {
      if (updated.status === "ACTIVE") {
        const nextOcc = calculateNextOccurrence(updated, undefined, updated.timezone);
        if (nextOcc) {
          updated.nextOccurrence = nextOcc.nextTimestamp;
        } else if (updated.endDate) {
          updated.status = "EXPIRED";
        }
      }
    }

    localRules[idx] = updated;

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from("recurring_rules")
          .update({
            title: updated.title,
            description: updated.description,
            workspace_id: updated.workspaceId,
            office_page_id: updated.officePageId,
            priority: updated.priority,
            due_time: updated.dueTime,
            estimated_duration_min: updated.estimatedDurationMin,
            start_date: updated.startDate,
            end_date: updated.endDate,
            recurrence_type: updated.recurrenceType,
            interval: updated.interval,
            days_of_week: updated.daysOfWeek,
            day_of_month: updated.dayOfMonth,
            status: updated.status,
            checklist: updated.checklist,
            tags: updated.tags,
            next_occurrence: updated.nextOccurrence,
            updated_at: updated.updatedAt,
          })
          .eq("id", id);
      } catch (err) {
        console.warn("[recurringTaskService] Supabase update rule failed:", err);
      }
    }

    return { ...updated };
  },

  /**
   * Pause an active recurring rule
   */
  pauseRule: async (id: string): Promise<RecurringRule | null> => {
    return recurringTaskService.updateRule(id, { status: "PAUSED" });
  },

  /**
   * Resume a paused recurring rule
   */
  resumeRule: async (id: string): Promise<RecurringRule | null> => {
    return recurringTaskService.updateRule(id, { status: "ACTIVE" });
  },

  /**
   * Delete a recurring rule
   */
  deleteRule: async (id: string): Promise<boolean> => {
    const initialLen = localRules.length;
    localRules = localRules.filter((r) => r.id !== id);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("recurring_rules").delete().eq("id", id);
      } catch (err) {
        console.warn("[recurringTaskService] Supabase delete rule failed:", err);
      }
    }

    return localRules.length < initialLen;
  },

  /**
   * Reliably generates task instances for upcoming window (e.g. next 14 days)
   * GUARANTEES:
   * - ZERO DUPLICATES generated.
   * - Paused and expired rules generate 0 tasks.
   * - Next occurrence timestamp is advanced.
   */
  generateUpcomingTasks: async (
    windowDays: number = 14
  ): Promise<{
    generatedCount: number;
    generatedTasks: Task[];
    message: string;
  }> => {
    const rules = await recurringTaskService.getRules();
    const existingTasks = await taskService.getTasks();

    const tz = DEFAULT_TIMEZONE;
    const startDateStr = getDatePartsInTimezone(new Date(), tz).dateString;
    const endDateStr = addDaysToDateString(startDateStr, windowDays);

    const { generatedTasks, updatedRules } = generateTaskInstancesForWindow({
      rules,
      existingTasks,
      startDateStr,
      endDateStr,
      timezone: tz,
    });

    // Add generated tasks to taskService
    if (generatedTasks.length > 0) {
      await taskService.batchAddTasks(generatedTasks);
    }

    // Sync updated rules back
    localRules = localRules.map((orig) => {
      const match = updatedRules.find((u) => u.id === orig.id);
      return match || orig;
    });

    return {
      generatedCount: generatedTasks.length,
      generatedTasks,
      message:
        generatedTasks.length > 0
          ? `Successfully generated ${generatedTasks.length} task instances without duplicates.`
          : "All upcoming recurring task instances are already up to date. Zero duplicates created.",
    };
  },

  /**
   * Returns all reusable templates
   */
  getTemplates: (): RecurringTaskTemplate[] => {
    return getAllTemplates();
  },

  /**
   * Returns telemetry statistics
   */
  getRecurringStats: async () => {
    const rules = await recurringTaskService.getRules();
    const total = rules.length;
    const active = rules.filter((r) => r.status === "ACTIVE").length;
    const paused = rules.filter((r) => r.status === "PAUSED").length;
    const expired = rules.filter((r) => r.status === "EXPIRED").length;

    // Find the next upcoming occurrence
    const activeRulesWithOcc = rules
      .filter((r) => r.status === "ACTIVE" && r.nextOccurrence)
      .sort((a, b) => a.nextOccurrence.localeCompare(b.nextOccurrence));

    const nextOccRule = activeRulesWithOcc[0] || null;

    return {
      total,
      active,
      paused,
      expired,
      nextOccurrenceRuleTitle: nextOccRule ? nextOccRule.title : "None scheduled",
      nextOccurrenceTime: nextOccRule ? nextOccRule.nextOccurrence : null,
    };
  },
};
