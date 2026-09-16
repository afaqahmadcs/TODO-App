---
name: Precision Focus Minimal
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#6bd8cb'
  on-secondary: '#003732'
  secondary-container: '#29a195'
  on-secondary-container: '#00302b'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#6f3dd9'
  on-tertiary-container: '#e3d5ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes an environment of quiet confidence, speed, and cognitive clarity. Designed for builders, knowledge workers, and multi-disciplinary professionals managing complex workflows, the interface eliminates friction through purposeful minimalism, hyper-refined layout proportions, and intentional visual hierarchy.

### Design Principles
- **Utilitarian Elegance:** Form strictly follows function, rendered with pixel-level precision. Visual decoration exists solely to communicate status, state, or spatial relationship.
- **Frictionless Density:** High visual density without clutter. The eye can scan large lists of items, tasks, and nested hierarchies effortlessly through balanced typographic scale and generous structural padding.
- **Intentional Contrast:** Neutral canvases keep content center-stage. High-saturation color tokens are reserved exclusively for critical priority levels, active domains, and state progression.
- **Tactile Feedback:** Crisp 1px structural boundaries, micro-interactions with immediate visual acknowledgement, keyboard-first affordances, and understated elevation.

## Colors

The palette leverages a structured slate-neutral architecture paired with a commanding indigo accent and deliberate semantic markers.

### Core Architecture
- **Primary Accent (`#4F46E5`):** Primary interactions, focused selection states, primary call-to-actions, and active global navigation markers.
- **Surface Canvas (Dark Mode - Default):** Base layer `#0F172A`, nested card surface `#1E293B`, elevated menu/modal surface `#334155`.
- **Surface Canvas (Light Mode Support):** Base layer `#F8FAFC`, card surface `#FFFFFF`, elevated surface `#F1F5F9`.
- **Borders & Dividers:** 1px stroke at `#1E293B` (Dark) and `#E2E8F0` (Light). Hover and focus strokes step up to `#334155` and `#CBD5E1` respectively.

### Semantic Priorities
- **High Priority (`#EF4444` / `#F43F5E`):** Urgent, blocking items. Used in flags, pulse badges, and destructive actions.
- **Medium Priority (`#F59E0B`):** Impending deadlines and standard active tasks.
- **Low Priority (`#64748B` / `#3B82F6`):** Backlog, parked items, or ambient reminders.
- **Completed / Success (`#10B981`):** Checkmarks, completed metrics, resolved rows.

### Workspace Domain Identity Tags
- **Office (Professional):** Royal Blue (`#2563EB`)
- **Personal (Creative & Content):** Violet / Fuchsia (`#8B5CF6`)
- **College (Academic):** Warm Emerald / Teal (`#0D9488`)
- **Engineering (Technical):** Cyan / Rust Amber (`#0284C7` / `#F97316`)

## Typography

The typographic hierarchy pairs the contemporary geometric clarity of **Plus Jakarta Sans** for structural headers with the neutral, hyper-legible rendering of **Inter** for dense task rows, metadata, and dynamic forms. **JetBrains Mono** is introduced strictly for keyboard shortcut indicators, timestamps, and technical metadata.

### Application Rules
- Apply negative letter-spacing systematically to display headlines to ensure compact punch.
- Metadata and category badges leverage uppercase `label-sm` with widened letter-spacing (`0.03em`) for instant optical recognition.
- Text colors maintain rigorous contrast: Primary (`#F8FAFC` dark / `#0F172A` light), Muted (`#94A3B8` dark / `#64748B` light), and Subtle (`#64748B` dark / `#94A3B8` light).

## Layout & Spacing

The layout is built on a responsive 12-column grid coupled with a persistent collapsible command rail (navigation sidebar) on desktop.

### Viewport Breakpoints & Reflow
- **Desktop (1280px+):** Fixed sidebar (240px default, 64px icon-only rail), 12-column fluid canvas for task boards/lists, standard `margin-lg` outer boundary, `gutter-lg` between metric panels.
- **Tablet (768px - 1279px):** Sidebar collapses to an off-canvas slide-out or icon rail, main task flow conforms to an 8-column layout with `margin-md` and `gutter-md`.
- **Mobile (<768px):** Single-column stack, persistent bottom action bar for primary task creation, top context bar, layout margins compress to `margin` (16px).

### Spacing Principles
- Gaps between metadata elements inside a task item use `space-xs` (4px) or `space-sm` (8px).
- Component inner padding utilizes `space-md` (12px) for high-density tables and `space-lg` (20px) for standard workspace cards.
- Section boundaries and card stacks standardise on `space-xl` (32px) separation.

