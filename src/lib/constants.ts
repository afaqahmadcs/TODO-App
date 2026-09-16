import { NavItem, WorkspaceNavItem } from "@/types/navigation";
import { OfficePage, WorkspaceConfig } from "@/types/workspace";

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "space_dashboard" },
  { id: "tasks", label: "My Tasks", href: "/tasks", icon: "task_alt", badge: 12 },
  { id: "calendar", label: "Calendar", href: "/calendar", icon: "calendar_month" },
  { id: "recurring", label: "Recurring Tasks", href: "/recurring", icon: "repeat" },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: "insights" },
];

export const WORKSPACES: WorkspaceConfig[] = [
  {
    id: "office",
    title: "Office",
    subtitle: "Social Media & Visual Production",
    color: "#3b82f6",
    dotColor: "bg-blue-500",
    route: "/office",
    metaBadge: "8 pgs",
  },
  {
    id: "personal",
    title: "Personal",
    subtitle: "Daily Vlog & Content Creation",
    color: "#a855f7",
    dotColor: "bg-purple-500",
    route: "/personal",
    metaBadge: "Vlog",
  },
  {
    id: "college",
    title: "College",
    subtitle: "Academics & Assignments",
    color: "#10b981",
    dotColor: "bg-emerald-500",
    route: "/college",
    metaBadge: "Academics",
  },
  {
    id: "web-development",
    title: "Web Development",
    subtitle: "Next.js, Architecture & Systems",
    color: "#06b6d4",
    dotColor: "bg-cyan-500",
    route: "/web-development",
    metaBadge: "Tech",
  },
];

export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = WORKSPACES.map((w) => ({
  id: w.id,
  label: w.title,
  href: w.route,
  color: w.color,
  metaBadge: w.metaBadge,
}));

export const WORKSPACE_TOOLS: NavItem[] = [
  { id: "projects", label: "Projects", href: "/projects", icon: "folder_special" },
  { id: "notes", label: "Notes & Docs", href: "/notes", icon: "article" },
];

export const OFFICE_PAGES: OfficePage[] = [
  {
    id: "shooting-page",
    title: "Shooting Page",
    shortTitle: "Shooting",
    statusSummary: "Reel uploaded",
    isCompletedToday: true,
    platformTags: ["Reels", "4K"],
  },
  {
    id: "ismail-shahid-fans",
    title: "Ismail Shahid Fans",
    shortTitle: "Ismail Fans",
    statusSummary: "Daily clip live",
    isCompletedToday: true,
    platformTags: ["Reels", "Comedy"],
  },
  {
    id: "zk-production",
    title: "ZK Production",
    shortTitle: "ZK Production",
    statusSummary: "Color grade in progress",
    isCompletedToday: false,
    platformTags: ["Reels", "Cinematic"],
  },
  {
    id: "jahangir-khan",
    title: "Jahangir Khan",
    shortTitle: "Jahangir Khan",
    statusSummary: "Today 4:00 PM",
    isCompletedToday: false,
    platformTags: ["Interview"],
  },
  {
    id: "inaya-kailash",
    title: "Inaya Kailash",
    shortTitle: "Inaya Kailash",
    statusSummary: "Media pending",
    isCompletedToday: false,
    platformTags: ["TikTok", "Reels"],
  },
  {
    id: "political-affairs",
    title: "Political Affairs",
    shortTitle: "Political Affairs",
    statusSummary: "Digest live",
    isCompletedToday: true,
    platformTags: ["Shorts", "News"],
  },
  {
    id: "nazia-iqbal-fanz",
    title: "Nazia Iqbal Fanz",
    shortTitle: "Nazia Iqbal",
    statusSummary: "Evening 8:00 PM",
    isCompletedToday: false,
    platformTags: ["Music", "Reels"],
  },
  {
    id: "suno-music",
    title: "Suno Music",
    shortTitle: "Suno Music",
    statusSummary: "Cover art rev",
    isCompletedToday: false,
    platformTags: ["Visualizer", "Spotify"],
  },
];

export const RECURRING_CLASSES = [
  {
    day: "Monday",
    time: "4:00 PM — 6:00 PM",
    title: "Advanced Fullstack Web Development",
    topics: "Next.js App Router, Server Actions, GraphQL APIs",
    lab: "Virtual Lab #1",
  },
  {
    day: "Tuesday",
    time: "4:00 PM — 6:00 PM",
    title: "Backend Architecture & Distributed Systems",
    topics: "PostgreSQL indexing, Redis caching, async pipelines",
    lab: "Virtual Lab #2",
  },
];
