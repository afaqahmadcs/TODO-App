import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { noteService } from "@/services/noteService";
import { OFFICE_PAGES } from "@/lib/constants";
import {
  SearchCategory,
  GroupedSearchResults,
} from "@/types/search";

export const searchService = {
  /**
   * Search across Tasks, Projects, Pages, Notes, and Vlog entries.
   * Returns grouped results in high-speed, deterministic order.
   */
  searchAll: async (
    query: string,
    categoryFilter: SearchCategory = "all"
  ): Promise<GroupedSearchResults> => {
    const trimmed = query.trim().toLowerCase();

    const grouped: GroupedSearchResults = {
      TASKS: [],
      PROJECTS: [],
      PAGES: [],
      NOTES: [],
      "VLOG ENTRIES": [],
    };

    if (!trimmed) {
      return grouped;
    }

    // 1. SEARCH TASKS & VLOGS
    if (
      categoryFilter === "all" ||
      categoryFilter === "tasks" ||
      categoryFilter === "vlogs"
    ) {
      try {
        const allTasks = await taskService.getTasks();

        for (const t of allTasks) {
          const isVlog =
            t.workspaceId === "personal" ||
            Boolean(t.linkedVlogEpisode) ||
            Boolean(t.tags?.includes("vlog"));

          const titleMatch = t.title.toLowerCase().includes(trimmed);
          const descMatch = t.description?.toLowerCase().includes(trimmed) || false;
          const tagMatch = t.tags?.some((tag) => tag.toLowerCase().includes(trimmed)) || false;
          const noteMatch = t.notes?.toLowerCase().includes(trimmed) || false;
          const captionMatch = t.caption?.toLowerCase().includes(trimmed) || false;
          const episodeMatch = t.linkedVlogEpisode?.toLowerCase().includes(trimmed) || false;

          if (titleMatch || descMatch || tagMatch || noteMatch || captionMatch || episodeMatch) {
            if (isVlog) {
              if (categoryFilter === "all" || categoryFilter === "vlogs") {
                grouped["VLOG ENTRIES"].push({
                  id: t.id,
                  title: t.title,
                  subtitle: t.linkedVlogEpisode
                    ? `${t.linkedVlogEpisode} • ${t.description || "Vlog Episode"}`
                    : t.description || "Creator suite vlog deliverable",
                  category: "vlogs",
                  icon: "videocam",
                  badge: t.publishingStatus || t.status.toUpperCase(),
                  badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
                  meta: t.dueTime ? `Due ${t.dueTime}` : t.dueDate || undefined,
                  taskId: t.id,
                  url: `/personal?id=${t.id}`,
                });
              }
            } else {
              if (categoryFilter === "all" || categoryFilter === "tasks") {
                grouped.TASKS.push({
                  id: t.id,
                  title: t.title,
                  subtitle: t.description || `${t.workspaceId.toUpperCase()} deliverable`,
                  category: "tasks",
                  icon: "task_alt",
                  badge: t.priority.toUpperCase(),
                  badgeColor:
                    t.priority === "high" || t.priority === "urgent"
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      : "bg-blue-500/15 text-blue-300 border-blue-500/30",
                  meta: t.dueDate ? `Due ${t.dueDate}` : undefined,
                  taskId: t.id,
                  url: `/tasks?id=${t.id}`,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn("[searchService] Tasks search failed:", err);
      }
    }

    // 2. SEARCH PROJECTS
    if (categoryFilter === "all" || categoryFilter === "projects") {
      try {
        const allProjects = await projectService.getProjects();

        for (const p of allProjects) {
          const nameMatch = p.name.toLowerCase().includes(trimmed);
          const descMatch = p.description?.toLowerCase().includes(trimmed) || false;
          const stackMatch = p.techStack?.some((s) => s.toLowerCase().includes(trimmed)) || false;
          const statusMatch = p.status.toLowerCase().includes(trimmed);

          if (nameMatch || descMatch || stackMatch || statusMatch) {
            grouped.PROJECTS.push({
              id: p.id,
              title: p.name,
              subtitle: p.description || "",
              category: "projects",
              icon: "folder_special",
              badge: `${p.progress}% Done`,
              badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
              meta: p.deadline,
              projectId: p.id,
              url: `/projects?id=${p.id}`,
            });
          }
        }
      } catch (err) {
        console.warn("[searchService] Projects search failed:", err);
      }
    }

    // 3. SEARCH PAGES (Office Social Publishing Matrix)
    if (categoryFilter === "all" || categoryFilter === "pages") {
      for (const pg of OFFICE_PAGES) {
        const titleMatch = pg.title.toLowerCase().includes(trimmed);
        const shortMatch = pg.shortTitle.toLowerCase().includes(trimmed);
        const summaryMatch = pg.statusSummary.toLowerCase().includes(trimmed);
        const tagMatch = pg.platformTags?.some((t) => t.toLowerCase().includes(trimmed)) || false;

        if (titleMatch || shortMatch || summaryMatch || tagMatch) {
          grouped.PAGES.push({
            id: `page-${pg.id}`,
            title: pg.title,
            subtitle: `${(pg.platformTags || []).join(" • ")} — ${pg.statusSummary}`,
            category: "pages",
            icon: "apartment",
            badge: "Office Page",
            badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
            meta: pg.isCompletedToday ? "Completed Today" : "Pending",
            pageId: pg.id,
            url: `/office?page=${pg.id}`,
          });
        }
      }
    }

    // 4. SEARCH NOTES
    if (categoryFilter === "all" || categoryFilter === "notes") {
      try {
        const allNotes = await noteService.getNotes();

        for (const n of allNotes) {
          const titleMatch = n.title.toLowerCase().includes(trimmed);
          const snippetMatch = n.snippet.toLowerCase().includes(trimmed);
          const contentMatch = n.content?.toLowerCase().includes(trimmed) || false;
          const catMatch = n.category.toLowerCase().includes(trimmed);
          const tagMatch = n.tags?.some((t) => t.toLowerCase().includes(trimmed)) || false;

          if (titleMatch || snippetMatch || contentMatch || catMatch || tagMatch) {
            grouped.NOTES.push({
              id: n.id,
              title: n.title,
              subtitle: n.snippet,
              category: "notes",
              icon: "article",
              badge: n.category,
              badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
              meta: n.updated,
              noteId: n.id,
              url: `/notes?id=${n.id}`,
            });
          }
        }
      } catch (err) {
        console.warn("[searchService] Notes search failed:", err);
      }
    }

    return grouped;
  },
};
