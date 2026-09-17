import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

export interface AuthUserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  timezone?: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error?: string | null;
}

const LOCAL_STORAGE_USER_KEY = "afaq_taskflow_auth_user";

// Default demo creator profile when running in offline / evaluation mode
const DEMO_USER: AuthUserProfile = {
  id: "demo-creator-afaq",
  email: "afaq@taskflow.dev",
  name: "Afaq Ahmad",
  avatarUrl: "/assets/avatar.png",
  timezone: "Asia/Karachi",
};

export const authService = {
  /**
   * Check if Supabase live authentication is configured
   */
  isConfigured: (): boolean => {
    return isSupabaseConfigured();
  },

  /**
   * Get the current authenticated user profile
   */
  getUser: async (): Promise<AuthUserProfile | null> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          return null;
        }

        const user = data.user;
        return {
          id: user.id,
          email: user.email || "",
          name:
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Creator",
          avatarUrl: user.user_metadata?.avatar_url || "/assets/avatar.png",
          timezone: user.user_metadata?.timezone || "Asia/Karachi",
        };
      } catch (err) {
        console.warn("[authService] Failed to fetch Supabase user:", err);
      }
    }

    // Offline / Demo fallback
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {}
    }

    return DEMO_USER;
  },

  /**
   * Get active Supabase session
   */
  getSession: async (): Promise<Session | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return null;
      return data.session;
    } catch {
      return null;
    }
  },

  /**
   * Sign In with Email and Password
   */
  signIn: async (email: string, password: string): Promise<AuthResult> => {
    if (!email || !password) {
      return { user: null, session: null, error: "Email and password are required." };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          return { user: null, session: null, error: error.message };
        }

        return { user: data.user, session: data.session, error: null };
      } catch (err: unknown) {
        return {
          user: null,
          session: null,
          error: err instanceof Error ? err.message : "Authentication failed.",
        };
      }
    }

    // Offline / demo sign-in
    const localUser: AuthUserProfile = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      name: email.split("@")[0] || "Afaq Ahmad",
      avatarUrl: "/assets/avatar.png",
      timezone: "Asia/Karachi",
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localUser));
      } catch {}
    }

    return {
      user: {
        id: localUser.id,
        email: localUser.email,
        app_metadata: {},
        user_metadata: { name: localUser.name },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as unknown as User,
      session: null,
      error: null,
    };
  },

  /**
   * Sign Up with Email, Password, and Name
   */
  signUp: async (email: string, password: string, fullName?: string): Promise<AuthResult> => {
    if (!email || !password) {
      return { user: null, session: null, error: "Email and password are required." };
    }

    if (password.length < 6) {
      return { user: null, session: null, error: "Password must be at least 6 characters." };
    }

    if (isSupabaseConfigured()) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: fullName?.trim() || email.split("@")[0],
              avatar_url: "/assets/avatar.png",
            },
            emailRedirectTo: `${siteUrl}/auth/callback`,
          },
        });

        if (error) {
          return { user: null, session: null, error: error.message };
        }

        return { user: data.user, session: data.session, error: null };
      } catch (err: unknown) {
        return {
          user: null,
          session: null,
          error: err instanceof Error ? err.message : "Sign up request failed.",
        };
      }
    }

    // Offline / demo sign-up
    const localUser: AuthUserProfile = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      name: fullName?.trim() || email.split("@")[0] || "Afaq Ahmad",
      avatarUrl: "/assets/avatar.png",
      timezone: "Asia/Karachi",
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localUser));
      } catch {}
    }

    return {
      user: {
        id: localUser.id,
        email: localUser.email,
        app_metadata: {},
        user_metadata: { name: localUser.name },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as unknown as User,
      session: null,
      error: null,
    };
  },

  /**
   * Sign Out current user
   */
  signOut: async (): Promise<{ error?: string | null }> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) return { error: error.message };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Sign out failed." };
      }
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      } catch {}
    }

    return { error: null };
  },

  /**
   * Request password reset email
   */
  resetPassword: async (email: string): Promise<{ success: boolean; error?: string | null }> => {
    if (!email) return { success: false, error: "Please enter your email address." };

    if (isSupabaseConfigured()) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${siteUrl}/auth/callback?type=recovery`,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Password reset request failed.",
        };
      }
    }

    return { success: true };
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) => {
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(callback);
      return data.subscription;
    }

    return {
      unsubscribe: () => {},
    };
  },
};
