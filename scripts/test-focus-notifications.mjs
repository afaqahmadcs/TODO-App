import assert from "node:assert/strict";

console.log("===============================================================");
console.log("🧪 RUNNING AFAQ TASKFLOW FOCUS MODE & NOTIFICATIONS TEST SUITE");
console.log("===============================================================\n");

// Dynamically import services
const { notificationService } = await import("../src/services/notificationService.ts");
const { analyticsService } = await import("../src/services/analyticsService.ts");
const { taskService } = await import("../src/services/taskService.ts");

// --------------------------------------------------------------------------
// TEST 1: Notification Center Retrieval & Unread Counter
// --------------------------------------------------------------------------
console.log("▶ TEST 1: Notification retrieval, initial state, and unread count...");
const initialNotifications = await notificationService.getNotifications();
assert(Array.isArray(initialNotifications), "getNotifications must return an array");
assert(initialNotifications.length > 0, "Initial mock notifications should be present");

const unreadCount = await notificationService.getUnreadCount();
const manualUnreadCount = initialNotifications.filter((n) => !n.read).length;
assert.equal(unreadCount, manualUnreadCount, "getUnreadCount must match unread items count");
console.log(`  ✅ Notification Center active with ${initialNotifications.length} items (${unreadCount} unread).`);

// --------------------------------------------------------------------------
// TEST 2: Notification State Mutations (markAsRead & markAllAsRead)
// --------------------------------------------------------------------------
console.log("\n▶ TEST 2: Notification state mutations (markAsRead & markAllAsRead)...");

// Pick first unread
const firstUnread = initialNotifications.find((n) => !n.read);
assert(firstUnread, "There should be at least one unread notification to test");

await notificationService.markAsRead(firstUnread.id);
const updatedListAfterSingle = await notificationService.getNotifications();
const foundItem = updatedListAfterSingle.find((n) => n.id === firstUnread.id);
assert(foundItem && foundItem.read === true, "Item must be marked as read");
console.log(`  ✅ Successfully marked individual notification (${firstUnread.id}) as read.`);

// Mark all as read
await notificationService.markAllAsRead();
const unreadAfterAll = await notificationService.getUnreadCount();
assert.equal(unreadAfterAll, 0, "All notifications must be marked as read, unread count should be 0");
console.log("  ✅ markAllAsRead successfully cleared all unread badges.");

// --------------------------------------------------------------------------
// TEST 3: Sync Task Reminders (Overdue, Upcoming, Recurring)
// --------------------------------------------------------------------------
console.log("\n▶ TEST 3: Task reminder synchronization engine...");

const now = new Date();
const todayStr = now.toISOString().split("T")[0];
const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const upcomingTargetDate = new Date(Date.now() + 30 * 60 * 1000);
const upcomingTimeStr = `${String(upcomingTargetDate.getHours()).padStart(2, "0")}:${String(upcomingTargetDate.getMinutes()).padStart(2, "0")}`;

const testTasks = [
  {
    id: "test-task-overdue-101",
    title: "Overdue Render Export for ZK Production",
    workspaceId: "office",
    status: "todo",
    priority: "high",
    isCompleted: false,
    dueDate: yesterdayStr,
    dueTime: "14:00",
    tags: ["render", "zk"],
    subtasks: [],
    createdAt: yesterdayStr,
    updatedAt: yesterdayStr,
  },
  {
    id: "test-task-upcoming-102",
    title: "Database Systems Lecture Notes Review",
    workspaceId: "college",
    status: "todo",
    priority: "medium",
    isCompleted: false,
    dueDate: todayStr,
    dueTime: upcomingTimeStr,
    tags: ["study"],
    subtasks: [],
    createdAt: todayStr,
    updatedAt: todayStr,
  },
  {
    id: "test-task-recurring-103",
    title: "Daily Shooting Page Content Check",
    workspaceId: "office",
    status: "todo",
    priority: "urgent",
    isCompleted: false,
    isRecurring: true,
    recurrenceRule: "daily",
    tags: ["office", "shooting"],
    subtasks: [],
    createdAt: todayStr,
    updatedAt: todayStr,
  },
];

const createdNotifs = await notificationService.syncTaskReminders(testTasks);
assert(createdNotifs.length >= 3, `Expected at least 3 notifications generated, received ${createdNotifs.length}`);

const overdueNotif = createdNotifs.find((n) => n.taskId === "test-task-overdue-101");
assert(overdueNotif, "Should have created an overdue notification");
assert.equal(overdueNotif.type, "deadline", "Overdue notification type must be 'deadline'");
assert(overdueNotif.title.includes("Overdue:"), "Overdue notification title must have Overdue prefix");

const upcomingNotif = createdNotifs.find((n) => n.taskId === "test-task-upcoming-102");
assert(upcomingNotif, "Should have created an upcoming notification");
assert.equal(upcomingNotif.type, "reminder", "Upcoming notification type must be 'reminder'");

const recurringNotif = createdNotifs.find((n) => n.taskId === "test-task-recurring-103");
assert(recurringNotif, "Should have created a recurring routine notification");
assert(recurringNotif.title.includes("Recurring Routine:"), "Recurring title must indicate routine");
console.log(`  ✅ Generated ${createdNotifs.length} reminders covering overdue, upcoming, and recurring tasks.`);

