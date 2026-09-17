-- ==============================================================================
-- Afaq TaskFlow - Production Security & Row-Level Security (RLS) Verification
-- Migration 004: 004_production_security_rls.sql
-- 
-- Enforces strict multi-tenant isolation across all 12 database tables:
-- 1. profiles
-- 2. workspaces
-- 3. pages
-- 4. projects
-- 5. tasks
-- 6. subtasks
-- 7. tags
-- 8. task_tags
-- 9. recurring_rules
-- 10. focus_sessions
-- 11. notes
-- 12. notifications
--
-- GUARANTEE: No user can read, insert, update, or delete another user's records.
-- ==============================================================================

-- 1. PROFILES TABLE RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

CREATE POLICY "Users can manage own profile"
    ON public.profiles FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 2. WORKSPACES TABLE RLS
ALTER TABLE IF EXISTS public.workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own workspaces" ON public.workspaces;

CREATE POLICY "Users can manage their own workspaces"
    ON public.workspaces FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 3. PAGES TABLE RLS (Enforced via workspace parent ownership)
ALTER TABLE IF EXISTS public.pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage pages belonging to their workspaces" ON public.pages;

CREATE POLICY "Users can manage pages belonging to their workspaces"
    ON public.pages FOR ALL
    USING (
        workspace_id IN (
            SELECT id FROM public.workspaces WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        workspace_id IN (
            SELECT id FROM public.workspaces WHERE user_id = auth.uid()
        )
    );

-- 4. PROJECTS TABLE RLS
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;

CREATE POLICY "Users can manage their own projects"
    ON public.projects FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 5. TASKS TABLE RLS
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;

CREATE POLICY "Users can manage their own tasks"
    ON public.tasks FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 6. SUBTASKS TABLE RLS (Enforced via parent task ownership)
ALTER TABLE IF EXISTS public.subtasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage subtasks belonging to their tasks" ON public.subtasks;

CREATE POLICY "Users can manage subtasks belonging to their tasks"
    ON public.subtasks FOR ALL
    USING (
        task_id IN (
            SELECT id FROM public.tasks WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        task_id IN (
            SELECT id FROM public.tasks WHERE user_id = auth.uid()
        )
    );

-- 7. TAGS TABLE RLS
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own tags" ON public.tags;

CREATE POLICY "Users can manage their own tags"
    ON public.tags FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 8. TASK_TAGS TABLE RLS (Enforced via task ownership)
ALTER TABLE IF EXISTS public.task_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage task tags belonging to their tasks" ON public.task_tags;

CREATE POLICY "Users can manage task tags belonging to their tasks"
    ON public.task_tags FOR ALL
    USING (
        task_id IN (
            SELECT id FROM public.tasks WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        task_id IN (
            SELECT id FROM public.tasks WHERE user_id = auth.uid()
        )
    );

-- 9. RECURRING_RULES TABLE RLS
ALTER TABLE IF EXISTS public.recurring_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own recurring rules" ON public.recurring_rules;

CREATE POLICY "Users can manage their own recurring rules"
    ON public.recurring_rules FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 10. FOCUS_SESSIONS TABLE RLS
ALTER TABLE IF EXISTS public.focus_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own focus sessions" ON public.focus_sessions;

CREATE POLICY "Users can manage their own focus sessions"
    ON public.focus_sessions FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 11. NOTES TABLE RLS
ALTER TABLE IF EXISTS public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.notes;

CREATE POLICY "Users can manage their own notes"
    ON public.notes FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 12. NOTIFICATIONS TABLE RLS
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;

CREATE POLICY "Users can manage their own notifications"
    ON public.notifications FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ==============================================================================
-- RLS AUDIT VERIFICATION QUERY
-- Run this query to verify that every user-facing table has RLS enabled
-- ==============================================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'workspaces',
    'pages',
    'projects',
    'tasks',
    'subtasks',
    'tags',
    'task_tags',
    'recurring_rules',
    'focus_sessions',
    'notes',
    'notifications'
  )
ORDER BY tablename ASC;
