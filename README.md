# Afaq TaskFlow ⚡

> **A high-performance, domain-segregated personal productivity and work-management system designed with Google Stitch.**

![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Design System](https://img.shields.io/badge/Design_System-Google_Stitch-4F46E5?style=for-the-badge)
![Status](https://img.shields.io/badge/Phase_2-Complete-10B981?style=for-the-badge)

---

## 📖 Executive Overview

**Afaq TaskFlow** is an elite, multi-domain personal productivity application built for **Afaq Ahmad** to seamlessly balance four concurrent high-intensity workloads:
1. **🏢 Office Content & Visual Production** — Managing an 8-page social media publishing matrix, reel schedules, and visual brand assets for clients such as Suno Music.
2. **🎥 Personal Vlog & Creator Suite** — 9-stage video production pipeline (Idea, Hook, Script, Shoot, Ingest, A-Roll, B-Roll, Color Grade, Publish).
3. **🎓 College Academics** — Module management, homework schedules, lab deliverables, and credit hour tracking for CS-401, SE-302, DS-201, and AI-501.
4. **💻 Web Development Mastery** — Fullstack Next.js and systems architecture curriculum, sprint goals, GitHub activity sync, and recurring Monday & Tuesday 4:00 PM – 6:00 PM live virtual classes.

The entire UI/UX is built strictly upon **Google Stitch** design specs, featuring a dark slate palette (`#0B1326`), refined typographic hierarchy, and responsive navigation across desktop, tablet, and mobile.

---

## 🏛️ System Architecture

```
src/
├── app/                              # Next.js 16 App Router Routes
│   ├── layout.tsx                    # Master HTML, font bindings & AppShell
│   ├── globals.css                   # Stitch design tokens & Tailwind v4 theme
│   ├── page.tsx                      # Root route (redirects to /dashboard)
│   ├── dashboard/page.tsx            # Executive Command Center & Telemetry
│   ├── tasks/page.tsx                # Universal Task Inbox (Board & List)
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
│   │   ├── index.ts                  # Layout components barrel export
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
│   │   ├── Icon.tsx                  # Google Material Symbols Outlined
│   │   └── Skeleton.tsx              # Zero-CLS loading skeleton with shimmer
│   ├── tasks/
│   │   ├── TaskCard.tsx              # Interactive cards with priority & workspace dots
│   │   └── QuickTaskModal.tsx        # Universal modal triggered via 'N' shortcut
│   └── common/
│       └── EmptyState.tsx            # Actionable zero-data fallbacks
├── hooks/
│   ├── useKeyboardShortcut.ts        # Event listener for 'N', 'F', 'Cmd+K', 'Esc'
│   └── useMediaQuery.ts              # SSR-safe reactive matchMedia with useSyncExternalStore
├── lib/
│   ├── utils.ts                      # Tailwind merge & utility helpers
│   └── constants.ts                  # Workspaces, 8 Office pages, recurring routines
├── types/
│   ├── task.ts                       # Task, subtask, priorities, durations
│   ├── workspace.ts                  # 4 Workspace definitions & workflow stages
│   ├── navigation.ts                 # Nav items & badges
│   └── database.ts                   # Supabase / PostgreSQL schema interfaces
├── services/
│   └── taskService.ts                # Decoupled repository layer with initial mock tasks
└── database/
    └── schema.sql                    # PostgreSQL relational schema ready for Supabase
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
- [ ] **PHASE 3: Database & Supabase Integration** — Live PostgreSQL tables, Supabase client authentication, RLS policies, and CRUD service integration.
- [ ] **PHASE 4: Full Task System** — Kanban boards, drag & drop, filtering, subtasks, checklists, and time estimation.
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

# Run ESLint validation
npm run lint

# Build production bundle with Next.js Turbopack
npm run build
```

---

## 👤 Creator & Author

**Afaq Ahmad**
* Fullstack Developer & Content Producer
* GitHub: [@afaqahmadcs](https://github.com/afaqahmadcs)
* Repository: [TODO-App](https://github.com/afaqahmadcs/TODO-App.git)
