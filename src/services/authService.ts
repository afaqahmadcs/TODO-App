import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

export type UserRole = "admin" | "user";
export type UserAccountStatus = "active" | "inactive" | "suspended";

export interface SocialLinks {
  [key: string]: string | undefined;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  facebook?: string;
  x?: string;
  linkedin?: string;
  github?: string;
}

export interface AuthUserProfile {
  id: string;
  email: string;
  name: string;
  username?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  website?: string;
  avatarUrl?: string;
  role: UserRole;
  status?: UserAccountStatus;
  lastActiveAt?: string;
  createdAt?: string;
  socialLinks?: SocialLinks;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error?: string | null;
}

const LOCAL_STORAGE_USER_KEY = "afaq_taskflow_auth_user";

// Default realistic demo creator profile when running in offline / evaluation mode
const DEMO_USER: AuthUserProfile = {
  id: "demo-creator-afaq",
  email: "afaq@taskflow.dev",
  name: "Afaq Ahmad",
  username: "afaqahmad",
  bio: "Visual Content Producer & Fullstack Developer. Managing 8 client channels while building modern web applications.",
  location: "Peshawar, Pakistan",
  timezone: "Asia/Karachi",
  website: "https://afaqahmad.dev",
  avatarUrl: "/assets/avatar.png",
  role: "admin",
  status: "active",
  lastActiveAt: new Date().toISOString(),
  createdAt: "2026-01-01T00:00:00.000Z",
  socialLinks: {
    instagram: "https://instagram.com/afaqahmad",
    youtube: "https://youtube.com/@afaqahmad",
    tiktok: "https://tiktok.com/@afaqahmad",
    x: "https://x.com/afaqahmadcs",
    github: "https://github.com/afaqahmadcs",
    linkedin: "https://linkedin.com/in/afaqahmad",
  },
};

// Listeners for real-time profile updates across components
type ProfileListener = (profile: AuthUserProfile) => void;
const profileListeners = new Set<ProfileListener>();

function notifyProfileChange(profile: AuthUserProfile) {
  for (const listener of profileListeners) {
    try {
      listener(profile);
    } catch (err) {
      console.error("[authService] Listener error:", err);
    }
  }
}

/**
 * Synchronize lightweight session cookie for Next.js Edge Middleware
 */
