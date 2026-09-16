import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://placeholder-project.supabase.co" &&
    supabaseAnonKey !== "placeholder-anon-key" &&
    !supabaseUrl.includes("your-project-id")
  );
};

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const createClient = () => {
  if (browserClient) return browserClient;

  if (!isSupabaseConfigured()) {
    // Return a dummy/safe client or warning in dev
    console.warn(
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Using local offline mode."
    );
  }

  browserClient = createBrowserClient<Database>(
    supabaseUrl || "https://placeholder-project.supabase.co",
    supabaseAnonKey || "placeholder-anon-key"
  );

  return browserClient;
};

export const supabase = createClient();
