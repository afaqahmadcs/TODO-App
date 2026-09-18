import type { RecurringRule } from "@/types/recurring";
import type { Task } from "@/types/task";

export const DEFAULT_TIMEZONE = "Asia/Karachi";

/**
 * Extracts calendar date parts in the user's configured timezone.
 * Uses Intl.DateTimeFormat to avoid any browser/server local time distortion.
 */
export function getDatePartsInTimezone(date: Date, timezone: string = DEFAULT_TIMEZONE): {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  hour: number;
  minute: number;
  second: number;
  dateString: string; // YYYY-MM-DD
} {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";

    const year = parseInt(getPart("year"), 10) || date.getUTCFullYear();
    const month = parseInt(getPart("month"), 10) || date.getUTCMonth() + 1;
    const day = parseInt(getPart("day"), 10) || date.getUTCDate();
    const hour = parseInt(getPart("hour"), 10) || 0;
    const minute = parseInt(getPart("minute"), 10) || 0;
    const second = parseInt(getPart("second"), 10) || 0;

    const weekdayStr = getPart("weekday");
    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const dayOfWeek = weekdayMap[weekdayStr] ?? date.getUTCDay();

    const monthPad = String(month).padStart(2, "0");
    const dayPad = String(day).padStart(2, "0");
    const dateString = `${year}-${monthPad}-${dayPad}`;

    return { year, month, day, dayOfWeek, hour, minute, second, dateString };
  } catch {
    // Fallback if timezone string is invalid
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const monthPad = String(month).padStart(2, "0");
    const dayPad = String(day).padStart(2, "0");
    const dateString = `${year}-${monthPad}-${dayPad}`;
    return { year, month, day, dayOfWeek, hour, minute, second, dateString };
  }
}

/**
 * Returns the day of week (0=Sun, 1=Mon, ..., 6=Sat) for a YYYY-MM-DD date string.
 */
export function getDayOfWeekForDateString(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return date.getUTCDay();
}

/**
 * Adds N days to a YYYY-MM-DD date string and returns the new YYYY-MM-DD string.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  date.setUTCDate(date.getUTCDate() + days);
  const newY = date.getUTCFullYear();
  const newM = String(date.getUTCMonth() + 1).padStart(2, "0");
  const newD = String(date.getUTCDate()).padStart(2, "0");
  return `${newY}-${newM}-${newD}`;
}

/**
 * Checks if a given YYYY-MM-DD date string satisfies the recurrence pattern of a rule.
 */
export function isRuleMatchForDate(
  rule: RecurringRule,
  dateStr: string
): boolean {
  // Must not be before rule's start date
  if (dateStr < rule.startDate) {
    return false;
  }

  // Must not be after rule's end date (if expiration exists)
  if (rule.endDate && dateStr > rule.endDate) {
    return false;
  }

  // Paused rules do not match/trigger
  if (rule.status === "PAUSED") {
    return false;
  }

  const dow = getDayOfWeekForDateString(dateStr);

  switch (rule.recurrenceType) {
    case "EVERY_DAY":
      return true;

    case "WEEKDAYS":
      // Monday (1) through Friday (5)
      return dow >= 1 && dow <= 5;

    case "SPECIFIC_WEEKDAYS":
      return Array.isArray(rule.daysOfWeek) && rule.daysOfWeek.includes(dow);

    case "WEEKLY": {
      // Must match day of week
      const matchesDow =
        Array.isArray(rule.daysOfWeek) && rule.daysOfWeek.length > 0
          ? rule.daysOfWeek.includes(dow)
          : dow === getDayOfWeekForDateString(rule.startDate);

      if (!matchesDow) return false;

      if (rule.interval <= 1) return true;

      // Calculate weeks elapsed from rule.startDate
      const [sy, sm, sd] = rule.startDate.split("-").map(Number);
      const [cy, cm, cd] = dateStr.split("-").map(Number);
      const startDateUtc = Date.UTC(sy, sm - 1, sd);
      const currentDateUtc = Date.UTC(cy, cm - 1, cd);
      const daysDiff = Math.floor((currentDateUtc - startDateUtc) / 86400000);
      const weeksDiff = Math.floor(daysDiff / 7);
      return weeksDiff % rule.interval === 0;
    }

    case "MONTHLY": {
      const targetDay = rule.dayOfMonth ?? parseInt(rule.startDate.split("-")[2], 10);
      const currentDay = parseInt(dateStr.split("-")[2], 10);
      return currentDay === targetDay;
    }

    case "CUSTOM_INTERVAL": {
      const [sy, sm, sd] = rule.startDate.split("-").map(Number);
      const [cy, cm, cd] = dateStr.split("-").map(Number);
      const startDateUtc = Date.UTC(sy, sm - 1, sd);
      const currentDateUtc = Date.UTC(cy, cm - 1, cd);
      const daysDiff = Math.round((currentDateUtc - startDateUtc) / 86400000);
      const step = Math.max(1, rule.interval || 1);
      return daysDiff >= 0 && daysDiff % step === 0;
    }

    default:
      return false;
  }
}

