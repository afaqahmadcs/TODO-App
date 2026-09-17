import assert from "node:assert/strict";

console.log("===============================================================");
console.log("🧪 RUNNING AFAQ TASKFLOW PRODUCTION ANALYTICS & DASHBOARD TESTS");
console.log("===============================================================\n");

// Dynamically import analyticsService and taskService
const { analyticsService, formatMinutes } = await import("../src/services/analyticsService.ts");
const { taskService } = await import("../src/services/taskService.ts");

// --------------------------------------------------------------------------
// TEST 1: formatMinutes helper accuracy
// --------------------------------------------------------------------------
console.log("▶ TEST 1: Minute formatting utility...");
assert.equal(formatMinutes(0), "0m");
assert.equal(formatMinutes(45), "45m");
assert.equal(formatMinutes(60), "1h");
assert.equal(formatMinutes(125), "2h 5m");
assert.equal(formatMinutes(1000), "16h 40m");
console.log("  ✅ Minute formatting correctly handles zero, sub-hour, exact hour, and compound hours.");

// --------------------------------------------------------------------------
// TEST 2: Dashboard telemetry calculation using live tasks
// --------------------------------------------------------------------------
console.log("\n▶ TEST 2: Dashboard telemetry from task data...");
const telemetry = await analyticsService.getDashboardTelemetry();

assert(typeof telemetry.totalTasks === "number", "totalTasks should be numeric");
assert(typeof telemetry.completedTasks === "number", "completedTasks should be numeric");
assert(typeof telemetry.pendingTasks === "number", "pendingTasks should be numeric");
assert(typeof telemetry.overdueTasks === "number", "overdueTasks should be numeric");
assert(telemetry.totalTasks >= telemetry.completedTasks, "totalTasks must be >= completedTasks");
assert.equal(
  telemetry.totalTasks,
  telemetry.completedTasks + telemetry.pendingTasks,
  "totalTasks must equal completed + pending"
);
console.log(`  ✅ Live telemetry validated: ${telemetry.totalTasks} total, ${telemetry.completedTasks} completed, ${telemetry.pendingTasks} pending, ${telemetry.overdueTasks} overdue.`);

// --------------------------------------------------------------------------
// TEST 3: Workspace Statistics for all 4 workspaces
// --------------------------------------------------------------------------
console.log("\n▶ TEST 3: Workspace Statistics calculations (Office, Personal, College, Web Development)...");
const workspaces = await analyticsService.getWorkspaceStatistics();
assert.equal(workspaces.length, 4, "Must return exactly 4 workspace statistics");

const workspaceIds = workspaces.map((w) => w.id);
assert(workspaceIds.includes("office"), "Must include Office workspace");
assert(workspaceIds.includes("personal"), "Must include Personal workspace");
assert(workspaceIds.includes("college"), "Must include College workspace");
assert(workspaceIds.includes("web-development"), "Must include Web Development workspace");

for (const ws of workspaces) {
  assert(typeof ws.totalTasks === "number", `${ws.name} totalTasks must be number`);
  assert(typeof ws.completed === "number", `${ws.name} completed must be number`);
  assert(typeof ws.pending === "number", `${ws.name} pending must be number`);
  assert(typeof ws.completionPercentage === "number", `${ws.name} completionPercentage must be number`);
  assert(ws.completionPercentage >= 0 && ws.completionPercentage <= 100, `${ws.name} completionPercentage must be between 0 and 100`);
  assert(typeof ws.timeSpentMinutes === "number", `${ws.name} timeSpentMinutes must be number`);
  assert(typeof ws.timeSpentFormatted === "string", `${ws.name} timeSpentFormatted must be formatted string`);
  console.log(`  - [${ws.name}]: ${ws.completed}/${ws.totalTasks} completed (${ws.completionPercentage}%) | Time: ${ws.timeSpentFormatted}`);
}
console.log("  ✅ All 4 workspaces validated with total, completed, pending, completion %, and time spent.");

