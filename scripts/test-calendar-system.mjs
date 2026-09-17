/**
 * Test Suite: Complete Calendar System (Phase 8)
 * Verifies unified event aggregation, time calculations, zero-duplication for recurring projections,
 * academic & web dev class schedule projections, and drag & drop / duration resizing updates.
 */

import assert from "node:assert";
import {
  timeStringToMinutes,
  minutesToTimeString,
  addMinutesToTime,
  aggregateCalendarEvents,
  COLLEGE_CLASS_TEMPLATES,
  WEB_DEV_CLASS_TEMPLATES,
  SCHEDULED_DEADLINES,
} from "../src/lib/calendarEvents.ts";
import { taskService } from "../src/services/taskService.ts";

let passedCount = 0;
let totalCount = 0;

function it(desc, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✔ ${desc}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✖ ${desc}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log("\n🧪 Running Calendar System Test Suite (Phase 8)...\n");

  // =========================================================================
  // SUITE 1: Time Conversion & Calculation Helpers
  // =========================================================================
  console.log("▶ [Suite 1] Time Conversion & Duration Helpers");

  it("converts 24-hour time string to minutes from midnight", () => {
    assert.strictEqual(timeStringToMinutes("00:00"), 0);
    assert.strictEqual(timeStringToMinutes("08:00"), 480);
    assert.strictEqual(timeStringToMinutes("13:15"), 795);
    assert.strictEqual(timeStringToMinutes("14:30"), 870);
    assert.strictEqual(timeStringToMinutes("23:59"), 1439);
  });

  it("converts 12-hour AM/PM time strings to minutes from midnight", () => {
    assert.strictEqual(timeStringToMinutes("08:00 AM"), 480);
    assert.strictEqual(timeStringToMinutes("1:15 PM"), 795);
    assert.strictEqual(timeStringToMinutes("12:00 PM"), 720);
    assert.strictEqual(timeStringToMinutes("12:00 AM"), 0);
  });

  it("converts minutes to 24-hour time string", () => {
    assert.strictEqual(minutesToTimeString(480), "08:00");
    assert.strictEqual(minutesToTimeString(795), "13:15");
    assert.strictEqual(minutesToTimeString(870), "14:30");
  });

  it("correctly computes end time adding duration minutes", () => {
    assert.strictEqual(addMinutesToTime("08:00", 90), "09:30");
    assert.strictEqual(addMinutesToTime("13:15", 75), "14:30");
    assert.strictEqual(addMinutesToTime("16:00", 120), "18:00");
  });

  // =========================================================================
  // SUITE 2: Academic and Web Dev Class Templates
  // =========================================================================
  console.log("\n▶ [Suite 2] College & Web Dev Class Schedules");

  it("defines college classes with correct weekdays and time blocks", () => {
    const cs301 = COLLEGE_CLASS_TEMPLATES.find((c) => c.subject === "CS301");
    assert.ok(cs301, "CS301 must exist");
    assert.deepStrictEqual(cs301.daysOfWeek, [1, 3], "CS301 must run Monday and Wednesday");
    assert.strictEqual(cs301.startTime, "08:00");
    assert.strictEqual(cs301.endTime, "09:30");
    assert.strictEqual(cs301.durationMin, 90);

    const cs340 = COLLEGE_CLASS_TEMPLATES.find((c) => c.subject === "CS340");
    assert.ok(cs340, "CS340 must exist");
    assert.deepStrictEqual(cs340.daysOfWeek, [1, 3], "CS340 must run Monday and Wednesday");
    assert.strictEqual(cs340.startTime, "11:30");
    assert.strictEqual(cs340.endTime, "13:00");
  });

  it("defines web development classes for Monday & Tuesday 4:00 PM - 6:00 PM", () => {
    assert.strictEqual(WEB_DEV_CLASS_TEMPLATES.length, 2);
    const monClass = WEB_DEV_CLASS_TEMPLATES.find((c) => c.daysOfWeek.includes(1));
    assert.ok(monClass, "Monday web class must exist");
    assert.strictEqual(monClass.startTime, "16:00");
    assert.strictEqual(monClass.endTime, "18:00");
    assert.strictEqual(monClass.durationMin, 120);

    const tueClass = WEB_DEV_CLASS_TEMPLATES.find((c) => c.daysOfWeek.includes(2));
    assert.ok(tueClass, "Tuesday web class must exist");
    assert.strictEqual(tueClass.startTime, "16:00");
    assert.strictEqual(tueClass.endTime, "18:00");
  });

  // =========================================================================
  // SUITE 3: Unified Calendar Event Aggregator & Zero-Duplication
  // =========================================================================
  console.log("\n▶ [Suite 3] Unified Calendar Event Aggregation");

  it("projects standard tasks, classes, and deadlines onto window dates", () => {
    const mockTasks = [
      {
        id: "task-test-1",
        title: "Test Shooting Task",
        workspaceId: "office",
        status: "todo",
        priority: "high",
        dueDate: "2025-09-15", // Monday
        dueTime: "13:15",
        estimatedDurationMin: 75,
      },
    ];

    const mockRules = [
      {
        id: "rule-shooting",
        title: "Daily Shooting Page Management",
        recurrenceType: "WEEKDAYS",
        workspaceId: "office",
        officePageId: "shooting-page",
        dueTime: "13:15",
        estimatedDurationMin: 75,
        priority: "high",
        status: "active",
        startDate: "2025-09-01",
        daysOfWeek: [1, 2, 3, 4, 5],
      },
    ];

    // Mon Sep 15, Tue Sep 16, Wed Sep 17
    const windowDates = ["2025-09-15", "2025-09-16", "2025-09-17"];

    const events = aggregateCalendarEvents({
      tasks: mockTasks,
      recurringRules: mockRules,
      projects: [],
      windowDates,
    });

    // 1. Task test-1 should be present on 2025-09-15
    const t1Event = events.find((e) => e.id === "task-task-test-1");
    assert.ok(t1Event, "Task test 1 must be present");
    assert.strictEqual(t1Event.date, "2025-09-15");
    assert.strictEqual(t1Event.startTime, "13:15");
    assert.strictEqual(t1Event.endTime, "14:30");

    // 2. CS301 should be projected on Monday (2025-09-15) and Wednesday (2025-09-17)
    const cs301Mon = events.find(
      (e) => e.date === "2025-09-15" && e.title.includes("CS301")
    );
    assert.ok(cs301Mon, "CS301 must be projected on Monday 2025-09-15");

    const cs301Wed = events.find(
      (e) => e.date === "2025-09-17" && e.title.includes("CS301")
    );
    assert.ok(cs301Wed, "CS301 must be projected on Wednesday 2025-09-17");

    // 3. Web Dev class on Monday (16:00 - 18:00)
    const webDevMon = events.find(
      (e) => e.date === "2025-09-15" && e.sourceType === "web_class"
    );
    assert.ok(webDevMon, "Web Dev class must be projected on Monday 2025-09-15");
    assert.strictEqual(webDevMon.startTime, "16:00");
    assert.strictEqual(webDevMon.endTime, "18:00");
  });

  it("prevents duplicate recurring instances when task already exists for that date", () => {
    const mockTasks = [
      {
        id: "task-shooting-mon",
        title: "Daily Shooting Page Management",
        workspaceId: "office",
        status: "todo",
        priority: "high",
        dueDate: "2025-09-15",
        dueTime: "13:15",
        estimatedDurationMin: 75,
        recurringRuleId: "rule-shooting",
      },
    ];

    const mockRules = [
      {
        id: "rule-shooting",
        title: "Daily Shooting Page Management",
        recurrenceType: "WEEKDAYS",
        workspaceId: "office",
        dueTime: "13:15",
        estimatedDurationMin: 75,
        priority: "high",
        status: "active",
        startDate: "2025-09-01",
        daysOfWeek: [1, 2, 3, 4, 5],
      },
    ];

    const windowDates = ["2025-09-15", "2025-09-16"];

    const events = aggregateCalendarEvents({
      tasks: mockTasks,
      recurringRules: mockRules,
      projects: [],
      windowDates,
    });

    // On 2025-09-15, there should be EXACTLY ONE Shooting Page Management event (the task)
    const shootingOnMon = events.filter(
      (e) => e.date === "2025-09-15" && e.title.includes("Shooting Page")
    );
    assert.strictEqual(
      shootingOnMon.length,
      1,
      "Must not duplicate shooting page event on Monday"
    );
    assert.strictEqual(shootingOnMon[0].id, "task-task-shooting-mon");

    // On 2025-09-16, there should be the projected synthetic event for the rule
    const shootingOnTue = events.filter(
      (e) => e.date === "2025-09-16" && e.title.includes("Shooting Page")
    );
    assert.strictEqual(
      shootingOnTue.length,
      1,
      "Must project synthetic event on Tuesday where task does not exist yet"
    );
    assert.strictEqual(shootingOnTue[0].sourceType, "recurring");
  });

  // =========================================================================
  // SUITE 4: Drag & Drop Reschedule and Duration Resize via TaskService
  // =========================================================================
  console.log("\n▶ [Suite 4] Drag & Drop Rescheduling and Duration Resize");

  it("updates task dueDate and dueTime via taskService", async () => {
    const created = await taskService.createTask({
      title: "Reschedule Test Task",
      workspaceId: "web-development",
      dueDate: "2025-09-15",
      dueTime: "10:00",
      estimatedDurationMin: 60,
    });

    assert.ok(created, "Task must be created");
    assert.strictEqual(created.dueDate, "2025-09-15");
    assert.strictEqual(created.dueTime, "10:00");

    // Simulate Drag & Drop to new slot: 2025-09-18 at 15:30
    const rescheduled = await taskService.updateTask(created.id, {
      dueDate: "2025-09-18",
      dueTime: "15:30",
    });

    assert.ok(rescheduled, "Updated task must be returned");
    assert.strictEqual(rescheduled.dueDate, "2025-09-18");
    assert.strictEqual(rescheduled.dueTime, "15:30");
  });

  it("updates task duration (resize) via taskService", async () => {
    const created = await taskService.createTask({
      title: "Duration Resize Test Task",
      workspaceId: "college",
      dueDate: "2025-09-16",
      dueTime: "11:00",
      estimatedDurationMin: 45,
    });

    assert.strictEqual(created.estimatedDurationMin, 45);

    // Simulate Card Resize handle extending duration to 90 mins
    const resized = await taskService.updateTask(created.id, {
      estimatedDurationMin: 90,
    });

    assert.ok(resized, "Updated task must be returned");
    assert.strictEqual(resized.estimatedDurationMin, 90);
  });

  // =========================================================================
  // SUITE 5: All-Day Deadlines & Milestones
  // =========================================================================
  console.log("\n▶ [Suite 5] Deadlines & All-Day Milestones");

  it("includes all-day deadlines in the calendar projection", () => {
    const windowDates = ["2025-09-16", "2025-09-19"];
    const events = aggregateCalendarEvents({
      tasks: [],
      recurringRules: [],
      projects: [],
      windowDates,
    });

    const sprintGoal = events.find((e) => e.title === "Sprint Goal 03 Complete");
    assert.ok(sprintGoal, "Sprint Goal deadline must be present");
    assert.strictEqual(sprintGoal.isAllDay, true);
    assert.strictEqual(sprintGoal.date, "2025-09-16");

    const cs301Lab = events.find((e) => e.title === "CS301 Lab Due (Midnight)");
    assert.ok(cs301Lab, "CS301 Lab deadline must be present");
    assert.strictEqual(cs301Lab.isAllDay, true);
    assert.strictEqual(cs301Lab.date, "2025-09-19");
  });

  console.log(`\n======================================================`);
  console.log(`Test Results: ${passedCount}/${totalCount} assertions passed.`);
  console.log(`======================================================\n`);

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests();
