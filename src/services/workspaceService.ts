import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { WORKSPACES, OFFICE_PAGES } from "@/lib/constants";
import { WorkspaceRow, PageRow } from "@/types/database";
import { authService } from "./authService";

export interface WorkspaceItem {
  id: string;
  name: string;
  type: string;
  icon?: string | null;
  metaBadge?: string;
  color?: string;
}

export interface PageItem {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  active: boolean;
}

export const workspaceService = {
  /**
   * Fetch all workspaces for the active user, falling back to local defaults if offline.
   */
  getWorkspaces: async (): Promise<WorkspaceItem[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("workspaces")
          .select("*")
          .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((w: WorkspaceRow) => {
            const config = WORKSPACES.find(
              (c) => c.id === w.type || c.id.replace("-", "_") === w.type
            );
            return {
              id: w.id,
              name: w.name,
              type: w.type,
              icon: w.icon || config?.dotColor,
              metaBadge: config?.metaBadge,
              color: config?.color,
            };
          });
        }
      } catch (err) {
        console.warn("[workspaceService] Supabase fetch failed, using fallback:", err);
      }
    }

    // Fallback to constants
    return WORKSPACES.map((w) => ({
      id: w.id,
      name: w.title,
      type: w.id,
      icon: w.dotColor,
      metaBadge: w.metaBadge,
      color: w.color,
    }));
  },

  /**
   * Fetch all pages for a specific workspace.
   * GUARANTEE: Afaq's 8 Office publishing pages are ONLY returned for Afaq's account.
   * New users start with an empty page collection.
   */
  getPagesByWorkspace: async (workspaceTypeOrId: string): Promise<PageItem[]> => {
    if (isSupabaseConfigured()) {
      try {
        // If passed workspaceType is a UUID or type name, resolve workspace
        const { data: wsData } = await supabase
          .from("workspaces")
          .select("id")
          .or(`id.eq.${workspaceTypeOrId},type.eq.${workspaceTypeOrId}`)
          .maybeSingle();

        const workspaceId = (wsData as { id: string } | null)?.id || workspaceTypeOrId;

        const { data, error } = await supabase
          .from("pages")
          .select("*")
          .eq("workspace_id", workspaceId)
          .eq("active", true)
          .order("name", { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((p: PageRow) => ({
            id: p.id,
            workspaceId: p.workspace_id,
            name: p.name,
            description: p.description,
            active: p.active,
          }));
        }
      } catch (err) {
        console.warn("[workspaceService] Supabase pages fetch failed, using fallback:", err);
      }
    }

    // Fallback for Office pages: strictly isolated to Afaq's primary account
    const isAfaq = await authService.isCurrentUserAfaq();
    if (isAfaq && (workspaceTypeOrId === "office" || workspaceTypeOrId.includes("office"))) {
      return OFFICE_PAGES.map((p) => ({
        id: p.id,
        workspaceId: "office",
        name: p.title,
        description: p.statusSummary,
        active: true,
      }));
    }

    return [];
  },
};