// --------------------------------------------------------------------------
// TEST 4: Productivity Metrics (Completion Rate, On-Time Rate, Focus Time, Streak)
// --------------------------------------------------------------------------
console.log("\n▶ TEST 4: Productivity Metrics calculations...");
const { productivityMetrics } = telemetry;
assert(typeof productivityMetrics.completionRate === "number", "completionRate must be number");
assert(typeof productivityMetrics.onTimeRate === "number", "onTimeRate must be number");
assert(typeof productivityMetrics.focusTimeMinutes === "number", "focusTimeMinutes must be number");
assert(typeof productivityMetrics.averageTaskDurationMinutes === "number", "averageTaskDurationMinutes must be number");
assert(typeof productivityMetrics.overdueTasks === "number", "overdueTasks must be number");
assert(typeof productivityMetrics.currentStreak === "number", "currentStreak must be number");
assert(productivityMetrics.currentStreak >= 1, "currentStreak must be at least 1");

console.log(`  ✅ Completion Rate: ${productivityMetrics.completionRate}%`);
console.log(`  ✅ On-Time Rate: ${productivityMetrics.onTimeRate}%`);
console.log(`  ✅ Focus Time: ${productivityMetrics.focusTimeFormatted}`);
console.log(`  ✅ Average Duration: ${productivityMetrics.averageTaskDurationMinutes}m`);
console.log(`  ✅ Current Streak: ${productivityMetrics.currentStreak} days`);

// --------------------------------------------------------------------------
// TEST 5: Transparent Productivity Score Formula Verification
// --------------------------------------------------------------------------
console.log("\n▶ TEST 5: Transparent Productivity Score (Formula audit - NO random numbers)...");
const tasks = await taskService.getTasks();
const scoreBreakdown = analyticsService.calculateProductivityScoreBreakdown(tasks, 1000, 14);

assert(typeof scoreBreakdown.overallScore === "number", "Score must be numeric");
assert(scoreBreakdown.overallScore >= 0 && scoreBreakdown.overallScore <= 100, "Score must be 0-100");
assert(scoreBreakdown.completionReliabilityScore >= 0 && scoreBreakdown.completionReliabilityScore <= 100);
assert(scoreBreakdown.onTimePrecisionScore >= 0 && scoreBreakdown.onTimePrecisionScore <= 100);
assert(scoreBreakdown.workflowConsistencyScore >= 0 && scoreBreakdown.workflowConsistencyScore <= 100);
assert(scoreBreakdown.focusDepthScore >= 0 && scoreBreakdown.focusDepthScore <= 100);

// Verify weighted composite
const expectedWeighted = Math.round(
  0.30 * scoreBreakdown.completionReliabilityScore +
  0.25 * scoreBreakdown.onTimePrecisionScore +
  0.25 * scoreBreakdown.workflowConsistencyScore +
  0.20 * scoreBreakdown.focusDepthScore
);
assert.equal(scoreBreakdown.overallScore, expectedWeighted, "Score must match exact weighted formula");
console.log(`  ✅ Score breakdown: Total=${scoreBreakdown.overallScore}% (${scoreBreakdown.tier} / ${scoreBreakdown.mode})`);
console.log(`     - Completion Reliability (30%): ${scoreBreakdown.completionReliabilityScore}%`);
console.log(`     - On-Time Precision (25%): ${scoreBreakdown.onTimePrecisionScore}%`);
console.log(`     - Workflow Consistency (25%): ${scoreBreakdown.workflowConsistencyScore}%`);
console.log(`     - Focus Depth (20%): ${scoreBreakdown.focusDepthScore}%`);
console.log(`  ✅ Formula: ${scoreBreakdown.formulaDescription}`);

// --------------------------------------------------------------------------
// TEST 6: Focus Time Metrics from focus_sessions (Today, This Week, This Month)
// --------------------------------------------------------------------------
console.log("\n▶ TEST 6: Focus Time calculation from focus_sessions...");
const focusMetrics = await analyticsService.getFocusTimeMetrics();

assert(typeof focusMetrics.todayMinutes === "number", "todayMinutes must be numeric");
assert(typeof focusMetrics.thisWeekMinutes === "number", "thisWeekMinutes must be numeric");
assert(typeof focusMetrics.thisMonthMinutes === "number", "thisMonthMinutes must be numeric");
assert(focusMetrics.thisWeekMinutes >= focusMetrics.todayMinutes, "thisWeekMinutes must be >= todayMinutes");
assert(focusMetrics.thisMonthMinutes >= focusMetrics.thisWeekMinutes, "thisMonthMinutes must be >= thisWeekMinutes");

