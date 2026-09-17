import {
  isRuleMatchForDate,
  calculateNextOccurrence,
  generateTaskInstancesForWindow,
  getDatePartsInTimezone,
  getDayOfWeekForDateString,
  addDaysToDateString,
  DEFAULT_TIMEZONE,
} from "../src/lib/recurrenceEngine.ts";
import { RECURRING_TEMPLATES, getAllTemplates } from "../src/lib/recurringTemplates.ts";

console.log("==================================================");
console.log("🧪 RUNNING PHASE 7 RECURRING TASK VERIFICATION SUITE");
console.log("==================================================");

let failed = false;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    failed = true;
  } else {
    console.log(`  ✓ ${message}`);
  }
}

// ----------------------------------------------------
// 1. Recurrence Types Verification
// ----------------------------------------------------
console.log("\n1. Verifying all Recurrence Types...");

const mockDailyRule = {
  id: "test-daily",
  title: "Test Daily",
  workspaceId: "office",
  priority: "MEDIUM",
  dueTime: "10:00",
  estimatedDurationMin: 30,
  startDate: "2026-09-01",
  endDate: null,
  recurrenceType: "EVERY_DAY",
  interval: 1,
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  status: "ACTIVE",
  checklist: ["Step 1"],
  tags: [],
  nextOccurrence: "2026-09-01T10:00:00",
  timezone: DEFAULT_TIMEZONE,
  createdAt: "2026-09-01",
  updatedAt: "2026-09-01",
};

assert(isRuleMatchForDate(mockDailyRule, "2026-09-14"), "EVERY_DAY matches Monday");
assert(isRuleMatchForDate(mockDailyRule, "2026-09-20"), "EVERY_DAY matches Sunday");

const mockWeekdaysRule = {
  ...mockDailyRule,
  id: "test-weekdays",
  recurrenceType: "WEEKDAYS",
};

// 2026-09-14 is Monday (1), 2026-09-18 is Friday (5), 2026-09-19 is Saturday (6), 2026-09-20 is Sunday (0)
assert(isRuleMatchForDate(mockWeekdaysRule, "2026-09-14"), "WEEKDAYS matches Monday");
assert(isRuleMatchForDate(mockWeekdaysRule, "2026-09-18"), "WEEKDAYS matches Friday");
assert(!isRuleMatchForDate(mockWeekdaysRule, "2026-09-19"), "WEEKDAYS rejects Saturday");
assert(!isRuleMatchForDate(mockWeekdaysRule, "2026-09-20"), "WEEKDAYS rejects Sunday");

const mockSpecificDaysRule = {
  ...mockDailyRule,
  id: "test-specific",
  recurrenceType: "SPECIFIC_WEEKDAYS",
  daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
};

assert(isRuleMatchForDate(mockSpecificDaysRule, "2026-09-14"), "SPECIFIC_WEEKDAYS matches Monday (1)");
assert(isRuleMatchForDate(mockSpecificDaysRule, "2026-09-16"), "SPECIFIC_WEEKDAYS matches Wednesday (3)");
assert(!isRuleMatchForDate(mockSpecificDaysRule, "2026-09-15"), "SPECIFIC_WEEKDAYS rejects Tuesday (2)");

const mockMonthlyRule = {
  ...mockDailyRule,
  id: "test-monthly",
  recurrenceType: "MONTHLY",
  dayOfMonth: 15,
};

assert(isRuleMatchForDate(mockMonthlyRule, "2026-09-15"), "MONTHLY matches 15th of month");
assert(!isRuleMatchForDate(mockMonthlyRule, "2026-09-16"), "MONTHLY rejects 16th of month");

const mockCustomIntervalRule = {
  ...mockDailyRule,
  id: "test-custom",
  recurrenceType: "CUSTOM_INTERVAL",
  startDate: "2026-09-01",
  interval: 3, // Every 3 days
};

assert(isRuleMatchForDate(mockCustomIntervalRule, "2026-09-01"), "CUSTOM_INTERVAL matches Day 0 (start date)");
assert(isRuleMatchForDate(mockCustomIntervalRule, "2026-09-04"), "CUSTOM_INTERVAL matches Day 3");
assert(isRuleMatchForDate(mockCustomIntervalRule, "2026-09-07"), "CUSTOM_INTERVAL matches Day 6");
assert(!isRuleMatchForDate(mockCustomIntervalRule, "2026-09-02"), "CUSTOM_INTERVAL rejects Day 1");

// ----------------------------------------------------
// 2. Zero-Duplication Guarantee
// ----------------------------------------------------
console.log("\n2. Verifying Zero-Duplication Guarantee...");

const initialRun = generateTaskInstancesForWindow({
  rules: [mockWeekdaysRule, mockSpecificDaysRule],
  existingTasks: [],
  startDateStr: "2026-09-14",
  endDateStr: "2026-09-20",
  timezone: DEFAULT_TIMEZONE,
});

assert(initialRun.generatedTasks.length === 8, `Initial run generated 8 tasks (5 weekdays + 3 specific)`);