## Elevation & Depth

Visual depth is achieved through high-craft low-contrast outlines and ambient, ultra-diffused atmospheric shadows rather than abrupt bevels or opaque drop-shadows.

### Layer Stack
- **Layer 0 (Canvas Base):** Base application background (`#0F172A`).
- **Layer 1 (Cards & Groups):** Surface tone `#1E293B`, framed by a 1px solid stroke of `#334155/60`. Elevation: `0 1px 2px 0 rgba(0, 0, 0, 0.25)`.
- **Layer 2 (Floating Popovers & Flyouts):** Surface tone `#1E293B` elevated with an ambient shadow: `0 10px 25px -5px rgba(0, 0, 0, 0.45), 0 8px 10px -6px rgba(0, 0, 0, 0.35)`. Subtle inset ring `inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`.
- **Layer 3 (Modals & Command Bar `Cmd+K`):** Highest ambient shadow: `0 25px 50px -12px rgba(0, 0, 0, 0.70)`. Background backdrop blur of `12px` using `#0F172A/80`.
- **Interactive Hover Lift:** Cards subtly translate `-1px` on the Y-axis accompanied by a border-color transition to `#4F46E5/40` and an extra 4px diffusion on the ambient shadow.

## Shapes

The design system employs refined, modern roundedness to balance professional discipline with contemporary approachable software design.

### Geometry Standards
- **Small Controls (`rounded` / 0.5rem - 8px):** Checkboxes, tags, dropdown triggers, inline inputs, and keyboard shortcut chips.
- **Medium Panels (`rounded-lg` / 1.0rem - 16px):** Workspace cards, command palettes, task detail view drawers, flyouts, and floating action toolbars.
- **Structural Containers (`rounded-xl` / 1.5rem - 24px):** Primary dashboard overview cards, modal containers, and empty state canvases.
- **Pill Elements (`rounded-full`):** State indicators, priority flags, user avatars, and status badges.

## Components

### Buttons
- **Primary:** Deep indigo fill (`#4F46E5`), crisp white text, 8px corner radius, inset highlight `inset 0 1px 0 rgba(255,255,255,0.15)`. Hover: `#4338CA`.
- **Secondary:** Slate surface with 1px border (`#334155`), muted text transitioning to high-contrast white on hover.
- **Ghost / Action Item:** Transparent background, visible 1px focus rings, background fills to `#1E293B` on hover.
- **Keyboard Shortcut Affordance:** Small mono chip (`JetBrains Mono`, 10px) aligned right, background `#0F172A`, 1px border `#334155`.

### Task Checkboxes
- Custom 18x18px square with 5px radius.
- Unchecked: 1.5px border (`#475569`), transparent interior.
- Checked: Transition to Emerald (`#10B981`) or Indigo (`#4F46E5`) fill with an SVG checkmark. Triggers smooth strike-through and 40% opacity fade on the associated task title.

### Inputs & Dropdowns
- Background `#0F172A`, 1px border `#334155`, placeholder text `#64748B`.
- Active/Focus State: Border snaps to `#4F46E5`, paired with an ambient focus ring: `0 0 0 3px rgba(79, 70, 229, 0.25)`.

### Priority Badges & Indicators
- **High Priority:** 6px crimson dot with subtle outward pulse animation (`#EF4444`) or solid flag icon with crimson tint pill background (`#EF4444/10`).
- **Medium Priority:** Warm Amber (`#F59E0B`) dot or flag with amber tint.
- **Low Priority:** Slate (`#64748B`) subtle indicator.

### Workspace Domain Tags
- Pill chips (`rounded-full`) with `label-sm` text.
- 10% opacity tinted background with full-saturation 1px border and matching foreground text (e.g., Office uses `#2563EB/10` fill with `#2563EB` text and border).

### Cards & Task Items
- **List View:** 48px height rows, separated by 1px subtle divider lines, expanding row tools on hover (drag handle, quick assign, due date).
- **Board/Kanban Card:** Padding `space-md`, surface `#1E293B`, border `#334155/60`, displaying domain tag, title, priority icon, and avatar stack.

### Skeletons & Empty States
- **Skeleton State:** Shimmering sweep gradient transitioning across `#1E293B` to `#334155` at a 45-degree angle with 1.5s infinite loop.
- **Empty States:** Low-contrast technical wireline iconography, succinct headline, single primary action button centered in the viewport.