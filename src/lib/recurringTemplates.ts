import { RecurringTaskTemplate } from "@/types/recurring";

export const RECURRING_TEMPLATES: Record<string, RecurringTaskTemplate> = {
  OFFICE_DAILY_CONTENT: {
    id: "OFFICE_DAILY_CONTENT",
    name: "Office Daily Content",
    description: "Daily shooting page and social publishing workflow (Mon-Fri at 1:15 PM)",
    workspaceId: "office",
    officePageId: "shooting-page",
    priority: "high",
    dueTime: "13:15",
    estimatedDurationMin: 45,
    recurrenceType: "WEEKDAYS",
    daysOfWeek: [1, 2, 3, 4, 5], // Mon, Tue, Wed, Thu, Fri
    checklist: [
      "Check new content",
      "Select content",
      "Edit",
      "Caption",
      "Hashtags",
      "Upload",
      "Verify upload",
    ],
    tags: ["office", "publishing", "shooting-page", "daily-dispatch"],
  },

  SUNO_MUSIC_VISUAL: {
    id: "SUNO_MUSIC_VISUAL",
    name: "Suno Music Visual",
    description: "Multi-stage audio artwork, animated canvas loop & 4K visualizer production",
    workspaceId: "office",
    officePageId: "suno-music",
    priority: "medium",
    dueTime: "15:00",
    estimatedDurationMin: 60,
    recurrenceType: "SPECIFIC_WEEKDAYS",
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    checklist: [
      "Brief review & track audio stem inspection",
      "Asset generation (Photoshop / Midjourney moodboard)",
      "Design 9:16 vertical motion canvas loop",
      "Review client typography & color scheme",
      "Export 4K reactive audio visualizer",
      "Deliver master assets to Spotify Canvas",
    ],
    tags: ["suno-music", "motion-graphics", "visualizer", "client-asset"],
  },

  PERSONAL_VLOG: {
    id: "PERSONAL_VLOG",
    name: "Personal Vlog",
    description: "Daily vlog B-roll ingest, rough timeline cut, color grading & distribution",
    workspaceId: "personal",
    priority: "medium",
    dueTime: "19:30",
    estimatedDurationMin: 90,
    recurrenceType: "EVERY_DAY",
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    checklist: [
      "Ingest SD card footage & camera B-roll",
      "Backup raw camera files to secondary SSD",
      "Rough timeline cut & assemble A-roll speech",
      "Color grading & sound design (SFX / ambient mix)",
      "Generate YouTube 4K thumbnail (Photoshop)",
      "Compose description & optimized SEO tags",
      "Schedule premiere on YouTube & cross-post to Instagram",
    ],
    tags: ["vlog", "youtube", "creator", "daily-vlog"],
  },

  COLLEGE_STUDY: {
    id: "COLLEGE_STUDY",
    name: "College Study",
    description: "Academic focus session: lecture review, problem sets & 25m Pomodoro sprint",
    workspaceId: "college",
    priority: "medium",
    dueTime: "17:00",
    estimatedDurationMin: 50,
    recurrenceType: "WEEKDAYS",
    daysOfWeek: [1, 2, 3, 4, 5],
    checklist: [
      "Review today's CS301 / CS340 lecture slides",
      "Solve 2 practice problem sets or coding exercises",
      "Check assignment submission deadlines",
      "Run 25-minute Pomodoro study focus sprint",
      "Summarize takeaways in digital course notebook",
    ],
    tags: ["college", "academics", "study-focus", "pomodoro"],
  },

  WEB_DEV_PRACTICE: {
    id: "WEB_DEV_PRACTICE",
    name: "Web Development Practice",
    description: "Advanced Next.js, systems architecture, unit tests & clean git commits",
    workspaceId: "web_development",
    priority: "high",
    dueTime: "20:00",
    estimatedDurationMin: 120,
    recurrenceType: "SPECIFIC_WEEKDAYS",
    daysOfWeek: [1, 2, 4, 6], // Mon, Tue, Thu, Sat
    checklist: [
      "Review sprint architecture specs & schema models",
      "Implement feature component with strict TypeScript",
      "Run automated unit & integration test suites",
      "Verify ESLint rules (0 errors, 0 warnings)",
      "Stage changes, create semantic commit & push to GitHub",
    ],
    tags: ["web-dev", "nextjs", "coding", "git-push"],
  },
};

export function getTemplateById(id: string): RecurringTaskTemplate | undefined {
  return RECURRING_TEMPLATES[id];
}

export function getAllTemplates(): RecurringTaskTemplate[] {
  return Object.values(RECURRING_TEMPLATES);
}