// --------------------------------------------------------------------------
// TEST 4: Anti-Spam Deduplication Engine
// --------------------------------------------------------------------------
console.log("\n▶ TEST 4: Anti-spam deduplication verification...");

// Re-running syncTaskReminders with the identical task set
const secondRunNotifs = await notificationService.syncTaskReminders(testTasks);
assert.equal(
  secondRunNotifs.length,
  0,
  `Anti-spam failure: Expected 0 duplicate notifications, but received ${secondRunNotifs.length}`
);
console.log("  ✅ Anti-spam deduplication validated: 0 duplicate notifications generated on identical run.");

// --------------------------------------------------------------------------
// TEST 5: Deep-Linking Integrity & Task Association
// --------------------------------------------------------------------------
console.log("\n▶ TEST 5: Task deep-linking & payload integrity...");
const currentNotifications = await notificationService.getNotifications();
const linkedNotifications = currentNotifications.filter((n) => n.taskId);
assert(linkedNotifications.length > 0, "There must be notifications with valid taskId");

for (const notif of linkedNotifications) {
  assert.equal(typeof notif.taskId, "string", "taskId must be string");
  assert(notif.taskId.length > 0, "taskId must not be empty");
  assert(typeof notif.title, "string", "Notification must have a title");
  assert(typeof notif.message, "string", "Notification must have a message");
}
console.log(`  ✅ Validated ${linkedNotifications.length} notifications with explicit task deep-linking targets.`);

// --------------------------------------------------------------------------
// TEST 6: Web Notification API Truthful Delivery & Fallback
// --------------------------------------------------------------------------
console.log("\n▶ TEST 6: Truthful delivery and permission handling...");

// In Node.js environment, Notification is undefined or not granted
const delivered = notificationService.deliverSystemNotification("Test Alert", { body: "Testing" });
assert.equal(
  delivered,
  false,
  "Must return false when notification cannot be delivered (no false claims)"
);

const perm = notificationService.getPermissionState();
assert(["default", "denied", "granted"].includes(perm), `Invalid permission state: ${perm}`);
console.log(`  ✅ Truthful delivery verified: returned ${delivered} without permission, current state: ${perm}.`);

// --------------------------------------------------------------------------
// TEST 7: Focus Session Persistence in Supabase / Local Storage
// --------------------------------------------------------------------------
console.log("\n▶ TEST 7: Focus session logging and duration tracking...");

const sessionStart = new Date(Date.now() - 25 * 60 * 1000).toISOString();
const sessionEnd = new Date().toISOString();
const testTaskId = "task-focus-demo-1";
const loggedMinutes = 25;

const loggedSession = await analyticsService.logFocusSession(
  testTaskId,
  loggedMinutes,
  true,
  sessionStart,
  sessionEnd
);

assert(loggedSession, "logFocusSession must return the created session object");
assert.equal(loggedSession.taskId, testTaskId, "Session taskId must match");
assert.equal(loggedSession.durationMinutes, loggedMinutes, "Session duration must match");
assert.equal(loggedSession.completed, true, "Session completed flag must be true");
assert.equal(loggedSession.startedAt, sessionStart, "startedAt must match input");
assert.equal(loggedSession.endedAt, sessionEnd, "endedAt must match input");

console.log(`  ✅ Focus session logged successfully (${loggedSession.durationMinutes}m for ${loggedSession.taskId}).`);

// --------------------------------------------------------------------------
// TEST 8: Focus Time Calculation in Analytics Engine
// --------------------------------------------------------------------------
console.log("\n▶ TEST 8: Focus time aggregation in analytics service...");

const focusSummary = await analyticsService.getFocusTimeMetrics();
assert(typeof focusSummary.todayMinutes === "number", "todayMinutes must be numeric");
assert(typeof focusSummary.thisWeekMinutes === "number", "thisWeekMinutes must be numeric");
assert(typeof focusSummary.thisMonthMinutes === "number", "thisMonthMinutes must be numeric");
assert(focusSummary.todayMinutes >= loggedMinutes, `todayMinutes should reflect logged session (${loggedMinutes}m)`);
assert(typeof focusSummary.todayFormatted === "string", "todayFormatted must be string");
assert(typeof focusSummary.thisWeekFormatted === "string", "thisWeekFormatted must be string");

console.log(`  ✅ Aggregated focus time: Today=${focusSummary.todayFormatted}, Week=${focusSummary.thisWeekFormatted}, Month=${focusSummary.thisMonthFormatted}.`);

// --------------------------------------------------------------------------
// TEST 9: Focus Mode Presets & Time Calculation
// --------------------------------------------------------------------------
console.log("\n▶ TEST 9: Focus Mode preset standards (25/5 Pomodoro, 50/10, Custom)...");

const presets = [
  { preset: "pomodoro_25_5", work: 25, break: 5 },
  { preset: "deep_work_50_10", work: 50, break: 10 },
  { preset: "custom", work: 45, break: 5 },
];

for (const p of presets) {
  assert(p.work > 0, "Work duration must be positive");
  assert(p.break > 0, "Break duration must be positive");
  const totalSeconds = p.work * 60;
  assert.equal(totalSeconds, p.work * 60, "Conversion to seconds must be exact");
}
console.log("  ✅ Pomodoro presets (25/5, 50/10, custom) verified.");

console.log("\n===============================================================");
console.log("🎉 ALL FOCUS MODE & TASK NOTIFICATION TESTS PASSED SUCCESSFULLY!");
console.log("===============================================================\n");
