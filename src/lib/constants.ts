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

export const OFFICE_PAGE_ALIASES: Record<string, string> = {
  "shooting-page": "shooting-film-video", // Shooting Page
  "political-affairs": "new-client-page", // Political Affairs
  "nazia-iqbal-fanz": "nazia-fanz", // Nazia Iqbal Fanz
  "inaya-kailash": "inaya-kailashi", // Inaya Kailash
};

export function resolveCanonicalOfficePageId(pageId?: string | null): string {
  if (!pageId) return "";
  return OFFICE_PAGE_ALIASES[pageId] || pageId;
}

export const OFFICE_PAGES: OfficePage[] = [
  // HIGH PRIORITY — CLIENT REELS (1 to 5)
  {
    id: "shooting-film-video",
    title: "Shooting Film Video",
    shortTitle: "Shooting Film",
    statusSummary: "Reel uploaded",
    isCompletedToday: true,
    platformTags: ["Reels", "4K"],
    priority: "high",
    pageGroup: "client_reels",
  },
  {
    id: "ismail-shahid-fans",
    title: "Ismail Shahid Fans",
    shortTitle: "Ismail Fans",
    statusSummary: "Daily clip live",
    isCompletedToday: true,
    platformTags: ["Reels", "Comedy"],
    priority: "high",
    pageGroup: "client_reels",
  },
  {
    id: "jahangir-khan",
    title: "Jahangir Khan",
    shortTitle: "Jahangir Khan",
    statusSummary: "Today 4:00 PM",
    isCompletedToday: false,
    platformTags: ["Interview", "Reels"],
    priority: "high",
    pageGroup: "client_reels",
  },
  {
    id: "zk-production",
    title: "ZK Production",
    shortTitle: "ZK Production",
    statusSummary: "Color grade in progress",
    isCompletedToday: false,
    platformTags: ["Reels", "Cinematic"],
    priority: "high",
    pageGroup: "client_reels",
  },
  {
    id: "new-client-page",
    title: "New Client Page",
    shortTitle: "New Client",
    statusSummary: "Media slot ready",
    isCompletedToday: false,
    platformTags: ["Reels", "Client"],
    priority: "high",
    pageGroup: "client_reels",
    isEditable: true,
  },

  // MEDIUM PRIORITY — FACEBOOK (6 and 7)
  {
    id: "nazia-fanz",
    title: "Nazia Fanz",
    shortTitle: "Nazia Fanz",
    statusSummary: "Evening 8:00 PM",
    isCompletedToday: false,
    platformTags: ["Facebook", "Reels"],
    priority: "medium",
    pageGroup: "facebook",
  },
  {
    id: "inaya-kailashi",
    title: "Inaya Kailashi",
    shortTitle: "Inaya Kailashi",
    statusSummary: "Media pending",
    isCompletedToday: false,
    platformTags: ["Facebook", "Reels"],
    priority: "medium",
    pageGroup: "facebook",
  },

  // MUSIC (8)
  {
    id: "suno-music",
    title: "Suno Music",
    shortTitle: "Suno Music",
    statusSummary: "Cover art rev",
    isCompletedToday: false,
    platformTags: ["Visualizer", "Spotify"],
    priority: "medium",
    pageGroup: "music",
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
