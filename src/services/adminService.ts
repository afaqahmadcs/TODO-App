import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { authService, UserRole, UserAccountStatus } from "@/services/authService";

export interface AdminUserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserAccountStatus;
  createdAt: string;
  lastActiveAt: string;
  timezone?: string;
}

export interface AdminMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

// Fallback accounts for offline evaluation
const DEMO_ACCOUNTS: AdminUserAccount[] = [
  {
    id: "demo-creator-afaq",
    name: "Afaq Ahmad",
    username: "afaqahmad",
    email: "afaq@taskflow.dev",
    avatarUrl: "/assets/avatar.png",
    role: "admin",
    status: "active",
    createdAt: "2026-01-01T08:00:00.000Z",
    lastActiveAt: new Date().toISOString(),
    timezone: "Asia/Karachi",
  },
  {
    id: "usr-demo-sarah",
    name: "Sarah Jenkins",
    username: "sarahj",
    email: "sarah.jenkins@creatorhub.co",
    avatarUrl: "",
    role: "user",
    status: "active",
    createdAt: "2026-09-10T14:20:00.000Z",
    lastActiveAt: "2026-09-17T18:30:00.000Z",
    timezone: "Europe/London",
  },
  {
    id: "usr-demo-david",
    name: "David Chen",
    username: "davidc",
    email: "david.chen@technova.io",
    avatarUrl: "",
    role: "user",
    status: "active",
    createdAt: "2026-09-14T09:15:00.000Z",
    lastActiveAt: "2026-09-18T06:45:00.000Z",
    timezone: "America/New_York",
  },
  {
    id: "usr-demo-inactive",
    name: "Marcus Vance",
    username: "marcusv",
    email: "marcus.vance@legacymail.com",
    avatarUrl: "",
    role: "user",
    status: "inactive",
    createdAt: "2026-06-20T11:00:00.000Z",
    lastActiveAt: "2026-07-02T10:12:00.000Z",
    timezone: "America/Los_Angeles",
  },
];

export const adminService = {
  /**
   * Verify if the current session has admin permissions
   */
  checkAdminAccess: async (): Promise<boolean> => {
    return authService.isAdmin();
  },

  /**
   * Fetch aggregated account-level metrics
   * (Zero exposure of personal tasks or notes)
   */
  getMetrics: async (): Promise<AdminMetrics> => {
    if (isSupabaseConfigured()) {
      try {
        // Try RPC first
        const { data: rpcData, error: rpcError } = await supabase.rpc("get_admin_metrics");
        if (!rpcError && rpcData) {
          const parsed = typeof rpcData === "string" ? JSON.parse(rpcData) : rpcData;
          return {
            totalUsers: Number(parsed.totalUsers) || 0,
            newUsers: Number(parsed.newUsers) || 0,
            activeUsers: Number(parsed.activeUsers) || 0,
            inactiveUsers: Number(parsed.inactiveUsers) || 0,
          };
        }

        // Direct count query fallback
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, status, created_at, last_active_at");

        if (!error && profiles) {
          const now = Date.now();
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

          const totalUsers = profiles.length;
          const newUsers = profiles.filter(
            (p) => new Date(p.created_at).getTime() >= sevenDaysAgo
          ).length;
          const activeUsers = profiles.filter((p) => {
            const lastActive = p.last_active_at ? new Date(p.last_active_at).getTime() : 0;
            return p.status === "active" && lastActive >= thirtyDaysAgo;
          }).length;
          const inactiveUsers = profiles.filter(
            (p) => p.status === "inactive" || (p.last_active_at && new Date(p.last_active_at).getTime() < thirtyDaysAgo)
          ).length;

          return { totalUsers, newUsers, activeUsers, inactiveUsers };
        }
      } catch (err) {
        console.warn("[adminService] Failed to load live admin metrics, falling back to local:", err);
      }
    }

    // Offline mode metrics
    const totalUsers = DEMO_ACCOUNTS.length;
    const newUsers = DEMO_ACCOUNTS.filter(
      (u) => Date.now() - new Date(u.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000
    ).length;
    const activeUsers = DEMO_ACCOUNTS.filter((u) => u.status === "active").length;
    const inactiveUsers = DEMO_ACCOUNTS.filter((u) => u.status === "inactive").length;

    return { totalUsers, newUsers, activeUsers, inactiveUsers };
  },

  /**
   * Fetch registered users account list
   * (Exclusively selects account identity and metadata - no personal tasks, notes, or files)
   */
  getUsersList: async (): Promise<AdminUserAccount[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, username, email, avatar_url, role, status, created_at, last_active_at, timezone")
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data.map((row) => ({
            id: row.id,
            name: row.name || "User",
            username: row.username || row.email?.split("@")[0] || "user",
            email: row.email,
            avatarUrl: row.avatar_url || undefined,
            role: (row.role as UserRole) || "user",
            status: (row.status as UserAccountStatus) || "active",
            createdAt: row.created_at,
            lastActiveAt: row.last_active_at || row.created_at,
            timezone: row.timezone || "Asia/Karachi",
          }));
        }
      } catch (err) {
        console.warn("[adminService] Failed to fetch users list from Supabase:", err);
      }
    }

    return DEMO_ACCOUNTS;
  },

  /**
   * Update account status (e.g. Active, Inactive, Suspended)
   */
  updateUserStatus: async (
    userId: string,
    status: UserAccountStatus
  ): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update user status",
        };
      }
    }

    // Offline update
    const idx = DEMO_ACCOUNTS.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      DEMO_ACCOUNTS[idx].status = status;
    }
    return { success: true };
  },

  /**
   * Update user role (e.g. promote to admin or demote to user)
   */
  updateUserRole: async (
    userId: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ role, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update user role",
        };
      }
    }

    // Offline update
    const idx = DEMO_ACCOUNTS.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      DEMO_ACCOUNTS[idx].role = role;
    }
    return { success: true };
  },
};
