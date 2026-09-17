import { Project, CreateProjectInput, ProjectStatus } from "@/types/project";
import { WorkspaceType } from "@/types/workspace";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-web-portfolio",
    workspaceId: "web-development",
    name: "Portfolio Website",
    description: "Personal developer branding site with 3D canvas models, responsive blog reader, and interactive lab experiments.",
    status: "Polish & Deploy",
    progress: 82,
    tasksTotal: 17,
    tasksCompleted: 14,
    deadline: "Due Oct 25, 2025",
    focusHours: 38.5,
    techStack: ["Next.js", "TailwindCSS", "Framer Motion", "Vercel"],
    linkedVlogId: "task-personal-ep42", // Relational reference to Vlog EP #42
    color: "border-l-cyan-400",
    createdAt: "2025-09-01T10:00:00.000Z",
    updatedAt: "2025-09-15T16:00:00.000Z",
  },
  {
    id: "proj-web-taskflow",
    workspaceId: "web-development",
    name: "Afaq TaskFlow",
    description: "Cross-workspace productivity dashboard with native multi-calendar orchestration, notes, and instant telemetry.",
    status: "In Active Sprint",
    progress: 68,
    tasksTotal: 35,
    tasksCompleted: 24,
    deadline: "Due Nov 15, 2025",
    focusHours: 56.0,
    techStack: ["TypeScript", "React 19", "Supabase", "TailwindCSS"],
    linkedVlogId: "task-personal-ep43", // Relational reference to Vlog EP #43
    color: "border-l-indigo-500",
    createdAt: "2025-08-15T09:00:00.000Z",
    updatedAt: "2025-09-16T12:00:00.000Z",
  },
  {
    id: "proj-web-practice",
    workspaceId: "web-development",
    name: "Practice Projects",
    description: "Algorithmic challenges, graph theory problem sets, Rust memory exploration, and real-time WebGL shader rendering.",
    status: "Active Study",
    progress: 45,
    tasksTotal: 20,
    tasksCompleted: 9,
    deadline: "Ongoing Track",
    focusHours: 22.0,
    techStack: ["LeetCode", "Rust CLI", "WebGL Shaders", "Algorithms"],
    color: "border-l-purple-500",
    createdAt: "2025-09-05T08:00:00.000Z",
    updatedAt: "2025-09-16T14:00:00.000Z",
  },
  {
    id: "proj-college-distkv",
    workspaceId: "college",
    name: "Distributed Key-Value Store",
    description: "CS301 Capstone project implementing Raft consensus, write-ahead logging (WAL), compaction, and gRPC endpoints.",
    status: "in_progress",
    progress: 65,
    tasksTotal: 8,
    tasksCompleted: 5,
    deadline: "Due Nov 12, 2025",
    focusHours: 32.0,
    techStack: ["Go", "gRPC", "Raft", "Distributed Systems"],
    color: "border-l-emerald-500",
    createdAt: "2025-09-02T11:00:00.000Z",
    updatedAt: "2025-09-16T11:30:00.000Z",
  },
  {
    id: "proj-college-hospital",
    workspaceId: "college",
    name: "Hospital Management DB Schema & Normalization",
    description: "CS340 Database architecture course project covering BCNF normalization, indexing, and PostgreSQL stored procedures.",
    status: "active",
    progress: 90,
    tasksTotal: 10,
    tasksCompleted: 9,
    deadline: "Due Oct 24, 2025",
    focusHours: 18.5,
    techStack: ["PostgreSQL", "SQL", "Database Design", "ERD"],
    color: "border-l-teal-500",
    createdAt: "2025-09-04T14:00:00.000Z",
    updatedAt: "2025-09-15T18:00:00.000Z",
  },
  {
    id: "proj-personal-docu",
    workspaceId: "personal",
    name: "YouTube Creator Season 2 Documentary",
    description: "Documenting the dual life of morning agency client work, college computer science, and late night Next.js builds.",
    status: "active",
    progress: 45,
    tasksTotal: 12,
    tasksCompleted: 6,
    deadline: "Due Dec 31, 2025",
    focusHours: 64.0,
    techStack: ["Final Cut Pro", "DaVinci Resolve", "Sony A7IV", "Shure SM7B"],
    color: "border-l-fuchsia-500",
    createdAt: "2025-08-20T10:00:00.000Z",
    updatedAt: "2025-09-16T15:00:00.000Z",
  },
  {
    id: "proj-office-suno",
    workspaceId: "office",
    name: "Suno Music Visual Identity & Album Package",
    description: "Design system, 3000x3000px artwork, Spotify Canvas loops, and promotional banners for Suno Music artists.",
    status: "active",
    progress: 75,
    tasksTotal: 12,
    tasksCompleted: 9,
    deadline: "Due Oct 15, 2025",
    focusHours: 42.0,
    techStack: ["Photoshop", "After Effects", "Figma", "Spotify Canvas"],
    color: "border-l-blue-500",
    createdAt: "2025-09-01T08:00:00.000Z",
    updatedAt: "2025-09-16T16:00:00.000Z",
  }
];