function syncAuthCookies(user: AuthUserProfile | null) {
  if (typeof document === "undefined") return;
  if (user) {
    const sessionData = {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    };
    document.cookie = `taskflow-session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = "taskflow-session=; path=/; max-age=0; SameSite=Lax";
  }
}

export const authService = {
  /**
   * Check if Supabase live authentication is configured
   */
  isConfigured: (): boolean => {
    return isSupabaseConfigured();
  },

  /**
   * Subscribe to live profile changes
   */
  onProfileChange: (callback: ProfileListener) => {
    profileListeners.add(callback);
    return () => {
      profileListeners.delete(callback);
    };
  },

  /**
   * Alias for getUser to provide consistent profile fetching API
   */
  getProfile: async (): Promise<AuthUserProfile | null> => {
    return authService.getUser();
  },

  /**
   * Get the current authenticated user profile
   */
  getUser: async (): Promise<AuthUserProfile | null> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data.user) {
          const user = data.user;

          // Attempt to fetch extended profile from public.profiles table
          let dbProfile: Partial<AuthUserProfile> & { role?: UserRole; status?: UserAccountStatus; last_active_at?: string; created_at?: string } = {};
          try {
            const { data: profRow } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .maybeSingle();

            if (profRow) {
              dbProfile = {
                name: profRow.name,
                username: profRow.username || undefined,
                bio: profRow.bio || undefined,
                location: profRow.location || undefined,
                timezone: profRow.timezone,
                website: profRow.website || undefined,
                avatarUrl: profRow.avatar_url ?? undefined,
                role: (profRow.role as UserRole) || undefined,
                status: (profRow.status as UserAccountStatus) || undefined,
                last_active_at: profRow.last_active_at || undefined,
                created_at: profRow.created_at || undefined,
                socialLinks: (profRow.social_links as SocialLinks) || undefined,
              };
            }
          } catch {
            // If table query fails, fallback to user_metadata
          }

          const metadata = user.user_metadata || {};
          const isAfaq = user.email?.toLowerCase() === "afaq@taskflow.dev" || 
                         user.email?.toLowerCase() === "afaqahmadcs@gmail.com" ||
                         metadata.is_primary_creator === true;

          const determinedRole: UserRole = dbProfile.role || (metadata.role as UserRole) || (isAfaq ? "admin" : "user");

          const resolvedProfile: AuthUserProfile = {
            id: user.id,
            email: user.email || "",
            name:
              dbProfile.name ||
              metadata.name ||
              metadata.full_name ||
              user.email?.split("@")[0] ||
              (isAfaq ? "Afaq Ahmad" : "User"),
            username: dbProfile.username || metadata.username || user.email?.split("@")[0] || (isAfaq ? "afaqahmad" : "user"),
            bio: dbProfile.bio !== undefined ? dbProfile.bio : (metadata.bio || (isAfaq ? DEMO_USER.bio : "")),
            location: dbProfile.location !== undefined ? dbProfile.location : (metadata.location || (isAfaq ? DEMO_USER.location : "")),
            timezone: dbProfile.timezone || metadata.timezone || "Asia/Karachi",
            website: dbProfile.website !== undefined ? dbProfile.website : (metadata.website || (isAfaq ? DEMO_USER.website : "")),
            avatarUrl: dbProfile.avatarUrl !== undefined ? dbProfile.avatarUrl : (metadata.avatar_url ?? (isAfaq ? DEMO_USER.avatarUrl : "")),
            role: determinedRole,
            status: dbProfile.status || "active",
            lastActiveAt: dbProfile.last_active_at || new Date().toISOString(),
            createdAt: dbProfile.created_at || user.created_at || new Date().toISOString(),
            socialLinks: dbProfile.socialLinks || metadata.social_links || (isAfaq ? DEMO_USER.socialLinks : {}),
          };

          syncAuthCookies(resolvedProfile);
          return resolvedProfile;
        }
      } catch (err) {
        console.warn("[authService] Failed to fetch Supabase user:", err);
      }
    }

    // Offline / Demo fallback
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          syncAuthCookies(parsed);
          return parsed;
        }
      } catch {}
    }

    syncAuthCookies(DEMO_USER);
    return DEMO_USER;
  },

  /**
   * Check if current active user has the admin role
   */
  isAdmin: async (): Promise<boolean> => {
    const user = await authService.getUser();
    return user?.role === "admin";
  },

  /**
   * Check if current active user is Afaq Ahmad's primary account
   */
  isCurrentUserAfaq: async (): Promise<boolean> => {
    const user = await authService.getUser();
    if (!user) return false;
    const email = (user.email || "").toLowerCase();
    return email === "afaq@taskflow.dev" || email === "afaqahmadcs@gmail.com" || user.id === "demo-creator-afaq";
  },

  /**
   * Update the user's profile information
   */
  updateProfile: async (
    updates: Partial<AuthUserProfile>
  ): Promise<{ success: boolean; profile: AuthUserProfile | null; error?: string }> => {
    try {
      const current = await authService.getUser();
      const merged: AuthUserProfile = {
        ...(current || DEMO_USER),
        ...updates,
        // Preserve admin role unless explicitly updated by authorized admin
        role: updates.role || current?.role || "user",
        socialLinks: {
          ...(current?.socialLinks || DEMO_USER.socialLinks),
          ...(updates.socialLinks || {}),
        },
      };

      if (isSupabaseConfigured()) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData.user) {
            // 1. Update Supabase Auth user metadata
            await supabase.auth.updateUser({
              data: {
                name: merged.name,
                username: merged.username,
                bio: merged.bio,
                location: merged.location,
                timezone: merged.timezone,
                website: merged.website,
                avatar_url: merged.avatarUrl || "",
                social_links: merged.socialLinks,
              },
            });

            // 2. Update public.profiles row
            await supabase
              .from("profiles")
              .upsert({
                id: authData.user.id,
                name: merged.name,
                email: merged.email || authData.user.email || "afaqahmadcs@gmail.com",
                username: merged.username,
                bio: merged.bio,
                location: merged.location,
                timezone: merged.timezone,
                website: merged.website,
                avatar_url: merged.avatarUrl || "",
                role: merged.role,
                status: merged.status || "active",
                last_active_at: new Date().toISOString(),
                social_links: merged.socialLinks,
                updated_at: new Date().toISOString(),
              });
          }
        } catch (dbErr: unknown) {
          console.warn("[authService] Supabase profile sync failed, persisting locally:", dbErr);
        }
      }

      // Persist to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(merged));
        } catch {}
      }

      syncAuthCookies(merged);

      // Broadcast update to all live listeners
      notifyProfileChange(merged);

      return { success: true, profile: merged };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      return { success: false, profile: null, error: message };
    }
  },

  /**
   * Upload an avatar photo with validation and Supabase Storage support
   */
  uploadAvatar: async (
    file: File
  ): Promise<{ success: boolean; avatarUrl?: string; error?: string }> => {
    // 1. Validate file format: JPG, JPEG, PNG, WEBP
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        success: false,
        error: "Invalid file type. Supported formats: JPG, JPEG, PNG, and WEBP.",
      };
    }

    // 2. Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        error: "Image is too large. Maximum allowed file size is 5MB.",
      };
    }

    // 3. Supabase Storage upload if configured
    if (isSupabaseConfigured()) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const fileExt = file.name.split(".").pop() || "png";
          const filePath = `${authData.user.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, {
              upsert: true,
              cacheControl: "3600",
            });

          if (!uploadError) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(filePath);

            await authService.updateProfile({ avatarUrl: publicUrl });
            return { success: true, avatarUrl: publicUrl };
          } else {
            console.warn("[authService] Storage upload failed, falling back to local:", uploadError);
          }
        }
      } catch (err) {
        console.warn("[authService] Supabase upload failed:", err);
      }
    }

    // 4. Local / Offline base64 DataURL fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Url = reader.result as string;
        await authService.updateProfile({ avatarUrl: base64Url });
        resolve({ success: true, avatarUrl: base64Url });
      };
      reader.onerror = () => {
        resolve({ success: false, error: "Failed to read image file." });
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Remove the current avatar photo and restore initials fallback
   */
  removeAvatar: async (): Promise<{ success: boolean }> => {
    const result = await authService.updateProfile({ avatarUrl: "" });
    return { success: result.success };
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

        if (data.user) {
          // Fetch database profile to set proper cookie role
          let role: UserRole = "user";
          try {
            const { data: prof } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", data.user.id)
              .maybeSingle();
            if (prof?.role === "admin") role = "admin";
          } catch {}

          syncAuthCookies({
            id: data.user.id,
            email: data.user.email || email.trim(),
            name: data.user.user_metadata?.name || email.split("@")[0],
            role,
          });
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
    const isAfaq = email.trim().toLowerCase() === "afaq@taskflow.dev" || email.trim().toLowerCase() === "afaqahmadcs@gmail.com";
    const localUser: AuthUserProfile = isAfaq
      ? DEMO_USER
      : {
          id: `usr-${Date.now()}`,
          email: email.trim(),
          name: email.split("@")[0] || "User",
          username: email.split("@")[0] || "user",
          bio: "",
          location: "",
          timezone: "Asia/Karachi",
          website: "",
          avatarUrl: "",
          role: "user",
          status: "active",
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          socialLinks: {},
        };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localUser));
      } catch {}
    }
    syncAuthCookies(localUser);
    notifyProfileChange(localUser);

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
   * Sign Up with Email, Password, and Full Name
   */
  signUp: async (
    email: string, 
    password: string, 
    fullName?: string, 
    timezone?: string
  ): Promise<AuthResult> => {
    if (!email || !password) {
      return { user: null, session: null, error: "Email and password are required." };
    }

    if (password.length < 6) {
      return { user: null, session: null, error: "Password must be at least 6 characters." };
    }

    const detectedTimezone = timezone || "Asia/Karachi";

    if (isSupabaseConfigured()) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: fullName?.trim() || email.split("@")[0],
              username: email.split("@")[0],
              avatar_url: "",
              timezone: detectedTimezone,
            },
            emailRedirectTo: `${siteUrl}/auth/callback`,
          },
        });

        if (error) {
          return { user: null, session: null, error: error.message };
        }

        if (data.user) {
          syncAuthCookies({
            id: data.user.id,
            email: data.user.email || email.trim(),
            name: fullName?.trim() || email.split("@")[0],
            role: "user",
          });
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

    // Offline / demo sign-up: Clean user with 0 tasks and 0 copied pages
    const isAfaq = email.trim().toLowerCase() === "afaq@taskflow.dev" || email.trim().toLowerCase() === "afaqahmadcs@gmail.com";
    const localUser: AuthUserProfile = isAfaq
      ? DEMO_USER
      : {
          id: `usr-${Date.now()}`,
          email: email.trim(),
          name: fullName?.trim() || email.split("@")[0] || "User",
          username: email.split("@")[0] || "user",
          bio: "",
          location: "",
          timezone: detectedTimezone,
          website: "",
          avatarUrl: "",
          role: "user",
          status: "active",
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          socialLinks: {},
        };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localUser));
      } catch {}
    }
    syncAuthCookies(localUser);
    notifyProfileChange(localUser);

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

    syncAuthCookies(null);
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
          redirectTo: `${siteUrl}/reset-password`,
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
   * Update password (e.g. from /reset-password screen)
   */
  updatePassword: async (newPassword: string): Promise<{ success: boolean; error?: string | null }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update password.",
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
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
          syncAuthCookies(null);
        }
        callback(event, session);
      });
      return data.subscription;
    }

    return {
      unsubscribe: () => {},
    };
  },
};
