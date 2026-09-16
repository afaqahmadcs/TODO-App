# Afaq TaskFlow ⚡

> **A high-performance, domain-segregated personal productivity and work-management system designed with Google Stitch.**

![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Design System](https://img.shields.io/badge/Design_System-Google_Stitch-4F46E5?style=for-the-badge)
![Status](https://img.shields.io/badge/Phase_4-Complete-10B981?style=for-the-badge)

---

## 📖 Executive Overview

**Afaq TaskFlow** is an elite, multi-domain personal productivity application built for **Afaq Ahmad** to seamlessly balance four concurrent high-intensity workloads:
1. **🏢 Office Content & Visual Production** — Managing an 8-page social media publishing matrix, reel schedules, and visual brand assets for clients such as Suno Music.
2. **🎥 Personal Vlog & Creator Suite** — 9-stage video production pipeline (Idea, Hook, Script, Shoot, Ingest, A-Roll, B-Roll, Color Grade, Publish).
3. **🎓 College Academics** — Module management, homework schedules, lab deliverables, and credit hour tracking for CS-401, SE-302, DS-201, and AI-501.
4. **💻 Web Development Mastery** — Fullstack Next.js and systems architecture curriculum, sprint goals, GitHub activity sync, and recurring Monday & Tuesday 4:00 PM – 6:00 PM live virtual classes.

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
│   └── common/
│       └── EmptyState.tsx            # Actionable zero-data fallbacks
├── hooks/
│   ├── useKeyboardShortcut.ts        # Event listener for 'N', 'F', 'Cmd+K', 'Esc'
│   └── useMediaQuery.ts              # SSR-safe reactive matchMedia
├── lib/
│   ├── supabase/                     # Supabase client, server, and middleware helpers
│   ├── utils.ts                      # Tailwind merge & utility helpers
│   └── constants.ts                  # Workspaces, 8 Office pages, recurring routines
├── types/
│   ├── task.ts                       # Task, subtask, priorities, statuses, filters
│   ├── workspace.ts                  # 4 Workspace definitions & workflow stages
│   ├── navigation.ts                 # Nav items & badges
│   └── database.ts                   # Supabase / PostgreSQL schema interfaces
├── services/
│   ├── taskService.ts                # Supabase task repository with CRUD, subtasks & stats
│   └── workspaceService.ts           # Workspace & Office pages repository
├── database/
│   ├── migrations/                   # Sequential SQL migrations (001, 002)
│   └── schema.sql                    # Consolidated PostgreSQL relational schema
└── scripts/
    ├── check-routes.mjs              # Route healthcheck verification
    ├── test-task-service.mjs         # 33-step automated task service test suite
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
- [ ] **PHASE 5: Workspaces & Office Pages** — 8-page publishing matrix, reel queue, and Suno Music visual pipeline.
- [ ] **PHASE 6: Personal, College & Web Dev Modules** — 9-stage vlog pipeline, academic modules, and Monday & Tuesday class trackers.
- [ ] **PHASE 7: Recurring Tasks Engine** — Cron schedules, recurring rule editor, and automated queue population.
- [ ] **PHASE 8: Interactive Calendar** — Day/Week/Month time-blocking and calendar synchronization.
- [ ] **PHASE 9: Analytics & Productivity Telemetry** — Flow-state tracking, weekly velocity, and streak telemetry.
- [ ] **PHASE 10: Notifications & Focus Mode** — In-app alerts, audio chimes, and full-screen Pomodoro mode.
- [ ] **PHASE 11: Search, Filters & Polish** — Command palette search, sorting, tag management, and micro-animations.
- [ ] **PHASE 12: Production Hardening, Security & Deployment** — End-to-end tests, security audit, and deployment pipeline.

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

# Run automated Task Service test suite (33 assertions)
npx tsx scripts/test-task-service.mjs

# Build production bundle with Next.js Turbopack
npm run build
```

---

## 👤 Creator & Author

**Afaq Ahmad**
* Fullstack Developer & Content Producer
* GitHub: [@afaqahmadcs](https://github.com/afaqahmadcs)
* Repository: [TODO-App](https://github.com/afaqahmadcs/TODO-App.git)