/**
 * Human-readable description of the recurrence schedule.
 */
export function formatRecurringPattern(rule: RecurringRule): string {
  const timeFormatted = formatTime12h(rule.dueTime);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  switch (rule.recurrenceType) {
    case "EVERY_DAY":
      return `Every day at ${timeFormatted}`;
    case "WEEKDAYS":
      return `Monday – Friday at ${timeFormatted}`;
    case "SPECIFIC_WEEKDAYS": {
      const days = (rule.daysOfWeek || []).map((d) => dayNames[d]).join(", ");
      return `${days || "Selected days"} at ${timeFormatted}`;
    }
    case "WEEKLY":
      if (rule.interval > 1) {
        return `Every ${rule.interval} weeks at ${timeFormatted}`;
      }
      return `Weekly on ${(rule.daysOfWeek || []).map((d) => dayNames[d]).join(", ")} at ${timeFormatted}`;
    case "MONTHLY":
      return `Monthly on day ${rule.dayOfMonth || parseInt(rule.startDate.split("-")[2], 10)} at ${timeFormatted}`;
    case "CUSTOM_INTERVAL":
      return `Every ${rule.interval} days at ${timeFormatted}`;
    default:
      return `Repeats at ${timeFormatted}`;
  }
}

/**
 * Converts "13:15" to "1:15 PM"
 */