const STORAGE_KEY = "afaq_taskflow_projects_cache";

class ProjectService {
  private localProjects: Project[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          this.localProjects = JSON.parse(cached);
          return;
        }
      } catch (e) {
        console.warn("ProjectService: local storage read failed", e);
      }
    }
    this.localProjects = [...INITIAL_PROJECTS];
    this.saveCache();
  }

  private saveCache() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localProjects));
      } catch (e) {
        console.warn("ProjectService: local storage write failed", e);
      }
    }
  }

  public async getProjects(workspaceId?: WorkspaceType | "all"): Promise<Project[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
        if (workspaceId && workspaceId !== "all") {
          const dbWorkspace = workspaceId === "web-development" ? "web_development" : workspaceId;
          query = query.eq("workspace_id", dbWorkspace);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((row) => ({
            id: row.id,
            userId: row.user_id,
            workspaceId: (row.workspace_id === "web_development" ? "web-development" : row.workspace_id) as WorkspaceType,
            name: row.name,
            description: row.description || undefined,
            status: (row.status as ProjectStatus) || "in_progress",
            progress: row.progress ?? 0,
            deadline: row.due_date || undefined,
            startDate: row.start_date || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase projects query failed, falling back to local cache", err);
      }
    }

    if (!workspaceId || workspaceId === "all") {
      return [...this.localProjects];
    }
    return this.localProjects.filter((p) => p.workspaceId === workspaceId);
  }

  public async getProjectById(id: string): Promise<Project | null> {
    const list = await this.getProjects();
    return list.find((p) => p.id === id) || null;
  }

  public async createProject(input: CreateProjectInput): Promise<Project> {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      status: input.status || "planned",
      progress: input.progress || 0,
      tasksTotal: input.tasksTotal || 0,
      tasksCompleted: input.tasksCompleted || 0,
      deadline: input.deadline,
      focusHours: input.focusHours || 0,
      techStack: input.techStack || [],
      linkedVlogId: input.linkedVlogId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const dbWorkspace = input.workspaceId === "web-development" ? "web_development" : input.workspaceId;
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id || "00000000-0000-0000-0000-000000000001";
        const { data, error } = await supabase.from("projects").insert({
          id: newProj.id,
          user_id: userId,
          name: newProj.name,
          description: newProj.description,
          workspace_id: dbWorkspace,
          status: "in_progress",
          progress: newProj.progress,
        }).select().single();

        if (!error && data) {
          newProj.id = data.id;
        }
      } catch (err) {
        console.warn("Supabase project insert failed, keeping local copy", err);
      }
    }

    this.localProjects.unshift(newProj);
    this.saveCache();
    return newProj;
  }

  public async updateProjectProgress(id: string, progress: number, focusHoursDelta = 0): Promise<Project | null> {
    const proj = this.localProjects.find((p) => p.id === id);
    if (!proj) return null;

    proj.progress = Math.min(100, Math.max(0, progress));
    if (focusHoursDelta) {
      proj.focusHours = (proj.focusHours || 0) + focusHoursDelta;
    }
    proj.updatedAt = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("projects").update({
          progress: proj.progress,
          updated_at: proj.updatedAt,
        }).eq("id", id);
      } catch (err) {
        console.warn("Supabase project update failed", err);
      }
    }

    this.saveCache();
    return { ...proj };
  }
}

export const projectService = new ProjectService();
