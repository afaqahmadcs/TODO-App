/**
 * Supabase Database TypeScript Schema Definition for Afaq TaskFlow.
 * Reflects all 12 core tables, Row Level Security, and multi-workspace domain structure.
 * Includes Relationships array for 100% compatibility with @supabase/postgrest-js v2.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WorkspaceType = "office" | "personal" | "college" | "web_development";
export type ProjectStatus = "planned" | "in_progress" | "active" | "paused" | "completed";
export type TaskStatus = "todo" | "in_progress" | "review" | "ready" | "published" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "custom";
export type NotificationType = "reminder" | "deadline" | "system" | "streak";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          timezone: string;
          role?: "admin" | "user";
          status?: "active" | "inactive" | "suspended";
          last_active_at?: string;
          username?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          social_links?: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          timezone?: string;
          role?: "admin" | "user";
          status?: "active" | "inactive" | "suspended";
          last_active_at?: string;
          username?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          social_links?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          timezone?: string;
          role?: "admin" | "user";
          status?: "active" | "inactive" | "suspended";
          last_active_at?: string;
          username?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          social_links?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      workspaces: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: WorkspaceType;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: WorkspaceType;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: WorkspaceType;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      pages: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          name: string;
          description?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string | null;
          name?: string;
          description?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      projects: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          status: ProjectStatus;
          progress: number;
          start_date: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          status?: ProjectStatus;
          progress?: number;
          start_date?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          status?: ProjectStatus;
          progress?: number;
          start_date?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      tasks: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          page_id: string | null;
          project_id: string | null;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          due_time: string | null;
          estimated_minutes: number;
          actual_minutes: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          page_id?: string | null;
          project_id?: string | null;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          due_time?: string | null;
          estimated_minutes?: number;
          actual_minutes?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string;
          page_id?: string | null;
          project_id?: string | null;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          due_time?: string | null;
          estimated_minutes?: number;
          actual_minutes?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      subtasks: {
        Row: {
          id: string;
          task_id: string;
          title: string;
          completed: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          title: string;
          completed?: boolean;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          title?: string;
          completed?: boolean;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      task_tags: {
        Row: {
          task_id: string;
          tag_id: string;
        };
        Insert: {
          task_id: string;
          tag_id: string;
        };
        Update: {
          task_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };

      recurring_tasks: {
        Row: {
          id: string;
          user_id: string | null;
          task_id: string;
          frequency: RecurringFrequency;
          interval: number;
          days_of_week: number[] | null;
          start_date: string;
          end_date: string | null;
          next_occurrence: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          task_id: string;
          frequency: RecurringFrequency;
          interval?: number;
          days_of_week?: number[] | null;
          start_date: string;
          end_date?: string | null;
          next_occurrence?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          task_id?: string;
          frequency?: RecurringFrequency;
          interval?: number;
          days_of_week?: number[] | null;
          start_date?: string;
          end_date?: string | null;
          next_occurrence?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      recurring_rules: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          description: string | null;
          template_id: string | null;
          workspace_id: string;
          office_page_id: string | null;
          page_id: string | null;
          project_id: string | null;
          priority: TaskPriority;
          due_time: string;
          estimated_duration_min: number;
          start_date: string;
          end_date: string | null;
          recurrence_type: string;
          interval: number;
          days_of_week: number[] | null;
          day_of_month: number | null;
          status: string;
          checklist: string[] | null;
          tags: string[] | null;
          last_generated_date: string | null;
          next_occurrence: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          description?: string | null;
          template_id?: string | null;
          workspace_id: string;
          office_page_id?: string | null;
          page_id?: string | null;
          project_id?: string | null;
          priority?: TaskPriority;
          due_time?: string;
          estimated_duration_min?: number;
          start_date?: string;
          end_date?: string | null;
          recurrence_type: string;
          interval?: number;
          days_of_week?: number[] | null;
          day_of_month?: number | null;
          status?: string;
          checklist?: string[] | null;
          tags?: string[] | null;
          last_generated_date?: string | null;
          next_occurrence?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          description?: string | null;
          template_id?: string | null;
          workspace_id?: string;
          office_page_id?: string | null;
          page_id?: string | null;
          project_id?: string | null;
          priority?: TaskPriority;
          due_time?: string;
          estimated_duration_min?: number;
          start_date?: string;
          end_date?: string | null;
          recurrence_type?: string;
          interval?: number;
          days_of_week?: number[] | null;
          day_of_month?: number | null;
          status?: string;
          checklist?: string[] | null;
          tags?: string[] | null;
          last_generated_date?: string | null;
          next_occurrence?: string | null;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          started_at: string;
          ended_at: string | null;
          duration_minutes: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_minutes?: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_minutes?: number;
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      notes: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string | null;
          task_id: string | null;
          title: string;
          content: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id?: string | null;
          task_id?: string | null;
          title: string;
          content?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string | null;
          task_id?: string | null;
          title?: string;
          content?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          type: NotificationType;
          title: string;
          message: string;
          scheduled_for: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          type: NotificationType;
          title: string;
          message: string;
          scheduled_for?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string | null;
          type?: NotificationType;
          title?: string;
          message?: string;
          scheduled_for?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      task_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          workspace_type: string;
          default_priority: TaskPriority;
          default_duration: number;
          workflow_type: string;
          subtasks: Json;
          tags: string[];
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          workspace_type: string;
          default_priority?: TaskPriority;
          default_duration?: number;
          workflow_type?: string;
          subtasks?: Json;
          tags?: string[];
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          workspace_type?: string;
          default_priority?: TaskPriority;
          default_duration?: number;
          workflow_type?: string;
          subtasks?: Json;
          tags?: string[];
          is_system?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_admin_metrics: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      workspace_type: WorkspaceType;
      project_status: ProjectStatus;
      task_status: TaskStatus;
      task_priority: TaskPriority;
      recurring_frequency: RecurringFrequency;
      notification_type: NotificationType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience Type Aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type WorkspaceRow = Database["public"]["Tables"]["workspaces"]["Row"];
export type PageRow = Database["public"]["Tables"]["pages"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type TaskDbRow = Database["public"]["Tables"]["tasks"]["Row"];
export type SubtaskRow = Database["public"]["Tables"]["subtasks"]["Row"];
export type TagRow = Database["public"]["Tables"]["tags"]["Row"];
export type TaskTagRow = Database["public"]["Tables"]["task_tags"]["Row"];
export type RecurringTaskRow = Database["public"]["Tables"]["recurring_tasks"]["Row"];
export type FocusSessionRow = Database["public"]["Tables"]["focus_sessions"]["Row"];
export type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type TaskTemplateRow = Database["public"]["Tables"]["task_templates"]["Row"];