// Run generation again with existing tasks passed
const secondRun = generateTaskInstancesForWindow({
  rules: [mockWeekdaysRule, mockSpecificDaysRule],
  existingTasks: initialRun.generatedTasks,
  startDateStr: "2026-09-14",
  endDateStr: "2026-09-20",
  timezone: DEFAULT_TIMEZONE,
});

assert(
  secondRun.generatedTasks.length === 0,
  `ZERO-DUPLICATION: Second identical run generated exactly 0 duplicate tasks`
);

// ----------------------------------------------------
// 3. Handling Paused and Expired Rules
// ----------------------------------------------------
console.log("\n3. Verifying Paused & Expired Rule Handling...");

const pausedRule = {
  ...mockDailyRule,
  id: "test-paused",
  status: "PAUSED",
};

const pausedRun = generateTaskInstancesForWindow({
  rules: [pausedRule],
  existingTasks: [],
  startDateStr: "2026-09-14",
  endDateStr: "2026-09-20",
  timezone: DEFAULT_TIMEZONE,
});

assert(pausedRun.generatedTasks.length === 0, "PAUSED rule generated 0 tasks");

const expiredRule = {
  ...mockDailyRule,
  id: "test-expired",
  startDate: "2026-08-01",
  endDate: "2026-08-30", // Past date
  status: "ACTIVE",
};

const expiredRun = generateTaskInstancesForWindow({
  rules: [expiredRule],
  existingTasks: [],
  startDateStr: "2026-09-14",
  endDateStr: "2026-09-20",
  timezone: DEFAULT_TIMEZONE,
});

assert(expiredRun.generatedTasks.length === 0, "EXPIRED rule (endDate < start) generated 0 tasks");
assert(expiredRun.updatedRules[0].status === "EXPIRED", "Expired rule status updated to EXPIRED");

// ----------------------------------------------------
// 4. Templates & Example Verification
// ----------------------------------------------------
console.log("\n4. Verifying Reusable Templates & Shooting Page Example...");

const templates = getAllTemplates();
assert(templates.length === 5, `5 Reusable templates available (Found ${templates.length})`);

const shootingTemplate = RECURRING_TEMPLATES.OFFICE_DAILY_CONTENT;
assert(shootingTemplate !== undefined, "Office Daily Content template exists");
assert(shootingTemplate.workspaceId === "office", "Template workspace is office");
assert(shootingTemplate.dueTime === "13:15", "Template due time is 1:15 PM (13:15)");
assert(shootingTemplate.recurrenceType === "WEEKDAYS", "Template recurrence is Monday-Friday (WEEKDAYS)");

const expectedChecklist = [
  "Check new content",
  "Select content",
  "Edit",
  "Caption",
  "Hashtags",
  "Upload",
  "Verify upload",
];

const checklistMatches = expectedChecklist.every((item, idx) => shootingTemplate.checklist[idx] === item);
assert(checklistMatches, "Shooting Page template has all 7 mandatory checklist items in exact order");

// Verify generated tasks inherit subtasks
const templateRule = {
  ...mockDailyRule,
  id: "rule-shooting",
  checklist: shootingTemplate.checklist,
};

const templateTaskRun = generateTaskInstancesForWindow({
  rules: [templateRule],
  existingTasks: [],
  startDateStr: "2026-09-14",
  endDateStr: "2026-09-14",
});

assert(templateTaskRun.generatedTasks.length === 1, "Generated 1 task instance for template rule");
const generatedTask = templateTaskRun.generatedTasks[0];
assert(generatedTask.subtasks.length === 7, "Generated task has exactly 7 checklist subtasks");
assert(generatedTask.subtasks[0].title === "Check new content", "Subtask 1 is 'Check new content'");
assert(generatedTask.subtasks[6].title === "Verify upload", "Subtask 7 is 'Verify upload'");
assert(generatedTask.recurringRuleId === "rule-shooting", "Task has recurringRuleId reference");
assert(generatedTask.isRecurring === true, "Task has isRecurring = true");

// ----------------------------------------------------
// 5. Timezone Handling Verification
// ----------------------------------------------------
console.log("\n5. Verifying Timezone Accuracy (Asia/Karachi)...");

const fixedDate = new Date("2026-09-17T20:30:00Z"); // 20:30 UTC = 01:30 Next Day in Asia/Karachi (UTC+5)
const karachiParts = getDatePartsInTimezone(fixedDate, "Asia/Karachi");
assert(karachiParts.day === 18, "UTC 20:30 correctly translates to Day 18 in Asia/Karachi (+5h)");
assert(karachiParts.hour === 1, "UTC 20:30 correctly translates to 01:30 AM in Asia/Karachi");

// Next occurrence calculation
const nextOccTest = calculateNextOccurrence(mockWeekdaysRule, "2026-09-18", "Asia/Karachi");
assert(nextOccTest !== null, "calculateNextOccurrence returns valid upcoming timestamp");
assert(nextOccTest.nextDate >= "2026-09-18", "Next occurrence date is on or after check date");

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log("\n==================================================");
if (failed) {
  console.error("❌ SOME PHASE 7 RECURRING VERIFICATIONS FAILED!");
  process.exit(1);
} else {
  console.log("✅ ALL PHASE 7 RECURRING AUTOMATED TESTS PASSED!");
  console.log("==================================================");
  process.exit(0);
}
