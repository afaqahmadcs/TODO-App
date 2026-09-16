# Afaq TaskFlow - Production UX & System State Library (Empty, Loading, Error, Modals)

## Design System Fidelity & Tokens
- **Theme**: Dark Slate / Indigo (`#0B1326`, container `#131B2E`, accent `#4F46E5`, emerald `#10B981`, cyan `#06B6D4`, rose `#F43F5E`, amber `#F59E0B`)
- **Font**: Plus Jakarta Sans
- **Radius**: `ROUND_EIGHT` (rounded-lg / rounded-xl)

---

## 1. Unified State System Patterns

### A. Empty States Architecture
Every domain provides contextual, actionable empty states with:
1. **Visual Mark**: Clean geometric duotone icon container with soft accent glow
2. **Clear Heading**: Friendly, specific reassurance (e.g., "No tasks in this workspace yet")
3. **Descriptive Helper**: 1-sentence guidance on how to populate or start
4. **Primary CTA**: Clear high-contrast action button (`[+ Create First Task]`, `[⚡ Use Template]`, `[🔄 Schedule Automation]`)
5. **Secondary CTA**: Helpful alternate workflow (`[Import from Templates]`, `[View Archived]`)

### B. Skeleton Loader States
- Subtle shimmer animation (`shimmer 1.8s infinite ease-in-out`)
- Matches exact layout geometries to eliminate cumulative layout shifts (CLS)
- Muted pulse placeholders for telemetry counters, kanban columns, time-slots, and chart axes

### C. Graceful Error & Recovery States
- Offline telemetry sync fallback banner with auto-reconnect timer
- Network timeout / failed fetch card with one-click `[↺ Retry Sync]` and manual cache view
- Form validation micro-copy with inline badges

---

## 2. Cross-Screen Consistency Audit & Harmonization

| Component | Unified Specification |
| :--- | :--- |
| **Typography** | H1 24px semi-bold, H2 18px medium, body 13-14px regular/medium, mono labels 11-12px tracking-wider uppercase |
| **Workspace Identifiers** | Office: Indigo/Blue (`#3B82F6`), College: Emerald (`#10B981`), WebDev: Cyan (`#06B6D4`), Personal: Purple (`#8B5CF6`) |
| **Priority Tags** | High: Rose pill (`bg-rose-500/15 text-rose-300 border-rose-500/30`), Med: Amber pill, Low: Slate pill |
| **Global Controls** | Primary buttons: `bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm font-medium text-xs/sm rounded-lg px-3.5 py-2` |
| **Mobile Nav** | Fixed persistent bottom navigation (Dashboard, Tasks, Central Floating `+`, Calendar, Workspaces/Analytics) |
