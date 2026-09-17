export type SearchCategory = "tasks" | "projects" | "pages" | "notes" | "vlogs" | "all";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "tasks" | "projects" | "pages" | "notes" | "vlogs";
  url?: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  meta?: string;
  taskId?: string;
  pageId?: string;
  projectId?: string;
  noteId?: string;
}

export type GroupedSearchResults = {
  TASKS: SearchResultItem[];
  PROJECTS: SearchResultItem[];
  PAGES: SearchResultItem[];
  NOTES: SearchResultItem[];
  "VLOG ENTRIES": SearchResultItem[];
};
