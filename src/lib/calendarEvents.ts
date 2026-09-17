import { Task } from "@/types/task";
import { RecurringRule } from "@/types/recurring";
import { Project } from "@/types/project";
import { UnifiedCalendarEvent } from "@/types/calendar";
import { isRuleMatchForDate } from "./recurrenceEngine";

/**
 * Converts a time string ("14:30", "08:00", "8:15 PM") to minutes from midnight
 */
export function timeStringToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 9 * 60; // default 09:00 AM
  const clean = timeStr.trim().toLowerCase();

  // 12-hour format handling: "1:15 pm", "08:00 am"
  if (clean.includes("am") || clean.includes("pm")) {
    const isPM = clean.includes("pm");
    const withoutPeriod = clean.replace(/am|pm/g, "").trim();
    const [hStr, mStr] = withoutPeriod.split(":");
    let hours = parseInt(hStr, 10) || 0;
    const minutes = parseInt(mStr, 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // 24-hour format: "14:30"
  const [hStr, mStr] = clean.split(":");
  const hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight (0-1439) to "HH:MM" (24h)
 */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(1439, totalMinutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Adds minutes to a time string and returns the end time string
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const startMins = timeStringToMinutes(timeStr);
  const endMins = startMins + Math.max(15, minutesToAdd);
  return minutesToTimeString(endMins);
}

/**
 * College classes academic schedule
 */
export interface AcademicClassTemplate {
  title: string;
  subject: string;
  daysOfWeek: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  startTime: string;
  endTime: string;
  durationMin: number;
  location: string;
  professor?: string;
  topics?: string;
}

export const COLLEGE_CLASS_TEMPLATES: AcademicClassTemplate[] = [
  {
    title: "CS301: Advanced Data Structures & Algorithms",
    subject: "CS301",
    daysOfWeek: [1, 3], // Mon, Wed
    startTime: "08:00",
    endTime: "09:30",
    durationMin: 90,
    location: "Hall B • Room 402",
    professor: "Prof. Vance",
    topics: "Red-Black Trees, Amortized Complexity, Graph Flows",
  },
  {
    title: "CS340: Database Architecture & SQL Lab",
    subject: "CS340",
    daysOfWeek: [1, 3], // Mon, Wed
    startTime: "11:30",
    endTime: "13:00",
    durationMin: 90,
    location: "Lab 3B (Workstation 12)",
    professor: "Dr. Tariq",
    topics: "B-Tree Indexes, ACID Transaction Isolation, Query Plan Tuning",
  },
  {
    title: "MATH204: Discrete Mathematics & Algorithmic Proofs",
    subject: "MATH204",
    daysOfWeek: [2, 4], // Tue, Thu
    startTime: "09:00",
    endTime: "10:30",
    durationMin: 90,
    location: "Science Wing 104",
    professor: "Dr. Nasir",
    topics: "Graph Colorings, Combinatorics, Recurrence Relations",
  },
  {
    title: "CS380: Operating Systems & Kernel Architecture Lab",
    subject: "CS380",
    daysOfWeek: [5], // Fri
    startTime: "14:00",
    endTime: "17:00",
    durationMin: 180,
    location: "Computing Center 3",
    professor: "Engr. Bilal",
    topics: "Paging & Memory Virtualization, POSIX Semaphore synchronization",
  },
];

/**
 * Web Development recurring classes
 */
export const WEB_DEV_CLASS_TEMPLATES = [
  {
    title: "Next.js 15 App Router & GraphQL Architecture",
    daysOfWeek: [1], // Monday
    startTime: "16:00",
    endTime: "18:00",
    durationMin: 120,
    location: "Virtual Lab #1 (Discord)",
    topics: "Optimistic server action mutations, Apollo cache tuning, and hydration boundary metrics.",
  },
  {
    title: "Backend Architecture & Distributed Systems",
    daysOfWeek: [2], // Tuesday
    startTime: "16:00",
    endTime: "18:00",
    durationMin: 120,
    location: "Virtual Lab #2 (Discord)",
    topics: "PostgreSQL relational indexing strategies, Redis distributed locking, and event microservices.",
  },
];

/**
 * All-Day Deadlines & Milestones
 */
export const SCHEDULED_DEADLINES: {
  date: string;
  title: string;
  workspaceId: "office" | "personal" | "college" | "web-development";
  priority: "high" | "urgent" | "medium";
  category: string;
}[] = [
  {
    date: "2025-09-16",
    title: "Sprint Goal 03 Complete",
    workspaceId: "web-development",
    priority: "high",
    category: "Sprint Goal",
  },
  {
    date: "2025-09-19",
    title: "CS301 Lab Due (Midnight)",
    workspaceId: "college",
    priority: "urgent",
    category: "Academic Submission",
  },
  {
    date: "2025-09-24",
    title: "CS301 Midterm Examination",
    workspaceId: "college",
    priority: "urgent",
    category: "Midterm Exam",
  },
  {
    date: "2025-10-22",
    title: "CS301 Midterm Exam",
    workspaceId: "college",
    priority: "urgent",
    category: "Exam",
  },
  {
    date: "2025-10-25",
    title: "Portfolio 2026 Redesign Due",
    workspaceId: "web-development",
    priority: "high",
    category: "Major Project",
  },
  {
    date: "2025-11-15",
    title: "TaskFlow v2.4 Public Beta Launch",
    workspaceId: "web-development",
    priority: "urgent",
    category: "Production Release",
  },
];

/**
 * Aggregates all calendar events across all domains into a unified list
 */
export function aggregateCalendarEvents(params: {
  tasks: Task[];
  recurringRules: RecurringRule[];
  projects?: Project[];
  windowDates: string[]; // List of YYYY-MM-DD strings in the current view
  timezone?: string;
}): UnifiedCalendarEvent[] {
  const { tasks, recurringRules, projects = [], windowDates } = params;
  const events: UnifiedCalendarEvent[] = [];
  const eventIds = new Set<string>();

  const dateSet = new Set(windowDates);

  // 1. Map Standard and Already Generated Tasks
  for (const task of tasks) {
    if (!task.dueDate || !dateSet.has(task.dueDate)) continue;

    const startTime = task.dueTime || "09:00";
    const durationMin = task.estimatedDurationMin || 45;
    const endTime = addMinutesToTime(startTime, durationMin);

    const completedCount = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;
    const totalCount = task.subtasks ? task.subtasks.length : 0;

    const event: UnifiedCalendarEvent = {
      id: `task-${task.id}`,
      title: task.title,
      description: task.description,
      date: task.dueDate,
      startTime,
      endTime,
      durationMin,
      workspaceId: task.workspaceId,
      sourceType: task.isRecurring ? "recurring" : "task",
      priority: task.priority || "medium",
      status: task.status || "todo",
      location: task.officePageId ? `Office • ${task.officePageId}` : undefined,
      subtasksCount: totalCount,
      subtasksCompleted: completedCount,
      isAllDay: false,
      isRecurring: task.isRecurring || Boolean(task.recurringRuleId),
      recurringRuleId: task.recurringRuleId,
      rawTask: task,
    };

    events.push(event);
    eventIds.add(event.id);
  }

  // 2. Project Active Recurring Rules onto windowDates (Zero-duplication: only if no task instance already exists for this rule & date)
  for (const dateStr of windowDates) {
    for (const rule of recurringRules) {
      if ((rule.status as string).toUpperCase() !== "ACTIVE") continue;
      if (!isRuleMatchForDate(rule, dateStr)) continue;

      // Check if a task instance already exists for this rule on this date
      const alreadyHasInstance = tasks.some(
        (t) =>
          (t.recurringRuleId === rule.id || t.recurrenceInstanceDate === dateStr) &&
          t.dueDate === dateStr
      );

      if (!alreadyHasInstance) {
        const startTime = rule.dueTime || "09:00";
        const durationMin = rule.estimatedDurationMin || 45;
        const endTime = addMinutesToTime(startTime, durationMin);

        const syntheticEvent: UnifiedCalendarEvent = {
          id: `rule-proj-${rule.id}-${dateStr}`,
          title: rule.title,
          description: rule.description,
          date: dateStr,
          startTime,
          endTime,
          durationMin,
          workspaceId: rule.workspaceId,
          sourceType: "recurring",
          priority: rule.priority || "medium",
          status: "scheduled",
          location: rule.officePageId ? `Office • ${rule.officePageId}` : undefined,
          subtasksCount: rule.checklist?.length || 0,
          subtasksCompleted: 0,
          isAllDay: false,
          isRecurring: true,
          recurringRuleId: rule.id,
        };

        events.push(syntheticEvent);
        eventIds.add(syntheticEvent.id);
      }
    }
  }

  // 3. Project Academic College Classes
  for (const dateStr of windowDates) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const dayOfWeek = dateObj.getUTCDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat

    for (const cls of COLLEGE_CLASS_TEMPLATES) {
      if (!cls.daysOfWeek.includes(dayOfWeek)) continue;

      // Check if user already created a specific task for this class on this date
      const alreadyExists = tasks.some(
        (t) => t.dueDate === dateStr && t.title.toLowerCase().includes(cls.subject.toLowerCase())
      );

      if (!alreadyExists) {
        const clsEvent: UnifiedCalendarEvent = {
          id: `college-class-${cls.subject}-${dateStr}`,
          title: cls.title,
          description: cls.topics ? `${cls.topics} • ${cls.professor || ""}` : cls.professor,
          date: dateStr,
          startTime: cls.startTime,
          endTime: cls.endTime,
          durationMin: cls.durationMin,
          workspaceId: "college",
          sourceType: "college_class",
          priority: "medium",
          status: "scheduled",
          location: cls.location,
          isAllDay: false,
          isRecurring: true,
        };
        events.push(clsEvent);
      }
    }

    // 4. Project Web Development Classes
    for (const wcls of WEB_DEV_CLASS_TEMPLATES) {
      if (!wcls.daysOfWeek.includes(dayOfWeek)) continue;

      const alreadyExists = tasks.some(
        (t) => t.dueDate === dateStr && t.title.toLowerCase().includes(wcls.title.toLowerCase())
      );

      if (!alreadyExists) {
        const wclsEvent: UnifiedCalendarEvent = {
          id: `web-class-${dayOfWeek}-${dateStr}`,
          title: wcls.title,
          description: wcls.topics,
          date: dateStr,
          startTime: wcls.startTime,
          endTime: wcls.endTime,
          durationMin: wcls.durationMin,
          workspaceId: "web_development",
          sourceType: "web_class",
          priority: "high",
          status: "scheduled",
          location: wcls.location,
          isAllDay: false,
          isRecurring: true,
        };
        events.push(wclsEvent);
      }
    }
  }

  // 5. Injected All-Day Deadlines & Milestones
  for (const dl of SCHEDULED_DEADLINES) {
    if (dateSet.has(dl.date)) {
      events.push({
        id: `deadline-${dl.date}-${dl.title.replace(/\s+/g, "-")}`,
        title: dl.title,
        description: dl.category,
        date: dl.date,
        startTime: "00:00",
        endTime: "23:59",
        durationMin: 1440,
        workspaceId: dl.workspaceId,
        sourceType: "deadline",
        priority: dl.priority,
        status: "deadline",
        isAllDay: true,
        isRecurring: false,
      });
    }
  }

  // 6. Project Deadlines from ProjectService
  for (const proj of projects) {
    if (proj.deadline && proj.deadline.includes("Due")) {
      // E.g. "Due Oct 25, 2025", "Due Nov 15, 2025"
      // Attempt to parse or match windowDates
      for (const dStr of windowDates) {
        const [y, m, d] = dStr.split("-").map(Number);
        const checkDate = new Date(Date.UTC(y, m - 1, d));
        const monthShort = checkDate.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
        const dayNum = checkDate.getUTCDate();
        if (proj.deadline.includes(monthShort) && proj.deadline.includes(String(dayNum))) {
          events.push({
            id: `proj-deadline-${proj.id}-${dStr}`,
            title: `[Project Deadline] ${proj.name}`,
            description: proj.description,
            date: dStr,
            startTime: "00:00",
            endTime: "23:59",
            durationMin: 1440,
            workspaceId: proj.workspaceId,
            sourceType: "project",
            priority: "urgent",
            status: "deadline",
            isAllDay: true,
            isRecurring: false,
          });
        }
      }
    }
  }

  // Sort events by date, all-day first, then by startTime
  return events.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return a.startTime.localeCompare(b.startTime);
  });
}
