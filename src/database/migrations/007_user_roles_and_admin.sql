-- ==============================================================================
-- Afaq TaskFlow - Migration 007: User Roles, Admin Authorization & Account Security
-- File: 007_user_roles_and_admin.sql
-- 
-- 1. Adds 'role', 'status', and 'last_active_at' columns to public.profiles
-- 2. Creates secure public.is_admin() helper function (SECURITY DEFINER)
-- 3. Adds RLS policy for admins to view account-level profiles (zero task/note access)
-- 4. Creates public.get_admin_metrics() RPC function for aggregated account statistics
-- 5. Updates handle_new_user() onboarding trigger to initialize roles securely
-- ==============================================================================

-- 1. Extend profiles table with role, status, and last_active_at
DO $$
BEGIN
    -- Role column ('admin' or 'user')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'));
    END IF;

    -- Account status ('active', 'inactive', 'suspended')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;

    -- Last active timestamp
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_active_at'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN last_active_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

-- Performance index for role lookups and active user queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at);

-- 2. Secure helper function to check admin role
-- Uses SECURITY DEFINER to inspect auth.uid() securely without client manipulation
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Row Level Security for Profiles
-- Users can view and update their own profile; Admins can view all profile account info
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profile account info" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user status and roles" ON public.profiles;

-- Select policy: User sees own profile; Admin sees all profile accounts
CREATE POLICY "Admins can view all profile account info"
    ON public.profiles FOR SELECT
    USING (public.is_admin() OR id = auth.uid());

-- Update policy: User can update their own profile; Admin can manage status/role
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update user status and roles"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

-- IMPORTANT SECURITY RULE:
-- Notice that tasks, subtasks, projects, notes, and calendar items policies
-- are NOT altered. They remain strictly scoped to (user_id = auth.uid()).
-- An admin CANNOT view other users' private tasks, notes, or documents.

-- 4. Aggregated Admin Metrics Function
-- Returns high-level operational counts without exposing private user content
CREATE OR REPLACE FUNCTION public.get_admin_metrics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    SELECT jsonb_build_object(
        'totalUsers', count(*),
        'newUsers', count(*) FILTER (WHERE created_at >= now() - INTERVAL '7 days'),
        'activeUsers', count(*) FILTER (WHERE last_active_at >= now() - INTERVAL '30 days' AND status = 'active'),
        'inactiveUsers', count(*) FILTER (WHERE status = 'inactive' OR last_active_at < now() - INTERVAL '30 days')
    ) INTO result
    FROM public.profiles;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Updated handle_new_user() onboarding trigger
-- Sets initial owner / first registered account as admin if no admin exists;
-- subsequent accounts default to 'user' role with 4 clean workspaces.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    office_ws_id UUID;
    is_afaq_account BOOLEAN;
    assigned_role TEXT;
    has_existing_admin BOOLEAN;
BEGIN
    -- Check if this is Afaq's primary authenticated account
    is_afaq_account := (
        NEW.email = 'afaq@taskflow.dev' OR 
        NEW.email = 'afaqahmadcs@gmail.com' OR
        NEW.raw_user_meta_data->>'is_primary_creator' = 'true'
    );

    -- Check if an admin already exists in the system
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') INTO has_existing_admin;

    -- The initial owner / first registered account becomes admin; subsequent users become 'user'
    IF NOT has_existing_admin OR is_afaq_account THEN
        assigned_role := 'admin';
    ELSE
        assigned_role := 'user';
    END IF;

    -- 1. Create User Profile with assigned role, active status, and last_active_at
    INSERT INTO public.profiles (
        id, 
        name, 
        email, 
        username,
        avatar_url, 
        timezone,
        role,
        status,
        last_active_at,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'Asia/Karachi'),
        assigned_role,
        'active',
        now(),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        updated_at = now(),
        last_active_at = now();

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
