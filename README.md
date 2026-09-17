# Afaq TaskFlow ⚡

> **A high-performance, domain-segregated personal productivity and work-management system designed with Google Stitch.**

![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Design System](https://img.shields.io/badge/Design_System-Google_Stitch-4F46E5?style=for-the-badge)
![Status](https://img.shields.io/badge/Phase_9-Complete-10B981?style=for-the-badge)

---

## 📖 Executive Overview

**Afaq TaskFlow** is an elite, multi-domain personal productivity application built for **Afaq Ahmad** to seamlessly balance four concurrent high-intensity workloads:
1. **🏢 Office Content & Visual Production** — Managing an 8-page social media publishing matrix, reel schedules, and visual brand assets for clients such as Suno Music.
2. **🎥 Personal Vlog & Creator Suite** — 9-stage video production pipeline (IDEA, PLANNED, RECORDING, FOOTAGE READY, EDITING, THUMBNAIL, CAPTION, READY TO POST, PUBLISHED) with multi-platform distribution and checklists.
3. **🎓 College Academics** — 5-section academic portal (Classes, Assignments, Projects, Exams, Notes) with Pomodoro study timer and GPA telemetry.
4. **💻 Web Development Mastery** — Fullstack Next.js and systems architecture curriculum, sprint goals, GitHub activity sync, recurring Monday & Tuesday 4:00 PM – 6:00 PM live virtual classes, and relational vlog bridging.

The entire UI/UX is built strictly upon **Google Stitch** design specs, featuring a dark slate palette (`#0B1326`), refined typographic hierarchy, and responsive navigation across desktop, tablet, and mobile.

---

## ⚡ Phase 4: Complete Task-Management System

Phase 4 delivers the complete end-to-end task management system backed by Supabase PostgreSQL and Google Stitch design system components:

### 1. Task Creation & Full Property Editing
- **Comprehensive Fields**: Title, description, workspace target, office page context, project affiliation, due date, due time, priority, estimated duration, tags, initial subtask checklist, and freeform notes.
- **Universal Quick Task Modal**: Press <kbd>N</kbd> anywhere in the application to trigger high-speed task creation.
- **Inline Quick Add Bar**: Add tasks directly to active views with workspace and priority chips and <kbd>Enter</kbd> to save.

### 2. Status & Priority Lifecycle
- **Statuses**: `TODO` ➔ `IN_PROGRESS` ➔ `REVIEW` ➔ `READY` ➔ `COMPLETED`.
- **Inline Status Switcher**: Update task lifecycle directly from Task Cards or the Task Detail Drawer.
- **Priorities**: `LOW`, `MEDIUM`, `HIGH` (and `URGENT` compatibility) with distinct Stitch visual states and pulse indicators.
- **Task Completion**: Instant completion toggle, automated `completed_at` timestamping, and real-time dashboard statistic recomputations.

### 3. Subtasks Management
- Full CRUD: Create, inline edit, delete, mark completed, and reorder.
- Visual completion progress bar showing percentage and `X / Y done` counters.

### 4. Stitch Task Detail Drawer
- **Slide-Over Inspection Panel**: Opens smoothly on task selection.
- **Editable Properties Table**: Live updates for workspace, office page, due date, due time, duration, tags, and priority with auto-save indication.
- **Activity & History Timeline**: Chronological event logs for creation, status transitions, and subtask completions.

### 5. Views, Filtering & Sorting
- **Views**: Seamless switching between **Grouped List Stream** (Overdue, Daytime, Evening, Completed) and **Kanban Board** (columns for each status).
- **Segmented Filter Tabs**: `All`, `Today`, `Upcoming`, `Overdue` (pulsing red alert), `Completed`.
- **Multi-Property Filtering**: Workspace, Office Page, Priority, Status, Tags, and instant keyword search.
- **Sorting**: Order by `Due Time`, `Priority`, or `Created Date` with ascending/descending toggles.

### 6. Persistence & Optimistic UI
- Direct Supabase PostgreSQL persistence across `tasks`, `subtasks`, `tags`, `task_tags`, and `notes`.
- Zero-latency optimistic UI updates with automatic rollback and user-friendly error banners if database errors occur.
- Resilient local fallback cache when offline or during initial configuration.

---

## 🏢 Phase 5: Office Workspace & Daily Publishing Matrix

Phase 5 delivers the production content engine, 8-channel publishing matrix, live database KPI telemetry, 6-stage content workflow Kanban board, 6-stage Suno Music pipeline, and interactive daily checklist according to the Google Stitch design system and real Supabase PostgreSQL data:

### 1. The 8 Dedicated Office Pages
- **Full Channel Matrix**: `Shooting Page`, `Ismail Shahid Fans`, `ZK Production`, `Jahangir Khan`, `Inaya Kailash`, `Political Affairs`, `Nazia Iqbal Fanz`, and `Suno Music`.
- **Dynamic Completion Statuses**: Computes real-time execution states (e.g. `Shooting Page — completed`, `ZK Production — in progress`, `Jahangir Khan — pending`).
- **One-Click Filtering**: Instant workspace filtering by clicking any page card in the matrix.

### 2. 6-Stage Content Production Workflow
- **Stages**: `IDEAS` ➔ `TODO` ➔ `IN_PROGRESS` ➔ `REVIEW` ➔ `READY` ➔ `PUBLISHED`.
- **Interactive Transitions**: Single-click forward (`→`) and backward (`←`) column transitions with instant Supabase database persistence.

### 3. Suno Music Specialized Visual & Audio Pipeline
- **6 Pipeline Stages**: `BRIEF` ➔ `ASSETS` ➔ `DESIGN` ➔ `REVIEW` ➔ `EXPORT` ➔ `DELIVERED`.
- **Dedicated Asset Cards**: Synthwave Track Artwork, Animated Canvas Loop (9:16 vertical), and 4K YouTube Audio Visualizer.

### 4. 7-Step Daily Content Checklist
- **Mandatory Subtasks**: `Check new content`, `Select content`, `Edit`, `Caption`, `Hashtags`, `Upload`, `Verify published`.
- **Channel Dispatch**: Interactive checkboxes, progress metrics, and one-click "Complete All 7 Steps" batch action.

---

## 🎯 Phase 6: Personal, College & Web Development Workspaces

Phase 6 implements the complete domain workspaces for Afaq Ahmad's Personal creator workflow, College academic curriculum, and Web Development mastery portal, strictly matching the Stitch design specifications:

### 1. 🎥 Personal Workspace (`/personal`)
- **9-Stage Vlog / Content Pipeline**:
  `IDEA` ➔ `PLANNED` ➔ `RECORDING` ➔ `FOOTAGE READY` ➔ `EDITING` ➔ `THUMBNAIL` ➔ `CAPTION` ➔ `READY TO POST` ➔ `PUBLISHED`.
- **Comprehensive Vlog Model**:
  - `title`, `date`, `description`.
  - **Recording Checklist**: Dynamic subtasks for B-Roll, A-Roll, microphone check, lighting setup.
  - **Editing Checklist**: Rough cut, audio color grade, sound effects, final export.
  - **Thumbnail Status**: `pending`, `designed`, `approved` badge indicators.
  - **Captions & SEO Tags**: Full text captions and topic hashtags.
  - **Multi-Platform Distribution**: `Instagram`, `YouTube`, `TikTok`, `Facebook`, and `X`.
  - **Publishing Status**: Lifecycle tracking from Draft to Published.
- **2-Column Creator Layout**:
  - **Left**: Creator KPI metrics, interactive horizontal 9-stage pipeline switcher, and "My Web Dev Journey" showcase hub.
  - **Right**: Active production schedule list with live Vlog Detail Inspector drawer.

### 2. 🔗 Web Development Journey Relational Bridge
- **Relational Database Reference (`linkedVlogId`)**:
  - Web Development sprint tasks/projects link directly to Personal Vlog episodes (e.g. Task *"Build responsive navbar"* or *"Deploy Supabase Auth"* linked to Vlog *"Building my portfolio website"* `EP #42`).
  - **Zero Duplicated Text**: Relational foreign-key mapping allows bi-directional updates; updating a vlog episode title reflects automatically in the linked dev task view.
  - Bi-directional visual badges and one-click navigation between dev sprints and vlog production.

### 3. 🎓 College Academics Workspace (`/college`)
- **5 Core Academic Domains**:
  1. **Classes**: Daily lecture schedules, room numbers, professors, and attendance status.
  2. **Assignments**: Complete assignment tracking with `title`, `subject`, `due date`, `priority`, `estimated time`, `status`, and `notes`.
  3. **Projects**: Multi-week term projects (e.g. Distributed Database Engine, AI Image Classifier) with milestone progress bars.
  4. **Exams**: Upcoming midterm and final exams with dynamic countdown badges (e.g. `In 5 Days`).
  5. **Notes**: Digital lecture notebooks tagged by course code (CS301, CS340, MATH204, CS380).
- **Interactive Focus / Pomodoro Timer**:
  - Built-in 25:00 study countdown timer with Play, Pause, and Reset controls for academic focus sessions.
- **Academic Telemetry KPIs**:
  - Current CGPA (`3.82 / 4.0`), Active Courses (`5 Enrolled`), Pending Submissions (`3 Due`), Semester Progress (`68%`), and Study Streak (`14 Days`).

### 4. 💻 Web Development Workspace (`/web-development`)
- **Real-Time Telemetry & Progress Gauges**:
  - **Learning Progress**: `68%` overall fullstack curriculum mastery.
  - **Current Project**: Active sprint spotlight (*"Afaq TaskFlow Production Release"*).
  - **Practice Tasks**: Completed vs. pending drill exercises (`12 / 18 Complete`).
  - **Upcoming Classes**: Real-time indicator for next live session.
  - **Weekly Coding Hours**: Live focus hours tracker (`24.5 hrs` this week).
  - **Active Projects**: Cross-track initiative tally.
- **Dynamic Recurring Classes Engine**:
  - **Monday 4:00 PM – 6:00 PM** & **Tuesday 4:00 PM – 6:00 PM** Advanced Next.js & Systems Architecture.
  - Generates recurring session schedules **dynamically** without duplicating weekly database rows.
- **Sprint Taskboard & Git Stream**:
  - Sprints segmented by status (`TODO`, `IN_PROGRESS`, `REVIEW`, `COMPLETED`) with priority filter chips.
  - Live Git commit activity stream with SVG velocity sparkline.

### 5. 📂 Projects Portfolio (`/projects`)
- Cross-workspace initiative dashboard powered by `projectService`.
- Displays: **Progress %**, **Tasks Total / Completed**, **Deadline Countdown**, **Status** (`Active`, `In Review`, `Planned`), **Focus / Coding Hours**, and **Tech Stack tags**.
- Segmented workspace filter tabs: `All Projects`, `Web Development`, `College`, `Office`, and `Personal`.

---

## 🔄 Phase 7: Complete Recurring-Task System & Calendar Integration

Phase 7 implements the mission-critical, enterprise-grade recurring task engine designed to generate task instances reliably without duplicates, backed by Supabase PostgreSQL, timezone accuracy (`Asia/Karachi` / `UTC+5`), and seamless Google Stitch UI integration across `/recurring` and `/calendar`:

### 1. 🔁 Recurrence Types
- **`EVERY_DAY`**: Daily recurring routines with 24-hour cadence.
- **`WEEKDAYS`**: Monday through Friday business routines (e.g. Daily Shooting Page Management).
- **`SPECIFIC_WEEKDAYS`**: Precision weekday selection (e.g. Mon & Tue Web Development classes).
- **`WEEKLY`**: Every 7-day recurring cycle on the designated start day.
- **`MONTHLY`**: Month-to-month standing routines anchored to day-of-month.
- **`CUSTOM_INTERVAL`**: Configurable interval cadence (e.g., every 3 days, every 2 weeks).

### 2. ⚙️ Recurring Task Configuration
- **Rule Attributes**: Title, description, workspace, office page context, project link, priority (`low`, `medium`, `high`, `urgent`), due time, estimated duration, start date, expiration end date, active weekdays bitmap, checklist templates, and status (`active`, `paused`, `expired`).
- **Subtask Checklist Template**: Multi-item checklist pre-configured on recurring generation (e.g. 7-step content checklist).
- **Lifecycle Operations**: Full CRUD — Create, Edit, Pause, Resume, Delete, and Instant Generate.

### 3. 🛡️ Zero-Duplication Engine & Architecture
- **Segregated Storage**: Pure recurring rules are stored in `recurring_rules` completely segregated from generated task instances in `tasks`.
- **Composite Unique Index**: `idx_tasks_recurring_rule_instance_unique` (`recurring_rule_id, due_date`) guarantees at the database level that no task instance can ever be duplicated for the same date.
- **Next Occurrence Telemetry**: Continuously recalculates `next_occurrence` timestamp based on Pakistan Standard Time (`Asia/Karachi` / `UTC+5`).
- **Resilience Handling**:
  - **Skipped Occurrences**: Safely rolls forward past missed dates without creating ghost tasks.
  - **Paused Rules**: Automatically bypassed during generation cycles without loss of cadence configuration.
  - **Expired Rules**: Automatically transition to `expired` state once `endDate` is reached.

### 4. 🎬 Canonical Reference Implementation: "Daily Shooting Page Management"
- **Schedule**: Monday through Friday (`WEEKDAYS`) at `1:15 PM` (75-minute duration).
- **Workspace**: Office 🏢 (`Shooting Page`).
- **7-Step Mandatory Production Checklist**:
  1. Check new content
  2. Select content
  3. Edit
  4. Caption
  5. Hashtags
  6. Upload
  7. Verify upload

### 5. 📦 5 Reusable Production Templates
1. **Office Daily Content**: Mon–Fri 1:15 PM (Shooting Page) with 7-step publishing checklist.
2. **Suno Music Visual**: Mon/Wed/Fri 4:00 PM (Suno Music) with 6-stage audio/visual artwork pipeline.
3. **Personal Vlog**: Tue/Thu/Sat 7:00 PM (Personal) with 4-stage filming & editing pipeline.
4. **College Study**: Mon–Fri 9:00 AM (College) 25-min Pomodoro review & assignment prep.
5. **Web Development Practice**: Mon & Tue 4:00 PM (Web Dev) live systems architecture & coding drills.

### 6. 💻 Automation UI & Management Hub (`/recurring`)
- **Stitch Metrics Strip**: 4 live KPI counters (Active Routines, Paused Routines, Today's Scheduled, Lifetime Generated).
- **5 Filter Tabs**: `Active`, `Paused`, `Upcoming`, `Expired`, `All Rules`.
- **Rule Management Cards**: Display workspace pill, recurrence badge, time slot, duration, next occurrence date, and action menu.
- **Instant Generation**: Single-click "Generate Upcoming Tasks" button populates upcoming task windows (7 to 14 days) instantly.
- **Interactive Rule Builder**: Modal with preset template selector, workspace & page picker, custom time/duration inputs, interactive days-of-week toggles, and dynamic subtask checklist editor.

### 7. 📅 Unified Calendar Integration (`/calendar`)
- **Time-Blocking Views**: Seamless switching between **Day**, **Week**, and **Month** grid layouts.
- **Recurring Identifiers**: Recurring task instances feature a dedicated repeating badge (`repeat` icon) and rule linkage.
- **Workspace Color Coding**: Blue (Office), Purple (Personal), Emerald (College), Cyan (Web Dev).
- **Task Interaction Drawer**: Clicking any calendar event opens the Stitch Task Detail drawer for instant inspection and editing.

---

## 📅 Phase 8: Complete Interactive Calendar System

Phase 8 implements the complete, highly responsive, interactive time-blocking calendar engine based directly on the Google Stitch desktop and mobile designs (`afaq_taskflow_productivity_calendar` and `afaq_taskflow_mobile_productivity_calendar`):

### 1. 🗓️ Three Comprehensive View Modes
- **`MONTH` View**:
  - 35-day grid (Monday through Sunday) with density heatmaps.
  - Domain-colored event chips with clean "+X more" overflow badges.
  - Interactive day selection switches directly to the expanded Day timeline.
  - Integrated **Workspace Density & Capacity Map** widget and **Deadlines & Milestones** countdown panel.
- **`WEEK` View (Default)**:
  - Sticky day header with date pills, category dot indicators, and today highlight.
  - **All-Day Deadlines Banner**: Positioned above the grid for all-day sprint goals and exam milestones.
  - 15 hourly rows from **07:00 to 22:00**.
  - **Real-Time Current Time Indicator**: Continuous red laser ruler with pulsing badge (`14:30 NOW`) calculated in Pakistan Standard Time (`Asia/Karachi` / `UTC+5`).
  - Cards dynamically rendered with exact start time and duration height.
- **`DAY` View**:
  - Detailed single-day vertical hourly timeline.
  - Shows subtasks completion metrics, venue/room location tags, professor details, and direct actions.

### 2. 📊 Multi-Source Data Aggregation
The calendar seamlessly combines 6 distinct data streams into unified scheduled blocks:
1. **Standard Tasks**: Real tasks created in Office, Personal, College, or Web Dev workspaces.
2. **Recurring Tasks**: Standing routines from Phase 7 projected dynamically without database record duplication.
3. **College Classes**: CS301 (Algorithms), CS340 (Databases), MATH204 (Discrete Math), CS380 (OS Lab).
4. **Web Development Classes**: Monday & Tuesday 4:00 PM – 6:00 PM live systems architecture sessions.
5. **Deadlines & Milestones**: Major sprint targets (e.g. Sprint Goal 03, CS301 Lab Due, TaskFlow Beta Launch).
6. **Project Portfolios**: Synced from `projectService`.

### 3. ⚡ Frictionless Interactions
- **Click Empty Time**: Click any hour slot in Week or Day view to open `QuickTaskModal` pre-populated with that date, start time, and estimated duration.
- **Click Task / Event**: Opens the slide-over `TaskDetailDrawer` for instant inspection, property editing, checklist updates, or deletion.
- **Drag & Drop Rescheduling**: Drag cards to any hour slot or day to update `dueDate` and `dueTime` with instant optimistic UI and Supabase persistence.
- **Duration Resizing**: Interactive +/-15m stepper handles on cards allow adjusting `estimatedDurationMin` on the fly.

### 4. 🎛️ Scope Filter Matrix
- Multi-select toggle chips with real-time event counts:
  - **All** (Total events)
  - **Office** (Blue `#3B82F6`)
  - **Personal** (Purple `#A855F7`)
  - **College** (Emerald `#10B981`)
  - **Web Development** (Cyan `#06B6D4`)
  - **Deadlines / Projects** (Amber `#F59E0B`)
  - **Recurring Sync** (Purple with `autorenew`)
- **Cadence Metric**: Real-time booked hours counter (e.g., `31.5 hrs booked`).

### 5. 📱 Responsive Mobile Calendar (`afaq_taskflow_mobile_productivity_calendar`)
- 7-Day Date Carousel Bar with active date chip.
- Segmented view switcher (`Day`, `Week`, `Month`).
- Horizontal scrolling scope filter pills.
- Clean hour-by-hour timeline avoiding clutter on smaller mobile viewports.

---

## 🏛️ System Architecture

```
src/
├── app/                              # Next.js 16 App Router Routes
│   ├── layout.tsx                    # Master HTML, font bindings & AppShell
│   ├── globals.css                   # Stitch design tokens & Tailwind v4 theme
│   ├── page.tsx                      # Root route (redirects to /dashboard)
│   ├── dashboard/page.tsx            # Executive Command Center & Live Telemetry
│   ├── tasks/page.tsx                # Universal Task Inbox (Board, List, Tabs & Drawer)
│   ├── calendar/page.tsx             # Time-Blocking Schedule by Domain
│   ├── recurring/page.tsx            # Automation Engine & Standing Routines
│   ├── analytics/page.tsx            # Velocity Telemetry & Velocity Charts
│   ├── office/page.tsx               # Office Workspace (8 Pages & Suno Music)
│   ├── personal/page.tsx             # Personal Workspace (Vlog Pipeline)
│   ├── college/page.tsx              # College Workspace (Academics & Labs)
│   ├── web-development/page.tsx      # Web Dev Workspace (Classes & Sprints)
│   ├── projects/page.tsx             # Multi-Track Initiative & Sprint Tracker
│   ├── notes/page.tsx                # Technical Documentation Hub
│   └── settings/page.tsx             # User Profile, Keyboard Map & Supabase Status
├── components/
│   ├── layout/                       # Reusable App Shell Architecture
│   │   ├── AppShell.tsx              # Viewport coordinator (desktop/tablet/mobile)
│   │   ├── Sidebar.tsx               # Collapsible desktop command rail
│   │   ├── Header.tsx                # Dynamic breadcrumbs, search, quick add
│   │   ├── NavigationItem.tsx        # Standard navigation row (active/hover/focus)
│   │   ├── WorkspaceNavigation.tsx   # Domain pills with glowing indicators
│   │   ├── MobileNavigation.tsx      # Fixed bottom nav + workspace drawer sheet
│   │   ├── PageContainer.tsx         # Unified responsive container wrapper
│   │   └── PageHeader.tsx            # Standardized page title & action banner
│   ├── ui/                           # Precision UI Components
│   │   ├── Button.tsx                # Primary, secondary, ghost, danger
│   │   ├── Card.tsx                  # Stitch surface containers (low to high)
│   │   ├── Badge.tsx                 # Domain pills & priority badges with pulse
│   │   ├── Input.tsx                 # Dark high-density inputs with shortcut chips
│   │   ├── Checkbox.tsx              # 18px checkbox with smooth strike animation
│   │   ├── Avatar.tsx                # User avatar with status indicator
│   │   └── Icon.tsx                  # Google Material Symbols Outlined
│   ├── tasks/                        # Task Management UI Suite
│   │   ├── TaskCard.tsx              # Card & row layouts with inline status dropdown
│   │   ├── TaskDetailDrawer.tsx      # Stitch slide-over inspection & subtasks panel
│   │   └── QuickTaskModal.tsx        # Comprehensive task creation modal (<kbd>N</kbd>)
│   ├── office/                       # Office Workspace System (Phase 5)
│   │   ├── OfficeKpiGrid.tsx         # 5 live database KPI cards (Today, Done, Pending, Urgent, Score)
│   │   ├── DailyPublishingMatrix.tsx # 8-page status matrix strip with dynamic dispatch status
│   │   ├── OfficePageFilterBar.tsx   # All Pages + 8 page tabs + platform filter chips
│   │   ├── SunoPipelineSpotlight.tsx # 6-stage Suno Music pipeline & interactive asset cards
│   │   ├── OfficeKanbanBoard.tsx     # 6-stage Content Production Kanban board with card transitions
│   │   └── DailyContentChecklist.tsx # 7-step interactive daily publishing checklist
│   └── common/
│       └── EmptyState.tsx            # Actionable zero-data fallbacks
├── hooks/
│   ├── useKeyboardShortcut.ts        # Event listener for 'N', 'F', 'Cmd+K', 'Esc'
│   └── useMediaQuery.ts              # SSR-safe reactive matchMedia
├── lib/
│   ├── supabase/                     # Supabase client, server, and middleware helpers
│   ├── utils.ts                      # Tailwind merge & utility helpers
│   ├── recurrenceEngine.ts           # Zero-duplication recurring task instance generator
│   ├── calendarEvents.ts             # Unified calendar aggregator, class schedules & deadlines
│   ├── recurringTemplates.ts         # 5 pre-configured workspace task templates
│   └── constants.ts                  # Workspaces, 8 Office pages, recurring routines
├── types/
│   ├── task.ts                       # Task, subtask, priorities, statuses, filters
│   ├── recurring.ts                  # Recurrence types, rules, templates & intervals
│   ├── calendar.ts                   # Calendar views, events, time slots & drag payload
│   ├── project.ts                    # Projects, milestones, deadlines, focus hours
│   ├── office.ts                     # Office workflow stages, Suno pipeline, KPIs, checklists
│   ├── workspace.ts                  # 4 Workspace definitions & workflow stages
│   ├── navigation.ts                 # Nav items & badges
│   └── database.ts                   # Supabase / PostgreSQL schema interfaces
├── services/
│   ├── taskService.ts                # Supabase task repository with CRUD, subtasks & stats
│   ├── recurringTaskService.ts       # Recurring rules repository & queue generation
│   ├── projectService.ts             # Projects repository with progress, deadline & focus hours
│   ├── officeService.ts              # Office KPIs, 8-page completion statuses & checklist engine
│   └── workspaceService.ts           # Workspace & Office pages repository
├── database/
│   ├── migrations/                   # Sequential SQL migrations (001, 002, 003)
│   └── schema.sql                    # Consolidated PostgreSQL relational schema
└── scripts/
    ├── check-routes.mjs              # Route healthcheck verification
    ├── test-task-service.mjs         # 33-step automated task service test suite
    ├── test-office-workspace.mjs     # Automated Office workspace & publishing matrix test suite
    ├── test-phase6.mjs               # Automated Phase 6 (Personal, College, Web Dev) test suite
    ├── test-recurring-system.mjs     # Automated Phase 7 recurring engine & duplication test suite
    ├── test-calendar-system.mjs      # Automated Phase 8 interactive calendar test suite
    └── run-lint.mjs                  # Strict ESLint automation runner
```

---

## 🎨 Design Tokens & Visual Hierarchy

Built upon the **Google Stitch Precision Focus Minimal** specification:

| Token | Hex Value | Application |
| :--- | :--- | :--- |
| `surface-canvas` | `#0B1326` | Deep slate canvas background |
| `surface-container-low` | `#131B2E` | Sidebar background, secondary card backing |
| `surface-container` | `#171F33` | Primary cards, content tiles, tables |
| `surface-container-high`| `#222A3D` | Interactive card hovers, elevated containers |
| `primary-container` | `#4F46E5` | Core Indigo accent, CTAs, focus rings |
| `secondary` | `#6BD8CB` | Glowing cyan telemetry, Web Dev domain |
| `tertiary` | `#D0BCFF` | Creator purple, Personal domain |
| `urgent` | `#EF4444` | High priority tags, active pulse pings |

### Workspace Domain Color Identifiers
* 🟦 **Office**: Blue (`#3B82F6`)
* 🟪 **Personal**: Purple (`#A855F7`)
* 🟩 **College**: Emerald (`#10B981`)
* 🟨 **Web Development**: Cyan (`#06B6D4`)

---

## ⌨️ Frictionless Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> | Open global command palette & omni-search | Global |
| <kbd>N</kbd> | Open universal Quick Add Task modal | Global |
| <kbd>F</kbd> | Toggle Focus Mode / Pomodoro sprint timer | Global |
| <kbd>ESC</kbd> | Dismiss any open modal, drawer sheet, or popup | Global |

---

## 🗺️ Project Roadmap & Phase Status

- [x] **PHASE 0: Project Understanding & Setup** — In-depth analysis of 23 Stitch designs and design system guidelines.
- [x] **PHASE 1: Next.js Foundation & Stitch UI** — Next.js 16 App Router, React 19, Tailwind CSS v4, design tokens, and initial route scaffolding.
- [x] **PHASE 2: Complete App Shell & Navigation** — Reusable Sidebar, Header, NavigationItem, WorkspaceNavigation, MobileNavigation, PageContainer, PageHeader, collapse states, and real routing.
- [x] **PHASE 3: Database & Supabase Integration** — 12 PostgreSQL tables, Row Level Security (RLS), 8 seeded Office pages, multi-tenant user triggers, and Supabase SSR client SDK.
- [x] **PHASE 4: Full Task System** — Complete task CRUD, Supabase persistence, Stitch UI fidelity, TaskDetailDrawer, Subtasks checklist with progress bar, Statuses (`TODO`, `IN_PROGRESS`, `REVIEW`, `READY`, `COMPLETED`), Priorities (`LOW`, `MEDIUM`, `HIGH`), Filter Tabs (`All`, `Today`, `Upcoming`, `Overdue`, `Completed`), Multi-criteria filters & sorting, Optimistic UI updates, and 33-step automated test suite.
- [x] **PHASE 5: Workspaces & Office Pages** — Complete Office workspace with real database-driven KPI telemetry, 8 Office Pages (`Shooting Page`, `Ismail Shahid Fans`, `ZK Production`, `Jahangir Khan`, `Inaya Kailash`, `Political Affairs`, `Nazia Iqbal Fanz`, `Suno Music`), dynamic page completion statuses (`Shooting Page — completed`, `ZK Production — in progress`, `Jahangir Khan — pending`), 6-stage Content Production Kanban (`IDEAS`, `TODO`, `IN_PROGRESS`, `REVIEW`, `READY`, `PUBLISHED`), 6-stage Suno Music pipeline spotlight (`BRIEF`, `ASSETS`, `DESIGN`, `REVIEW`, `EXPORT`, `DELIVERED`), 7-step Daily Content Checklist, horizontal filter bar with platform chips, and automated integration tests.
- [x] **PHASE 7: Recurring Tasks Engine** — Zero-duplication recurring engine, 6 recurrence patterns, 5 pre-configured templates, canonical Shooting Page daily routine (Mon-Fri 1:15 PM), management UI (`/recurring`), calendar time-blocking integration (`/calendar`), and automated test suite.
- [x] **PHASE 8: Interactive Calendar** — Complete Stitch Month, Week & Day time-blocking schedule, drag & drop rescheduling, duration resizing, mobile calendar carousel, multi-source aggregation (tasks, recurring, classes, deadlines), and Supabase synchronization.
- [x] **PHASE 9: Production Dashboard & Analytics System** — Live Supabase telemetry, zero hardcoded values, transparent mathematical productivity score formula, Monday–Sunday velocity cadence, workspace performance vectors, focus time tracking (`focus_sessions`), and weekly executive review.
- [ ] **PHASE 10: Notifications & Focus Mode** — In-app alerts, audio chimes, and full-screen Pomodoro mode.
- [ ] **PHASE 11: Search, Filters & Polish** — Command palette search, sorting, tag management, and micro-animations.
- [ ] **PHASE 12: Production Hardening, Security & Deployment** — End-to-end tests, security audit, and deployment pipeline.

---

## 📊 Phase 9: Production Dashboard & Analytics Telemetry System

Phase 9 delivers a comprehensive, real-time command center and deep cognitive productivity telemetry system powered by live Supabase PostgreSQL data with zero hardcoded values, adhering faithfully to Google Stitch dark slate specifications (`afaq_taskflow_overview_dashboard` and `afaq_taskflow_analytics_productivity`):

### 1. Unified Production Dashboard (`/dashboard`)
* **Live KPI Telemetry Cards**:
  - **Total Tasks**: Scheduled active and planned tasks synced live with Supabase.
  - **Completed Tasks**: Realtime completion counts with automated percentage calculations.
  - **Pending Tasks**: Tracks remaining active deliverables and flags high-priority items with urgent pulse states.
  - **Productivity Score**: Composite cognitive flow state score calculated deterministically.
* **Today's Progress Hero Module**:
  - Radial circular progress meter SVG calculating completed vs. critical daily targets.
  - Multi-workspace segmented progress bar rendering Office (`#3B82F6`), Personal (`#A855F7`), College (`#10B981`), and Web Dev (`#06B6D4`) proportional contributions.
  - Granular domain breakdown pills showing exact `completed / total` ratios.
* **Interactive Priority Action Queue**:
  - Filter chips: `All`, `🔥 Overdue`, `High Priority`, and `Medium`.
  - Checkbox completion toggles with optimistic UI updates and instant dashboard telemetry recomputations.
  - Clicking any task opens the Stitch slide-over `TaskDetailDrawer`.
* **Today's Schedule Live Timeline**:
  - Chronological sequential agenda from early morning to evening wrap.
  - Shows completed tasks (line-through with checkmarks), active/current tasks (pulsing indigo badge), upcoming items, and evening reviews.
* **Upcoming Tasks Queue**:
  - Displays scheduled upcoming deliverables for tomorrow and beyond with domain-colored tags and fast action triggers.
* **Workspace Overview Matrix**:
  - Live summary cards for all 4 workspaces displaying task counts, completion progress bars, and invested focus duration.

### 2. Deep-Dive Analytics & Intelligence (`/analytics`)
* **8 Core Telemetry Metrics**:
  - `Tasks Done`, `Completion Rate (%)`, `On-Time Rate (%)`, `Overdue Tasks`, `Focus Time (Weekly & Daily)`, `Avg Duration`, `Flow Score (%)`, and `Current Streak (Days)`.
* **Transparent Productivity Score Engine**:
  - Completely transparent, 100% deterministic formula based on meaningful database metrics (zero random numbers):
    $$\text{Score} = 0.30 \cdot S_{\text{comp}} + 0.25 \cdot S_{\text{ontime}} + 0.25 \cdot S_{\text{consistency}} + 0.20 \cdot S_{\text{focus}}$$
  - Documented in code comments with interactive progress bars for each of the 4 factors.
  - Circular SVG gauge with animated stroke offset and tier/mode classification (`Tier 1 - Peak Efficiency Mode`).
* **Weekly Completed Task Cadence (Monday–Sunday)**:
  - Stacked bar visualizer with multi-domain color distributions (Office, Personal, College, Web Dev).
  - Identifies the week's peak productive day (`★`) with glowing highlight and focus metrics.
* **Workspace Performance Vectors**:
  - Real comparison cards for `Office`, `Personal`, `College`, and `Web Development`.
  - Calculates total tasks, completed, pending, completion %, time spent, and domain cadence highlights.
* **Focus Time Engine (`focus_sessions`)**:
  - Aggregates tracked deep work across `Today`, `This Week`, and `This Month` against realistic targets.
  - Features an active session preview and `+ Log 25m` mutation trigger that immediately updates live focus metrics.
* **Weekly Executive Review Summary**:
  - Synthesizes cleared tasks, overdue backlog, top performing domain, peak day, focus time, and an actionable AI-driven directive.

### 3. Performance & Architecture
* **Lightweight Aggregate Queries**: Optimized query projections (`id, workspace_id, status, priority, due_date, due_time, completed_at, estimated_minutes, actual_minutes`) prevent downloading heavy relational trees.
* **Zero ESLint Warnings**: 100% clean across React 19 rules, `react-hooks/set-state-in-effect`, and TypeScript strict checks.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v20.x` or later
* **npm**: `v10.x` or later

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/afaqahmadcs/TODO-App.git
cd TODO-App

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access Afaq TaskFlow.

### Quality Validation Scripts

```bash
# Type check all TypeScript files
npx tsc --noEmit

# Run ESLint validation (0 errors, 0 warnings)
npm run lint

# Run automated Phase 9 Analytics & Dashboard telemetry test suite (9 test suites)
npx tsx scripts/test-analytics-system.mjs

# Run automated Phase 8 (Interactive Calendar & Rescheduling) test suite
npx tsx scripts/test-calendar-system.mjs

# Run automated Phase 7 (Recurring Engine & Zero Duplication) test suite
npx tsx scripts/test-recurring-system.mjs

# Run automated Phase 6 (Personal, College, Web Dev) test suite
node scripts/test-phase6.mjs

# Run automated Task Service test suite (33 assertions)
npx tsx scripts/test-task-service.mjs

# Run automated Office Workspace & Publishing Matrix test suite
node scripts/test-office-workspace.mjs

# Build production bundle with Next.js Turbopack
npm run build
```

---

## 👤 Creator & Author

**Afaq Ahmad**
* Fullstack Developer & Content Producer
* GitHub: [@afaqahmadcs](https://github.com/afaqahmadcs)
* Repository: [TODO-App](https://github.com/afaqahmadcs/TODO-App.git)