export function formatTime12h(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/**
 * Calculates the next upcoming occurrence for a rule starting from fromDateStr.
 * Returns { nextDate, nextTimestamp } or null if expired.
 */
export function calculateNextOccurrence(
  rule: RecurringRule,
  fromDateStr?: string,
  timezone: string = DEFAULT_TIMEZONE
): { nextDate: string; nextTimestamp: string } | null {
  const now = new Date();
  const todayParts = getDatePartsInTimezone(now, timezone);
  const startCheckDate = fromDateStr || todayParts.dateString;

  // If rule has expired
  if (rule.endDate && startCheckDate > rule.endDate) {
    return null;
  }

  // Look ahead up to 365 days
  let currentCheck = startCheckDate;
  for (let i = 0; i <= 365; i++) {
    // If checking today, check if time has already passed
    if (currentCheck === todayParts.dateString) {
      const [dueH, dueM] = (rule.dueTime || "00:00").split(":").map(Number);
      const hasPassedToday =
        todayParts.hour > dueH || (todayParts.hour === dueH && todayParts.minute >= dueM);
      if (hasPassedToday) {
        currentCheck = addDaysToDateString(currentCheck, 1);
        continue;
      }
    }

    if (isRuleMatchForDate(rule, currentCheck)) {
      const timeStr = rule.dueTime || "09:00";
      const timestamp = `${currentCheck}T${timeStr}:00`;
      return {
        nextDate: currentCheck,
        nextTimestamp: timestamp,
      };
    }

    currentCheck = addDaysToDateString(currentCheck, 1);
    if (rule.endDate && currentCheck > rule.endDate) {
      return null;
    }
  }

  return null;
}

/**
 * Core generation engine: produces Task instances for all matching active rules in the window.
 *
 * CRITICAL REQUIREMENTS:
 * 1. ZERO-DUPLICATION GUARANTEE: Checks existingTasks by (recurringRuleId, dueDate) and deterministic task ID.
 * 2. Paused rules generate 0 tasks.
 * 3. Expired rules generate 0 tasks and update rule status to EXPIRED.
 * 4. Advances rule's nextOccurrence and lastGeneratedDate reliably.
 */
export function generateTaskInstancesForWindow({
  rules,
  existingTasks,
  startDateStr,
  endDateStr,
  timezone = DEFAULT_TIMEZONE,
}: {
  rules: RecurringRule[];
  existingTasks: Task[];
  startDateStr: string;
  endDateStr: string;
  timezone?: string;
}): {
  generatedTasks: Task[];
  updatedRules: RecurringRule[];
} {
  const generatedTasks: Task[] = [];
  const updatedRules: RecurringRule[] = [];

  // Index existing tasks by key: `${recurringRuleId}_${dueDate}`
  const existingKeySet = new Set<string>();
  const existingIdSet = new Set<string>();

  for (const task of existingTasks) {
    existingIdSet.add(task.id);
    if (task.recurringRuleId && task.dueDate) {
      existingKeySet.add(`${task.recurringRuleId}_${task.dueDate}`);
    }
    if (task.recurringRuleId && task.recurrenceInstanceDate) {
      existingKeySet.add(`${task.recurringRuleId}_${task.recurrenceInstanceDate}`);
    }
  }

  // Iterate rule-by-rule
  for (const rule of rules) {
    let ruleModified = false;
    const clonedRule: RecurringRule = { ...rule };

    // Check if expired
    if (clonedRule.endDate && clonedRule.endDate < startDateStr) {
      if (clonedRule.status !== "EXPIRED") {
        clonedRule.status = "EXPIRED";
        clonedRule.updatedAt = new Date().toISOString();
        ruleModified = true;
      }
      updatedRules.push(clonedRule);
      continue;
    }

    // Skip paused rules from generation
    if (clonedRule.status === "PAUSED") {
      updatedRules.push(clonedRule);
      continue;
    }

    let checkDate = startDateStr;
    let latestGenDate = clonedRule.lastGeneratedDate;

    while (checkDate <= endDateStr) {
      // Check if date is valid for this rule
      if (isRuleMatchForDate(clonedRule, checkDate)) {
        const dedupeKey = `${clonedRule.id}_${checkDate}`;
        const deterministicTaskId = `task-rec-${clonedRule.id}-${checkDate}`;

        if (!existingKeySet.has(dedupeKey) && !existingIdSet.has(deterministicTaskId)) {
          // Construct the task instance
          const newTask: Task = {
            id: deterministicTaskId,
            userId: clonedRule.userId,
            title: clonedRule.title,
            description: clonedRule.description,
            workspaceId: clonedRule.workspaceId,
            officePageId: clonedRule.officePageId,
            pageId: clonedRule.pageId,
            projectId: clonedRule.projectId,
            status: "todo",
            priority: clonedRule.priority,
            dueDate: checkDate,
            dueTime: clonedRule.dueTime,
            estimatedDurationMin: clonedRule.estimatedDurationMin,
            tags: Array.from(new Set([...(clonedRule.tags || []), "recurring"])),
            isRecurring: true,
            recurringPattern: formatRecurringPattern(clonedRule),
            recurringRuleId: clonedRule.id,
            recurrenceInstanceDate: checkDate,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            subtasks: (clonedRule.checklist || []).map((item, idx) => ({
              id: `subtask-${clonedRule.id}-${checkDate}-${idx + 1}`,
              taskId: deterministicTaskId,
              title: item,
              completed: false,
              isCompleted: false,
              position: idx,
            })),
          };

          generatedTasks.push(newTask);
          existingKeySet.add(dedupeKey);
          existingIdSet.add(deterministicTaskId);

          latestGenDate = checkDate;
          ruleModified = true;
        }
      }

      checkDate = addDaysToDateString(checkDate, 1);
    }

    if (ruleModified) {
      clonedRule.lastGeneratedDate = latestGenDate;
      const nextOcc = calculateNextOccurrence(clonedRule, addDaysToDateString(latestGenDate || startDateStr, 1), timezone);
      if (nextOcc) {
        clonedRule.nextOccurrence = nextOcc.nextTimestamp;
      } else if (clonedRule.endDate && clonedRule.endDate < endDateStr) {
        clonedRule.status = "EXPIRED";
      }
      clonedRule.updatedAt = new Date().toISOString();
    }

    updatedRules.push(clonedRule);
  }

  return { generatedTasks, updatedRules };
}
