/**
 * Supabase Database TypeScript schema definition.
 * Prepared for Phase 3 integration with PostgreSQL.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          type: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          type: string;
          color: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          type?: string;
          color?: string;
          created_at?: string;
        };
      };
      office_pages: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status_summary: string | null;
          is_completed_today: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          slug: string;
          status_summary?: string | null;
          is_completed_today?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          status_summary?: string | null;
          is_completed_today?: boolean;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          workspace_id: string;
          office_page_id: string | null;
          status: string;
          stage: string | null;
          priority: string;
          due_date: string | null;
          due_time: string | null;
          estimated_duration_min: number | null;
          actual_duration_min: number | null;
          tags: string[];
          is_recurring: boolean;
          recurring_pattern: string | null;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          workspace_id: string;
          office_page_id?: string | null;
          status?: string;
          stage?: string | null;
          priority?: string;
          due_date?: string | null;
          due_time?: string | null;
          estimated_duration_min?: number | null;
          actual_duration_min?: number | null;
          tags?: string[];
          is_recurring?: boolean;
          recurring_pattern?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          workspace_id?: string;
          office_page_id?: string | null;
          status?: string;
          stage?: string | null;
          priority?: string;
          due_date?: string | null;
          due_time?: string | null;
          estimated_duration_min?: number | null;
          actual_duration_min?: number | null;
          tags?: string[];
          is_recurring?: boolean;
          recurring_pattern?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
