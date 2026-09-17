import { Project, CreateProjectInput, ProjectStatus } from "@/types/project";
import { WorkspaceType } from "@/types/workspace";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { authService } from "./authService";

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
    deadline: "Due in 2 Weeks",
    focusHours: 38.5,
    techStack: ["Next.js", "TailwindCSS", "Framer Motion", "Vercel"],
    linkedVlogId: "task-personal-ep42", // Relational reference to Vlog EP #42
    color: "border-l-cyan-400",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
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
    deadline: "Next Month",
    focusHours: 56.0,
    techStack: ["TypeScript", "React 19", "Supabase", "TailwindCSS"],
    linkedVlogId: "task-personal-ep43", // Relational reference to Vlog EP #43
    color: "border-l-indigo-500",
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-college-distkv",
    workspaceId: "college",
    name: "Distributed Key-Value Store",
    description: "Capstone project exploring scalable client-server architectures, Raft consensus, and gRPC endpoints.",
    status: "active",
    progress: 85,
    tasksTotal: 15,
    tasksCompleted: 13,
    deadline: "Next Week",
    focusHours: 42.0,
    techStack: ["Go", "gRPC", "Raft Consensus", "Distributed Systems"],
    color: "border-l-emerald-500",
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-college-capstone",
    workspaceId: "college",
    name: "Fullstack Architecture & Systems Capstone",
    description: "Distributed systems and cloud architecture course capstone covering microservices, caching layers, and high-concurrency workloads.",
    status: "active",
    progress: 90,
    tasksTotal: 10,
    tasksCompleted: 9,
    deadline: "Due This Month",
    focusHours: 24.5,
    techStack: ["PostgreSQL", "Next.js", "Redis", "System Design"],
    color: "border-l-teal-500",
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
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
    deadline: "Year-End Release",
    focusHours: 64.0,
    techStack: ["Final Cut Pro", "DaVinci Resolve", "Sony A7IV", "Shure SM7B"],
    color: "border-l-fuchsia-500",
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    updatedAt: new Date().toISOString(),
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
    deadline: "Due This Week",
    focusHours: 42.0,
    techStack: ["Photoshop", "After Effects", "Figma", "Spotify Canvas"],
    color: "border-l-blue-500",
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

class ProjectService {
  private localProjects: Project[] = [];
  private currentUserId: string | null = null;

  private async ensureProjectsLoaded(): Promise<{ userId: string; isAfaq: boolean; projects: Project[] }> {
    const user = await authService.getUser();
    const userId = user?.id || "anonymous";
    const isAfaq = user?.email?.toLowerCase() === "afaq@taskflow.dev" ||
                   user?.email?.toLowerCase() === "afaqahmadcs@gmail.com" ||
                   userId === "demo-creator-afaq";

    if (this.currentUserId !== userId) {
      this.currentUserId = userId;
      const storageKey = `afaq_taskflow_projects_${userId}`;
      let loaded: Project[] | null = null;
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(storageKey);
          if (cached) {
            loaded = JSON.parse(cached);
          }
        } catch {}
      }

      if (loaded) {
        this.localProjects = loaded;
      } else if (isAfaq) {
        this.localProjects = INITIAL_PROJECTS.map((p) => ({ ...p, userId }));
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(storageKey, JSON.stringify(this.localProjects));
          } catch {}
        }
      } else {
        // Clean account for all other users: 0 projects!
        this.localProjects = [];
      }
    }

    return { userId, isAfaq, projects: this.localProjects };
  }

  private saveCache(userId: string) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`afaq_taskflow_projects_${userId}`, JSON.stringify(this.localProjects));
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

    const { projects } = await this.ensureProjectsLoaded();
    if (!workspaceId || workspaceId === "all") {
      return [...projects];
    }
    return projects.filter((p) => p.workspaceId === workspaceId);
  }

  public async getProjectById(id: string): Promise<Project | null> {
    const list = await this.getProjects();
    return list.find((p) => p.id === id) || null;
  }

  public async createProject(input: CreateProjectInput): Promise<Project> {
    const { userId } = await this.ensureProjectsLoaded();
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      userId: userId,
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
        const activeUserId = userData?.user?.id || userId;
        const { data, error } = await supabase.from("projects").insert({
          id: newProj.id,
          user_id: activeUserId,
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
    this.saveCache(userId);
    return newProj;
  }

  public async updateProjectProgress(id: string, progress: number, focusHoursDelta = 0): Promise<Project | null> {
    const { userId } = await this.ensureProjectsLoaded();
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

    this.saveCache(userId);
    return { ...proj };
  }
}

export const projectService = new ProjectService();
