import { NoteItem, CreateNoteInput, NoteCategory } from "@/types/note";

const LOCAL_STORAGE_NOTES_KEY = "afaq_taskflow_notes";

const INITIAL_NOTES: NoteItem[] = [
  {
    id: "note-1",
    title: "Next.js 15 Server Actions & Optimistic Cache Notes",
    category: "Web Development",
    snippet: "Key findings on revalidateTag vs revalidatePath. Optimistic updates in React 19...",
    content: "# Next.js 15 Server Actions\n\n- Use revalidateTag for granular cache invalidation.\n- Always wrap optimistic UI in startTransition.\n- Leverage Turbopack for fast HMR in development.",
    updated: "2 hours ago",
    color: "border-l-cyan-500",
    tags: ["nextjs", "react19", "cache"],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "note-2",
    title: "Suno Music Album Launch Visual Concept Brief",
    category: "Office",
    snippet: "Cyberpunk retro-wave palette: #6BD8CB cyan, #4F46E5 indigo, #F43F5E crimson...",
    content: "# Suno Music Visual Brief\n\n- Neon glow effects across album artwork.\n- High-contrast typography with Outfit font.\n- Export 4K master reel and 9:16 vertical shorts.",
    updated: "Yesterday",
    color: "border-l-blue-500",
    tags: ["suno", "visuals", "branding"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "note-3",
    title: "Vlog EP #42 Episode Script Outline",
    category: "Personal",
    snippet: "Hook: 3 mistakes I made setting up fullstack authentication. B-roll cut points...",
    content: "# Vlog EP #42 Outline\n\n- 00:00 Hook: Debugging auth until 3 AM.\n- 02:15 Studio b-roll with A7IV.\n- 05:30 College lecture highlights.\n- 08:45 Web dev milestone demo.",
    updated: "3 days ago",
    color: "border-l-purple-500",
    tags: ["vlog", "script", "youtube"],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "note-4",
    title: "Algorithm Complexity: Big-O Cheat Sheet (CS-401)",
    category: "College",
    snippet: "Master theorem derivations, divide and conquer recurrence relations...",
    content: "# CS-401 Big-O Cheat Sheet\n\n- T(n) = aT(n/b) + f(n)\n- Case 1: f(n) = O(n^(log_b(a) - e))\n- Case 2: f(n) = Theta(n^(log_b(a)) * log^k(n))\n- Graph traversal: BFS/DFS O(V + E).",
    updated: "5 days ago",
    color: "border-l-emerald-500",
    tags: ["algorithms", "college", "cs401"],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "note-5",
    title: "Web Development Ideas & Architecture Sprint",
    category: "Web Development",
    snippet: "Micro-frontends, event-driven state sync with Supabase Realtime, and Web Audio synthesis...",
    content: "# Web Dev Ideas\n\n- Implement ambient audio soundscapes during focus sprints.\n- Real-time multiplayer kanban boards.\n- Automated Git commit activity feed widget.",
    updated: "1 week ago",
    color: "border-l-cyan-500",
    tags: ["webdev", "ideas", "architecture"],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

let cachedNotes: NoteItem[] = [...INITIAL_NOTES];

export const noteService = {
  getNotes: async (category?: string): Promise<NoteItem[]> => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY);
        if (raw) {
          cachedNotes = JSON.parse(raw);
        }
      } catch {}
    }

    if (category && category !== "All") {
      return cachedNotes.filter((n) => n.category.toLowerCase() === category.toLowerCase());
    }

    return [...cachedNotes];
  },

  createNote: async (input: CreateNoteInput): Promise<NoteItem> => {
    const categoryColors: Record<NoteCategory, string> = {
      "Web Development": "border-l-cyan-500",
      Office: "border-l-blue-500",
      Personal: "border-l-purple-500",
      College: "border-l-emerald-500",
    };

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: input.title,
      category: input.category,
      snippet: input.snippet || (input.content ? input.content.slice(0, 120) + "..." : ""),
      content: input.content || input.snippet,
      updated: "Just now",
      color: categoryColors[input.category] || "border-l-secondary",
      tags: input.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    cachedNotes.unshift(newNote);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(cachedNotes));
      } catch {}
    }

    return newNote;
  },

  getNoteById: async (id: string): Promise<NoteItem | null> => {
    await noteService.getNotes();
    const found = cachedNotes.find((n) => n.id === id);
    return found ? { ...found } : null;
  },

  updateNote: async (id: string, updates: Partial<CreateNoteInput>): Promise<NoteItem | null> => {
    await noteService.getNotes();
    const index = cachedNotes.findIndex((n) => n.id === id);
    if (index === -1) return null;

    const existing = cachedNotes[index];
    const updated: NoteItem = {
      ...existing,
      ...updates,
      updated: "Just now",
      updatedAt: new Date().toISOString(),
    };
    cachedNotes[index] = updated;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(cachedNotes));
      } catch {}
    }
    return updated;
  },

  deleteNote: async (id: string): Promise<boolean> => {
    cachedNotes = cachedNotes.filter((n) => n.id !== id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(cachedNotes));
      } catch {}
    }
    return true;
  },
};
