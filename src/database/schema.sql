-- ==============================================================================
-- Afaq TaskFlow - Core Relational PostgreSQL Schema (for Supabase)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('office', 'personal', 'college', 'web-development')),
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Office Channels / Pages (8 Pages)
CREATE TABLE IF NOT EXISTS public.office_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status_summary TEXT,
  is_completed_today BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  office_page_id TEXT REFERENCES public.office_pages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  stage TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  due_date DATE,
  due_time TIME,
  estimated_duration_min INTEGER,
  actual_duration_min INTEGER,
  tags TEXT[] DEFAULT '{}',
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_pattern TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Subtasks Table
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Focus Sessions
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  notes TEXT
);

-- Seed Default Workspaces
INSERT INTO public.workspaces (id, name, slug, type, color) VALUES
  ('office', 'Office', 'office', 'office', '#3b82f6'),
  ('personal', 'Personal', 'personal', 'personal', '#a855f7'),
  ('college', 'College', 'college', 'college', '#10b981'),
  ('web-development', 'Web Development', 'web-development', 'web-development', '#06b6d4')
ON CONFLICT (id) DO NOTHING;

-- Seed Default 8 Office Pages
INSERT INTO public.office_pages (id, title, slug, status_summary, is_completed_today) VALUES
  ('shooting-page', 'Shooting Page', 'shooting-page', 'Reel uploaded', true),
  ('ismail-shahid-fans', 'Ismail Shahid Fans', 'ismail-shahid-fans', 'Daily clip live', true),
  ('zk-production', 'ZK Production', 'zk-production', 'Color grade in progress', false),
  ('jahangir-khan', 'Jahangir Khan', 'jahangir-khan', 'Today 4:00 PM', false),
  ('inaya-kailash', 'Inaya Kailash', 'inaya-kailash', 'Media pending', false),
  ('political-affairs', 'Political Affairs', 'political-affairs', 'Digest live', true),
  ('nazia-iqbal-fanz', 'Nazia Iqbal Fanz', 'nazia-iqbal-fanz', 'Evening 8:00 PM', false),
  ('suno-music', 'Suno Music', 'suno-music', 'Cover art rev', false)
ON CONFLICT (id) DO NOTHING;
