/**
 * Automated Verification Script for Phase 4: Task Management System
 * Tests: create, read, update, delete, complete, subtasks, filter, sort
 */

import { taskService } from "../src/services/taskService.ts";

async function runTests() {
  console.log("🚀 [Phase 4 Test Suite] Starting Task Service Verification...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. READ ALL TASKS
    console.log("--- 1. Testing Read All Tasks ---");
    const initialTasks = await taskService.getTasks();
    assert(Array.isArray(initialTasks) && initialTasks.length >= 6, `Retrieved ${initialTasks?.length} initial tasks`);

    // 2. CREATE TASK
    console.log("\n--- 2. Testing Task Creation ---");
    const newTask = await taskService.createTask({
      title: "Test Reel Editing for ZK Production",
      description: "Automated test task description",
      workspaceId: "office",
      officePageId: "zk-production",
      priority: "high",
      status: "todo",
      dueDate: new Date().toISOString().split("T")[0],
      dueTime: "16:30",
      estimatedDurationMin: 45,
      tags: ["test", "zk", "4k"],
      subtasks: ["Review test clip 1", "Review test clip 2"],
      notes: "Test note instructions",
    });

    assert(Boolean(newTask && newTask.id), `Task created successfully with ID: ${newTask.id}`);
    assert(newTask.title === "Test Reel Editing for ZK Production", "Title matches creation payload");
    assert(newTask.workspaceId === "office", "Workspace matches 'office'");
    assert(newTask.priority === "high", "Priority matches 'high'");
    assert(newTask.subtasks && newTask.subtasks.length === 2, `Created ${newTask.subtasks?.length} initial subtasks`);

    // 3. READ SINGLE TASK BY ID
    console.log("\n--- 3. Testing Get Task By ID ---");
    const fetched = await taskService.getTaskById(newTask.id);
    assert(Boolean(fetched && fetched.id === newTask.id), "Successfully retrieved task by ID");
    assert(fetched?.title === newTask.title, "Fetched task title is accurate");

    // 4. UPDATE TASK PROPERTIES
    console.log("\n--- 4. Testing Task Editing ---");
    const updated = await taskService.updateTask(newTask.id, {
      title: "Updated Reel Editing Title",
      priority: "medium",
      estimatedDurationMin: 60,
      tags: ["test", "updated"],
    });

    assert(updated?.title === "Updated Reel Editing Title", "Task title updated successfully");
    assert(updated?.priority === "medium", "Task priority updated to 'medium'");
    assert(updated?.estimatedDurationMin === 60, "Estimated duration updated to 60 mins");

    // 5. UPDATE STATUS (TODO -> IN_PROGRESS -> REVIEW -> READY -> COMPLETED)
    console.log("\n--- 5. Testing Status Flow & Task Completion ---");
    const inProg = await taskService.updateTaskStatus(newTask.id, "in_progress");
    assert(inProg?.status === "in_progress", "Status transitioned to IN_PROGRESS");

    const review = await taskService.updateTaskStatus(newTask.id, "review");
    assert(review?.status === "review", "Status transitioned to REVIEW");

    const ready = await taskService.updateTaskStatus(newTask.id, "ready");
    assert(ready?.status === "ready", "Status transitioned to READY");

    const completed = await taskService.updateTaskStatus(newTask.id, "completed");
    assert(completed?.status === "completed" && completed?.isCompleted, "Status transitioned to COMPLETED and isCompleted is true");
    assert(Boolean(completed?.completedAt), "completedAt timestamp is recorded");

    // 6. TOGGLE COMPLETION
    console.log("\n--- 6. Testing Toggle Completion ---");
    const uncompleted = await taskService.toggleTaskCompletion(newTask.id);
    assert(uncompleted?.status === "todo" && !uncompleted?.isCompleted, "Task successfully marked incomplete via toggle");

    // 7. SUBTASKS CRUD
    console.log("\n--- 7. Testing Subtasks CRUD ---");
    const sub = await taskService.createSubtask(newTask.id, "Newly created subtask");
    assert(Boolean(sub && sub.id), `Subtask created with ID: ${sub?.id}`);

    if (sub) {
      const updatedSub = await taskService.updateSubtask(sub.id, { completed: true, title: "Modified subtask title" });
      assert(updatedSub?.completed === true, "Subtask marked as completed");
      assert(updatedSub?.title === "Modified subtask title", "Subtask title modified");

      const deletedSub = await taskService.deleteSubtask(sub.id);
      assert(deletedSub === true, "Subtask deleted successfully");
    }

    // 8. FILTERS & TABS
    console.log("\n--- 8. Testing Filters & Tabs ---");
    const todayTasks = await taskService.getTasks({ tab: "today" });
    assert(Array.isArray(todayTasks), `Filtered by 'today' tab (${todayTasks.length} tasks)`);

    const officeTasks = await taskService.getTasks({ workspaceId: "office" });
    assert(officeTasks.every((t) => t.workspaceId === "office"), "Workspace filter returned only office tasks");

    const highTasks = await taskService.getTasks({ priority: "high" });
    assert(highTasks.every((t) => t.priority === "high"), "Priority filter returned only high priority tasks");

    const searchedTasks = await taskService.getTasks({ searchQuery: "Reel" });
    assert(searchedTasks.length > 0, `Search query 'Reel' found ${searchedTasks.length} matching tasks`);

    // 9. SORTING
    console.log("\n--- 9. Testing Sorting ---");
    const sortedByPriority = await taskService.getTasks({ sortBy: "priority", sortOrder: "desc" });
    assert(sortedByPriority.length > 0, "Sorted by priority successfully");

    const sortedByDueTime = await taskService.getTasks({ sortBy: "due_time", sortOrder: "asc" });
    assert(sortedByDueTime.length > 0, "Sorted by due time successfully");

    // 10. TASK STATS
    console.log("\n--- 10. Testing Dashboard Statistics ---");
    const stats = await taskService.getTaskStats();
    assert(typeof stats.total === "number" && stats.total > 0, `Stats total: ${stats.total}`);
    assert(typeof stats.completed === "number", `Stats completed: ${stats.completed}`);
    assert(typeof stats.pending === "number", `Stats pending: ${stats.pending}`);
    assert(typeof stats.rate === "number", `Stats rate: ${stats.rate}%`);

    // 11. TASK DELETION
    console.log("\n--- 11. Testing Task Deletion ---");
    const deleted = await taskService.deleteTask(newTask.id);
    assert(deleted === true, "Task deleted successfully");

    const verifyDeleted = await taskService.getTaskById(newTask.id);
    assert(verifyDeleted === null, "Verified deleted task no longer exists");

  } catch (error) {
    console.error("❌ Exception occurred during test run:", error);
    failed++;
  }

  console.log("\n==========================================");
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
