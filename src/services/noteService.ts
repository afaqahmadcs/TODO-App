import { NoteItem, CreateNoteInput, NoteCategory } from "@/types/note";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { authService } from "./authService";

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

let cachedNotes: NoteItem[] = [];
let currentLoadedUserId: string | null = null;

async function ensureNotesLoaded(): Promise<{ userId: string; isAfaq: boolean; notes: NoteItem[] }> {
  const user = await authService.getUser();
  const userId = user?.id || "anonymous";
  const isAfaq = user?.email?.toLowerCase() === "afaq@taskflow.dev" ||
                 user?.email?.toLowerCase() === "afaqahmadcs@gmail.com" ||
                 userId === "demo-creator-afaq";

  if (currentLoadedUserId !== userId) {
    currentLoadedUserId = userId;
    const storageKey = `afaq_taskflow_notes_${userId}`;
    let loaded: NoteItem[] | null = null;

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          loaded = JSON.parse(raw);
        }
      } catch {}
    }

    if (loaded) {
      cachedNotes = loaded;
    } else if (isAfaq) {
      cachedNotes = [...INITIAL_NOTES];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(cachedNotes));
        } catch {}
      }
    } else {
      // Clean account: 0 notes for new users
      cachedNotes = [];
    }
  }

  return { userId, isAfaq, notes: cachedNotes };
}

function persistNotes(userId: string) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`afaq_taskflow_notes_${userId}`, JSON.stringify(cachedNotes));
    } catch {}
  }
}

export const noteService = {
  getNotes: async (category?: string): Promise<NoteItem[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .order("updated_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row) => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            category: "General" as NoteCategory,
            snippet: row.content ? row.content.slice(0, 120) + "..." : "",
            content: row.content || "",
            updated: new Date(row.updated_at).toLocaleDateString(),
            color: "border-l-primary",
            tags: [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
        }
      } catch (err) {
        console.warn("[noteService] Supabase notes fetch failed, using fallback:", err);
      }
    }

    const { notes } = await ensureNotesLoaded();

    if (category && category !== "All") {
      return notes.filter((n) => n.category.toLowerCase() === category.toLowerCase());
    }

    return [...notes];
  },

  createNote: async (input: CreateNoteInput): Promise<NoteItem> => {
    const { userId } = await ensureNotesLoaded();
    const categoryColors: Record<NoteCategory, string> = {
      "Web Development": "border-l-cyan-500",
      Office: "border-l-blue-500",
      Personal: "border-l-purple-500",
      College: "border-l-emerald-500",
    };

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      userId: userId,
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

    if (isSupabaseConfigured()) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const activeUserId = userData?.user?.id || userId;
        await supabase.from("notes").insert({
          id: newNote.id,
          user_id: activeUserId,
          title: newNote.title,
          content: newNote.content,
        });
      } catch (err) {
        console.warn("[noteService] Supabase note insert failed, keeping local:", err);
      }
    }

    cachedNotes.unshift(newNote);
    persistNotes(userId);

    return newNote;
  },

  getNoteById: async (id: string): Promise<NoteItem | null> => {
    const list = await noteService.getNotes();
    const found = list.find((n) => n.id === id);
    return found ? { ...found } : null;
  },

  updateNote: async (id: string, updates: Partial<CreateNoteInput>): Promise<NoteItem | null> => {
    const { userId } = await ensureNotesLoaded();
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

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("notes").update({
          title: updated.title,
          content: updated.content,
          updated_at: updated.updatedAt,
        }).eq("id", id);
      } catch (err) {
        console.warn("[noteService] Supabase note update failed:", err);
      }
    }

    persistNotes(userId);
    return updated;
  },

  deleteNote: async (id: string): Promise<boolean> => {
    const { userId } = await ensureNotesLoaded();
    cachedNotes = cachedNotes.filter((n) => n.id !== id);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("notes").delete().eq("id", id);
      } catch (err) {
        console.warn("[noteService] Supabase note delete failed:", err);
      }
    }

    persistNotes(userId);
    return true;
  },
};

