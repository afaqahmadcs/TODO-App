-- ==============================================================================
-- Afaq TaskFlow - Migration 006: Multi-User Architecture & Global Templates
-- File: 006_multi_user_templates_and_ownership.sql
-- 
-- 1. Adds direct user_id ownership to pages & recurring_tasks
-- 2. Creates global task_templates catalog with read-only RLS for authenticated users
-- 3. Seeds 5 standard built-in productivity templates
-- 4. Overhauls handle_new_user() onboarding trigger for clean account provisioning
-- ==============================================================================

-- ==============================================================================
-- 1. USER-SCOPING PAGES TABLE
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'pages' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.pages 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        -- Backfill user_id from parent workspaces
        UPDATE public.pages p
        SET user_id = w.user_id
        FROM public.workspaces w
        WHERE p.workspace_id = w.id AND p.user_id IS NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pages_user_id ON public.pages(user_id);

-- Update RLS for pages to direct user_id check
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage pages belonging to their workspaces" ON public.pages;
DROP POLICY IF EXISTS "Users can manage their own pages" ON public.pages;

CREATE POLICY "Users can manage their own pages"
    ON public.pages FOR ALL
    USING (user_id = auth.uid() OR workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()))
    WITH CHECK (user_id = auth.uid() OR workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()));

-- ==============================================================================
-- 2. USER-SCOPING RECURRING_TASKS TABLE
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'recurring_tasks'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'recurring_tasks' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE public.recurring_tasks 
            ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

            -- Backfill user_id from parent tasks
            UPDATE public.recurring_tasks rt
            SET user_id = t.user_id
            FROM public.tasks t
            WHERE rt.task_id = t.id AND rt.user_id IS NULL;
        END IF;

        CREATE INDEX IF NOT EXISTS idx_recurring_tasks_user_id ON public.recurring_tasks(user_id);

        ALTER TABLE public.recurring_tasks ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage recurring rules belonging to their tasks" ON public.recurring_tasks;
        DROP POLICY IF EXISTS "Users can manage their own recurring tasks" ON public.recurring_tasks;

        CREATE POLICY "Users can manage their own recurring tasks"
            ON public.recurring_tasks FOR ALL
            USING (user_id = auth.uid() OR task_id IN (SELECT id FROM public.tasks WHERE user_id = auth.uid()))
            WITH CHECK (user_id = auth.uid() OR task_id IN (SELECT id FROM public.tasks WHERE user_id = auth.uid()));
    END IF;
END $$;

-- ==============================================================================
-- 3. GLOBAL BUILT-IN TEMPLATES CATALOG (task_templates)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.task_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    workspace_type TEXT NOT NULL CHECK (workspace_type IN ('office', 'personal', 'college', 'web_development', 'general')),
    default_priority TEXT NOT NULL DEFAULT 'medium' CHECK (default_priority IN ('low', 'medium', 'high', 'urgent')),
    default_duration INTEGER NOT NULL DEFAULT 45,
    workflow_type TEXT NOT NULL DEFAULT 'standard',
    subtasks JSONB NOT NULL DEFAULT '[]'::JSONB,
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    is_system BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on task_templates: Global read-only for authenticated users
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read global templates" ON public.task_templates;
DROP POLICY IF EXISTS "Only service role can modify global templates" ON public.task_templates;

CREATE POLICY "Authenticated users can read global templates"
    ON public.task_templates FOR SELECT
    USING (true);