console.log(`  - Today: ${focusMetrics.todayFormatted} (${focusMetrics.todayGoalPercent}% of goal)`);
console.log(`  - This Week: ${focusMetrics.thisWeekFormatted} (${focusMetrics.thisWeekGoalPercent}% of goal)`);
console.log(`  - This Month: ${focusMetrics.thisMonthFormatted} (${focusMetrics.thisMonthGoalPercent}% of goal)`);
console.log(`  - Daily Average: ${focusMetrics.dailyAverageFormatted}`);
console.log("  ✅ Focus time telemetry verified across all 3 temporal windows.");

// --------------------------------------------------------------------------
// TEST 7: Log new Focus Session and verify live increment
// --------------------------------------------------------------------------
console.log("\n▶ TEST 7: Focus Session live mutation test...");
const initialWeekMinutes = focusMetrics.thisWeekMinutes;
const loggedSession = await analyticsService.logFocusSession("task-test-session", 30, true);
assert(loggedSession.id, "Logged session must receive an ID");
assert.equal(loggedSession.durationMinutes, 30, "Duration must be 30 minutes");

const refreshedFocus = await analyticsService.getFocusTimeMetrics();
assert(
  refreshedFocus.thisWeekMinutes >= initialWeekMinutes + 30,
  "Weekly focus minutes must increase by at least 30 after logging a session"
);
console.log(`  ✅ Successfully logged 30m focus session (${loggedSession.id}). Weekly focus updated: ${refreshedFocus.thisWeekFormatted}`);

// --------------------------------------------------------------------------
// TEST 8: Monday - Sunday Weekly Velocity Distribution
// --------------------------------------------------------------------------
console.log("\n▶ TEST 8: Weekly Velocity distribution (Monday to Sunday)...");
const weeklyVelocity = await analyticsService.getWeeklyVelocity();
assert.equal(weeklyVelocity.length, 7, "Weekly velocity must contain exactly 7 days (Mon-Sun)");

const expectedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
weeklyVelocity.forEach((dayItem, idx) => {
  assert.equal(dayItem.day, expectedDays[idx], `Day ${idx} should be ${expectedDays[idx]}`);
  assert(typeof dayItem.tasksCompleted === "number", `${dayItem.day} tasksCompleted must be number`);
  assert(dayItem.heightPercent >= 0 && dayItem.heightPercent <= 100, `${dayItem.day} heightPercent must be 0-100`);
  assert(dayItem.workspaceBreakdown, `${dayItem.day} must include multi-domain breakdown`);
});

const peakDay = weeklyVelocity.find((d) => d.isPeak);
assert(peakDay, "Must identify a peak day");
console.log(`  ✅ Velocity Mon-Sun verified. Peak day identified: ${peakDay.fullDay} (${peakDay.tasksCompleted} tasks completed).`);

// --------------------------------------------------------------------------
// TEST 9: Weekly Review Summary
// --------------------------------------------------------------------------
console.log("\n▶ TEST 9: Weekly Executive Review summary...");
const weeklyReview = await analyticsService.getWeeklyReview();

assert(typeof weeklyReview.tasksCompleted === "number", "tasksCompleted must be number");
assert(typeof weeklyReview.overdueTasks === "number", "overdueTasks must be number");
assert(weeklyReview.bestWorkspace.name, "bestWorkspace must have name");
assert(weeklyReview.mostProductiveDay.day, "mostProductiveDay must have day");
assert(weeklyReview.focusTimeFormatted, "focusTimeFormatted must be present");
assert(typeof weeklyReview.currentStreak === "number", "currentStreak must be number");
assert(weeklyReview.actionableDirective, "actionableDirective must be provided");

console.log(`  - Tasks Completed: ${weeklyReview.tasksCompleted}`);
console.log(`  - Overdue Tasks: ${weeklyReview.overdueTasks}`);
console.log(`  - Best Workspace: ${weeklyReview.bestWorkspace.name} (${weeklyReview.bestWorkspace.completionRate}%)`);
console.log(`  - Most Productive Day: ${weeklyReview.mostProductiveDay.day}`);
console.log(`  - Focus Time: ${weeklyReview.focusTimeFormatted}`);
console.log(`  - Streak: ${weeklyReview.currentStreak} days`);
console.log(`  - Actionable Directive: "${weeklyReview.actionableDirective}"`);
console.log("  ✅ Weekly Review synthesis fully verified.");

console.log("\n===============================================================");
console.log("🎉 ALL 9 TEST SUITES PASSED FLAWLESSLY WITH 100% SUCCESS!");
console.log("===============================================================\n");
