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

// In-memory store for dynamic page title updates (persisted in offline/fallback mode)
const dynamicPageOverrides: Record<string, string> = {};

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
            name: dynamicPageOverrides[p.id] || dynamicPageOverrides[p.name] || p.name,
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
        name: dynamicPageOverrides[p.id] || p.title,
        description: p.statusSummary,
        active: true,
      }));
    }

    return [];
  },

  /**
   * Renames an Office page (e.g. renaming "New Client Page" once client name is known).
   * Persists to Supabase public.pages and updates in-memory registry.
   * DOES NOT BREAK HISTORICAL TASK OCCURRENCES because tasks reference the stable page ID.
   */
  updatePageName: async (pageId: string, newName: string): Promise<boolean> => {
    if (!pageId || !newName.trim()) return false;
    const cleanName = newName.trim();

    // Update in-memory registry
    dynamicPageOverrides[pageId] = cleanName;

    // Also update OFFICE_PAGES constant in memory if matching
    const matchingConst = OFFICE_PAGES.find(
      (p) => p.id === pageId || p.title.toLowerCase() === pageId.toLowerCase()
    );
    if (matchingConst) {
      matchingConst.title = cleanName;
      matchingConst.shortTitle = cleanName.length > 14 ? cleanName.substring(0, 14) : cleanName;
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("pages")
          .update({ name: cleanName, updated_at: new Date().toISOString() })
          .or(`id.eq.${pageId},name.ilike.%${pageId}%`);

        if (error) {
          console.warn("[workspaceService] Supabase update page name error:", error);
        }
      } catch (err) {
        console.warn("[workspaceService] Failed to update page name in Supabase:", err);
      }
    }

    return true;
  },

  /**
   * Get dynamic override for a page title if one exists
   */
  getPageTitleOverride: (pageId: string): string | undefined => {
    return dynamicPageOverrides[pageId];
  },
};
