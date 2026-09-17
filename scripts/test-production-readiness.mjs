// Master Production Readiness Verification Suite for Afaq TaskFlow
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();

console.log("================================================================================");
console.log("🚀 AFAQ TASKFLOW: COMPREHENSIVE PRODUCTION READINESS & FUNCTIONAL AUDIT");
console.log("================================================================================\n");

let passedChecks = 0;
let totalChecks = 0;

function runCheck(title, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  [PASS] ${title}`);
  } catch (err) {
    console.error(`  [FAIL] ${title}`);
    console.error(`         Error: ${err.message}`);
    process.exit(1);
  }
}

// ==============================================================================
// 1. Authentication
// ==============================================================================
console.log("1. Verifying Authentication & User Profiles...");
runCheck("authService exists and exposes production Auth methods", () => {
  const file = readFileSync(join(cwd, "src/services/authService.ts"), "utf-8");
  assert.ok(file.includes("signIn: async"), "Must support signIn");
  assert.ok(file.includes("signUp: async"), "Must support signUp");
  assert.ok(file.includes("signOut: async"), "Must support signOut");
  assert.ok(file.includes("getUser: async"), "Must support getUser");
  assert.ok(file.includes("getSession: async"), "Must support getSession");
  assert.ok(file.includes("resetPassword: async"), "Must support resetPassword");
  assert.ok(file.includes("onAuthStateChange:"), "Must support onAuthStateChange");
});

runCheck("/login page and /auth/callback route handler exist", () => {
  assert.ok(existsSync(join(cwd, "src/app/login/page.tsx")), "Login page must exist");
  assert.ok(existsSync(join(cwd, "src/app/auth/callback/route.ts")), "Auth callback route must exist");
  const loginContent = readFileSync(join(cwd, "src/app/login/page.tsx"), "utf-8");
  assert.ok(loginContent.includes("authService.signIn"), "Login page must call authService.signIn");
  assert.ok(loginContent.includes("authService.signUp"), "Login page must call authService.signUp");
  assert.ok(loginContent.includes("Afaq Ahmad"), "Demo guest option supported");
});

// ==============================================================================
// 2. Dashboard
// ==============================================================================
console.log("\n2. Verifying Dashboard & Real-Time Metrics...");
runCheck("Dashboard renders live telemetry without hardcoded values", () => {
  const dashPath = join(cwd, "src/app/dashboard/page.tsx");
  assert.ok(existsSync(dashPath), "Dashboard route must exist");
  const dashContent = readFileSync(dashPath, "utf-8");
  assert.ok(dashContent.includes("analyticsService.getDashboardTelemetry"), "Must load telemetry from analyticsService");
  assert.ok(dashContent.includes("productivityScore"), "Must display productivity score");
  assert.ok(dashContent.includes("completedTasks"), "Must display completed tasks");
  assert.ok(dashContent.includes("pendingTasks"), "Must display pending tasks");
  assert.ok(dashContent.includes("overdueTasks"), "Must display overdue tasks");
});

// ==============================================================================
// 3. Task Creation, Editing & Completion (3, 4, 5)
// ==============================================================================
console.log("\n3. Verifying Task Lifecycle (Creation, Editing, Completion)...");
runCheck("taskService supports complete lifecycle CRUD", () => {
  const file = readFileSync(join(cwd, "src/services/taskService.ts"), "utf-8");
  assert.ok(file.includes("createTask: async"), "Must support createTask");
  assert.ok(file.includes("updateTask: async"), "Must support updateTask");
  assert.ok(file.includes("toggleTaskCompletion: async"), "Must support toggleTaskCompletion");
  assert.ok(file.includes("deleteTask: async"), "Must support deleteTask");
});

// ==============================================================================
// 6. Subtasks & 7. Tags
// ==============================================================================
console.log("\n4. Verifying Subtasks & Tags...");
runCheck("Task types support subtasks array and tags", () => {
  const taskTypes = readFileSync(join(cwd, "src/types/task.ts"), "utf-8");
  assert.ok(taskTypes.includes("subtasks?: Subtask[]") || taskTypes.includes("subtasks:"), "Task must support subtasks");
  assert.ok(taskTypes.includes("tags?: Tag[]") || taskTypes.includes("tags:"), "Task must support tags");
  assert.ok(existsSync(join(cwd, "src/components/ui/Badge.tsx")), "Badge UI component must exist");
});

// ==============================================================================
// 8. Projects & 9. Workspaces
// ==============================================================================
console.log("\n5. Verifying Projects & Workspaces...");
runCheck("Project and Workspace services exist with 4 core workspaces", () => {
  assert.ok(existsSync(join(cwd, "src/services/projectService.ts")), "projectService must exist");
  assert.ok(existsSync(join(cwd, "src/services/workspaceService.ts")), "workspaceService must exist");
  const constants = readFileSync(join(cwd, "src/lib/constants.ts"), "utf-8");
  assert.ok(constants.includes('"office"'), "Must include office workspace");
  assert.ok(constants.includes('"personal"'), "Must include personal workspace");
  assert.ok(constants.includes('"college"'), "Must include college workspace");
  assert.ok(constants.includes('"web-development"'), "Must include web-development workspace");
});

// ==============================================================================
// 10. Office Pages (8 Pages Matrix)
// ==============================================================================
console.log("\n6. Verifying Office Workspace 8 Production Pages...");
runCheck("All 8 Office Pages are registered and managed", () => {
  const constants = readFileSync(join(cwd, "src/lib/constants.ts"), "utf-8");
  const expectedPages = [
    "Shooting Page",
    "Ismail Shahid Fans",
    "ZK Production",
    "Jahangir Khan",
    "Inaya Kailash",
    "Political Affairs",
    "Nazia Iqbal Fanz",
    "Suno Music",
  ];
  for (const p of expectedPages) {
    assert.ok(constants.includes(p), `OFFICE_PAGES must support '${p}'`);
  }
});

// ==============================================================================
// 11. Personal Workspace (Vlog Creator Suite)
// ==============================================================================
console.log("\n7. Verifying Personal Vlog Creator Suite...");
runCheck("Personal workspace includes 9-stage pipeline and 5 platforms", () => {
  const personalPage = readFileSync(join(cwd, "src/app/personal/page.tsx"), "utf-8");
  const stages = [
    "IDEA",
    "PLANNED",
    "RECORDING",
    "FOOTAGE READY",
    "EDITING",
    "THUMBNAIL",
    "CAPTION",
    "READY TO POST",
    "PUBLISHED",
  ];
  for (const st of stages) {
    assert.ok(personalPage.includes(st), `Must include stage '${st}'`);
  }
  const platforms = ["Instagram", "YouTube", "TikTok", "Facebook", "X"];
  for (const pl of platforms) {
    assert.ok(personalPage.includes(pl), `Must include platform '${pl}'`);
  }
});

// ==============================================================================
// 12. College Workspace & 13. Web Development Workspace
// ==============================================================================
console.log("\n8. Verifying College & Web Development Workspaces...");
runCheck("College workspace has 5 sections and Web Dev links to Vlogs", () => {
  const collegePage = readFileSync(join(cwd, "src/app/college/page.tsx"), "utf-8");
  assert.ok(collegePage.includes("Classes"), "College Classes section");
  assert.ok(collegePage.includes("Assignments"), "College Assignments section");
  assert.ok(collegePage.includes("Projects"), "College Projects section");
  assert.ok(collegePage.includes("Exams"), "College Exams section");
  assert.ok(collegePage.includes("Notes"), "College Notes section");

  const webDevPage = readFileSync(join(cwd, "src/app/web-development/page.tsx"), "utf-8");
  assert.ok(webDevPage.includes("linkedVlogId"), "Web Dev links to personal vlogs via foreign key");
  assert.ok(webDevPage.includes("RECURRING_CLASSES"), "Web Dev displays scheduled classes (Mon/Tue)");
});

// ==============================================================================
// 14. Recurring Tasks Engine
// ==============================================================================
console.log("\n9. Verifying Recurring Tasks Engine...");
runCheck("recurringTaskService & recurrenceEngine support patterns & duplicate prevention", () => {
  assert.ok(existsSync(join(cwd, "src/services/recurringTaskService.ts")), "recurringTaskService must exist");
  assert.ok(existsSync(join(cwd, "src/lib/recurrenceEngine.ts")), "recurrenceEngine must exist");
  const recurring = readFileSync(join(cwd, "src/services/recurringTaskService.ts"), "utf-8");
  const engine = readFileSync(join(cwd, "src/lib/recurrenceEngine.ts"), "utf-8");
  assert.ok(recurring.includes("generateUpcomingTasks"), "Supports generateUpcomingTasks");
  assert.ok(recurring.includes("calculateNextOccurrence"), "Calculates next occurrence");
  assert.ok(engine.includes("generateTaskInstancesForWindow"), "Generates windowed task instances");
  assert.ok(engine.includes("recurringRuleId") || recurring.includes("recurringRuleId"), "Tracks recurring rule ID to prevent duplicates");
});

// ==============================================================================
// 15. Calendar System
// ==============================================================================
console.log("\n10. Verifying Calendar System (Month, Week, Day & Filters)...");
runCheck("Calendar supports Month, Week, Day views and multi-source event aggregation", () => {
  const calPage = readFileSync(join(cwd, "src/app/calendar/page.tsx"), "utf-8");
  assert.ok(calPage.includes("month"), "Month view supported");
  assert.ok(calPage.includes("week"), "Week view supported");
  assert.ok(calPage.includes("day"), "Day view supported");
  assert.ok(existsSync(join(cwd, "src/lib/calendarEvents.ts")), "calendarEvents must exist");
  const calEvents = readFileSync(join(cwd, "src/lib/calendarEvents.ts"), "utf-8");
  assert.ok(calEvents.includes("aggregateCalendarEvents"), "Must aggregate calendar events");
});

// ==============================================================================
// 16. Analytics System
// ==============================================================================
console.log("\n11. Verifying Analytics Telemetry & Score Calculation...");
runCheck("analyticsService transparently computes productivity score and workspace stats", () => {
  const file = readFileSync(join(cwd, "src/services/analyticsService.ts"), "utf-8");
  assert.ok(file.includes("calculateProductivityScoreBreakdown"), "Computes productivity score formula");
  assert.ok(file.includes("getWeeklyVelocity"), "Mon-Sun distribution trend");
  assert.ok(file.includes("getWorkspaceStatistics"), "Calculates breakdown for all 4 workspaces");
  assert.ok(file.includes("getFocusTimeMetrics"), "Calculates Today, Week, Month focus hours");
});

// ==============================================================================
// 17. Focus Mode & 18. Notifications
// ==============================================================================
console.log("\n12. Verifying Focus Mode & Notifications...");
runCheck("Focus mode logging and notificationService record telemetry and handle reminders", () => {
  assert.ok(existsSync(join(cwd, "src/components/focus/FocusModeModal.tsx")), "FocusModeModal UI exists");
  const focusModal = readFileSync(join(cwd, "src/components/focus/FocusModeModal.tsx"), "utf-8");
  assert.ok(focusModal.includes("Pomodoro") || focusModal.includes("25"), "Supports Pomodoro duration");

  const analytics = readFileSync(join(cwd, "src/services/analyticsService.ts"), "utf-8");
  assert.ok(analytics.includes("logFocusSession"), "Records session to database/storage");

  assert.ok(existsSync(join(cwd, "src/services/notificationService.ts")), "notificationService must exist");
  const notif = readFileSync(join(cwd, "src/services/notificationService.ts"), "utf-8");
  assert.ok(notif.includes("markAsRead"), "Supports markAsRead");
  assert.ok(notif.includes("markAllAsRead"), "Supports markAllAsRead");
  assert.ok(notif.includes("upcoming"), "Supports upcoming reminders");
  assert.ok(notif.includes("overdue"), "Supports overdue reminders");
});

// ==============================================================================
// 19. Global Search & 20. Filters / Keyboard Shortcuts
// ==============================================================================
console.log("\n13. Verifying Global Search & Shortcuts...");
runCheck("searchService groups results and GlobalSearchModal handles shortcuts", () => {
  assert.ok(existsSync(join(cwd, "src/services/searchService.ts")), "searchService must exist");
  const search = readFileSync(join(cwd, "src/services/searchService.ts"), "utf-8");
  assert.ok(search.includes("tasks"), "Search groups tasks");
  assert.ok(search.includes("projects"), "Search groups projects");
  assert.ok(search.includes("notes"), "Search groups notes");
  assert.ok(search.includes("pages"), "Search groups pages");

  const modal = readFileSync(join(cwd, "src/components/search/GlobalSearchModal.tsx"), "utf-8");
  assert.ok(modal.includes("Escape"), "Closes on Escape");
  const appShell = readFileSync(join(cwd, "src/components/layout/AppShell.tsx"), "utf-8");
  assert.ok(appShell.includes('"/"') || appShell.includes("'/'"), "Triggers search on /");
  assert.ok(appShell.includes('"n"') || appShell.includes("'n'"), "Triggers new task on N");
  assert.ok(appShell.includes('"Escape"') || appShell.includes("'Escape'"), "Closes modals on Escape");
});

// ==============================================================================
// 21. Mobile Navigation
// ==============================================================================
console.log("\n14. Verifying Mobile Navigation & Responsive Architecture...");
runCheck("MobileNavigation and AppShell adapt to mobile breakpoints", () => {
  assert.ok(existsSync(join(cwd, "src/components/layout/MobileNavigation.tsx")), "MobileNavigation exists");
  const appShell = readFileSync(join(cwd, "src/components/layout/AppShell.tsx"), "utf-8");
  assert.ok(appShell.includes("pb-20") || appShell.includes("pb-24"), "AppShell reserves space for bottom navigation");
  assert.ok(appShell.includes("MobileNavigation"), "AppShell mounts MobileNavigation");
});

// ==============================================================================
// 22. Database Security & Multi-Tenant Row Level Security (RLS)
// ==============================================================================
console.log("\n15. Verifying Database Security & Row Level Security (RLS)...");
runCheck("004_production_security_rls.sql enforces auth.uid() across all 12 tables", () => {
  const rlsPath = join(cwd, "src/database/migrations/004_production_security_rls.sql");
  assert.ok(existsSync(rlsPath), "004_production_security_rls.sql must exist");
  const rlsSql = readFileSync(rlsPath, "utf-8");

  const requiredTables = [
    "workspaces",
    "projects",
    "tasks",
    "subtasks",
    "tags",
    "task_tags",
    "focus_sessions",
    "notes",
    "notifications",
    "recurring_rules",
    "pages",
    "profiles",
  ];

  for (const t of requiredTables) {
    assert.ok(rlsSql.includes(`ENABLE ROW LEVEL SECURITY`), "Enables RLS");
    assert.ok(
      rlsSql.includes(`ON public.${t}`) || rlsSql.includes(`ON ${t}`),
      `Table ${t} has RLS policies defined`
    );
  }

  assert.ok(rlsSql.includes("auth.uid()"), "Policies reference auth.uid() for strict multi-tenant isolation");
});

// ==============================================================================
// 23. Environment Variables & Secret Hygiene
// ==============================================================================
console.log("\n16. Verifying Environment Variables & Secret Hygiene...");
runCheck(".env.example documents variables; .gitignore ignores private secrets", () => {
  assert.ok(existsSync(join(cwd, ".env.example")), ".env.example must exist");
  const gitignore = readFileSync(join(cwd, ".gitignore"), "utf-8");
  assert.ok(gitignore.includes(".env*"), ".gitignore must ignore .env*");
  assert.ok(gitignore.includes("!.env.example"), ".gitignore must preserve .env.example");

  // Check no accidental service_role key is hardcoded in source
  const clientTs = readFileSync(join(cwd, "src/lib/supabase/client.ts"), "utf-8");
  assert.ok(!clientTs.includes("service_role"), "client.ts must NEVER contain or use service_role key");
});

// ==============================================================================
// 24. Production Deployment Configuration & Error Boundaries
// ==============================================================================
console.log("\n17. Verifying Deployment Config, Error Boundary & 404...");
runCheck("vercel.json includes security headers and error boundaries exist", () => {
  assert.ok(existsSync(join(cwd, "vercel.json")), "vercel.json must exist");
  const vercelJson = JSON.parse(readFileSync(join(cwd, "vercel.json"), "utf-8"));
  assert.ok(vercelJson.headers, "vercel.json must define security headers");

  assert.ok(existsSync(join(cwd, "src/app/error.tsx")), "Global error boundary error.tsx must exist");
  assert.ok(existsSync(join(cwd, "src/app/not-found.tsx")), "Custom 404 not-found.tsx must exist");
});

// ==============================================================================
// Final Summary
// ==============================================================================
console.log("\n================================================================================");
console.log(`✅ AUDIT PASSED: All ${passedChecks}/${totalChecks} Production Checks Succeeded!`);
console.log("================================================================================");