-- Seed 5 Core Global Templates (idempotent upsert)
INSERT INTO public.task_templates (
    id, name, description, workspace_type, default_priority, default_duration, workflow_type, subtasks, tags, is_system
) VALUES 
(
    'tmpl-daily-task',
    'Daily Task Template',
    'Structured workflow for daily planning, priority execution, and evening retrospective review.',
    'personal',
    'high',
    60,
    'daily_planning',
    '[
        {"title": "Review calendar commitments & deadlines", "completed": false},
        {"title": "Identify top 3 non-negotiable priority tasks", "completed": false},
        {"title": "Execute morning focus block (deep work)", "completed": false},
        {"title": "Clear communication inbox & status updates", "completed": false},
        {"title": "Evening log: document progress & prepare tomorrow", "completed": false}
    ]'::JSONB,
    ARRAY['daily', 'planning', 'routine'],
    true
),
(
    'tmpl-weekly-review',
    'Weekly Review Template',
    'Comprehensive end-of-week audit to review open loops, project milestones, and upcoming goals.',
    'personal',
    'high',
    45,
    'weekly_audit',
    '[
        {"title": "Process inbox notes and loose papers to zero", "completed": false},
        {"title": "Review previous week completed tasks vs targets", "completed": false},
        {"title": "Audit all active project progress bars", "completed": false},
        {"title": "Schedule upcoming week focus sessions & deadlines", "completed": false},
        {"title": "Backup critical design assets and code repositories", "completed": false}
    ]'::JSONB,
    ARRAY['review', 'planning', 'milestones'],
    true
),
(
    'tmpl-vlog-workflow',
    'Vlog Workflow Template',
    'Complete multi-stage production pipeline from initial concept to master release.',
    'personal',
    'high',
    120,
    'creator_pipeline',
    '[
        {"title": "Draft episode outline, hook & B-roll shotlist", "completed": false},
        {"title": "Film A-roll dialogue and 4K B-roll footage", "completed": false},
        {"title": "Import media, sync audio & build assembly cut", "completed": false},
        {"title": "Color grade, sound design & motion graphics", "completed": false},
        {"title": "Design 16:9 and 9:16 high-CTR thumbnail variants", "completed": false},
        {"title": "Write title, description, chapters & schedule upload", "completed": false}
    ]'::JSONB,
    ARRAY['vlog', 'youtube', 'production'],
    true
),
(
    'tmpl-study-session',
    'Study Session Template',
    'Focused academic deep-work block incorporating spaced repetition and problem-solving.',
    'college',
    'medium',
    90,
    'academic_study',
    '[
        {"title": "Review lecture slides and core theoretical concepts", "completed": false},
        {"title": "Solve 3-5 textbook problems / algorithmic challenges", "completed": false},
        {"title": "Summarize key formulas and architectural diagrams", "completed": false},
        {"title": "Self-quiz on challenging definitions and proofs", "completed": false}
    ]'::JSONB,
    ARRAY['study', 'college', 'deep-work'],
    true
),
(
    'tmpl-content-publishing',
    'Content Publishing Workflow',
    'Standard publishing and multi-platform distribution checklist for client channels.',
    'office',
    'high',
    60,
    'content_distribution',
    '[
        {"title": "Final review of visual assets and video export quality", "completed": false},
        {"title": "Craft tailored captions, hashtags & CTA per platform", "completed": false},
        {"title": "Schedule publication across YouTube, IG, TikTok & FB", "completed": false},
        {"title": "Monitor first-hour engagement & reply to top comments", "completed": false}
    ]'::JSONB,
    ARRAY['office', 'publishing', 'social-media'],
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    workspace_type = EXCLUDED.workspace_type,
    default_priority = EXCLUDED.default_priority,
    default_duration = EXCLUDED.default_duration,
    workflow_type = EXCLUDED.workflow_type,
    subtasks = EXCLUDED.subtasks,
    tags = EXCLUDED.tags,
    is_system = EXCLUDED.is_system;

-- ==============================================================================
-- 4. CLEAN ONBOARDING TRIGGER (handle_new_user)
-- Multi-user isolation: provisions profile & clean workspaces with ZERO task pollution
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    office_ws_id UUID;
    is_afaq_account BOOLEAN;
BEGIN
    -- Determine if this account is Afaq's primary account
    is_afaq_account := (
        NEW.email = 'afaq@taskflow.dev' OR 
        NEW.email = 'afaqahmadcs@gmail.com' OR
        NEW.raw_user_meta_data->>'is_primary_creator' = 'true'
    );

    -- 1. Create User Profile
    INSERT INTO public.profiles (
        id, 
        name, 
        email, 
        username,
        avatar_url, 
        timezone,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '/assets/avatar.png'),
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'Asia/Karachi'),
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Provision 4 clean default workspaces for the new user
    INSERT INTO public.workspaces (user_id, name, type, icon)
    VALUES (NEW.id, 'Office', 'office', 'hub')
    RETURNING id INTO office_ws_id;

    INSERT INTO public.workspaces (user_id, name, type, icon)
    VALUES (NEW.id, 'Personal', 'personal', 'smart_display');

    INSERT INTO public.workspaces (user_id, name, type, icon)
    VALUES (NEW.id, 'College', 'college', 'school');

    INSERT INTO public.workspaces (user_id, name, type, icon)
    VALUES (NEW.id, 'Web Development', 'web_development', 'code_blocks');

    -- 3. ONLY for Afaq's account, preconfigure Afaq's 8 Office publishing pages
    -- Regular users start completely clean with 0 pages, 0 tasks, 0 notes, 0 projects
    IF is_afaq_account THEN
        INSERT INTO public.pages (workspace_id, user_id, name, description, active)
        VALUES
            (office_ws_id, NEW.id, 'Shooting Page', 'Visual filming, production schedule, equipment checklist', true),
            (office_ws_id, NEW.id, 'Ismail Shahid Fans', 'Reel content, comedy sketches, audience interaction', true),
            (office_ws_id, NEW.id, 'ZK Production', 'Master editing pipeline, video uploads, client reviews', true),
            (office_ws_id, NEW.id, 'Jahangir Khan', 'Creator channel management, premiere scheduling', true),
            (office_ws_id, NEW.id, 'Inaya Kailash', 'Social content matrix, lifestyle reels, brand campaigns', true),
            (office_ws_id, NEW.id, 'Political Affairs', 'News clippings, analytical posts, rapid commentary', true),
            (office_ws_id, NEW.id, 'Nazia Iqbal Fanz', 'Music reels, tribute clips, audience engagement', true),
            (office_ws_id, NEW.id, 'Suno Music', 'Album visual identity, teaser assets, delivery packages', true);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
