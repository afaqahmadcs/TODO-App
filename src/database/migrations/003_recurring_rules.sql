-- ==============================================================================
-- Migration 003: Recurring Task System & De-Duplication Constraints
-- ==============================================================================

-- 1. Create recurring_rules table
CREATE TABLE IF NOT EXISTS public.recurring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    template_id TEXT,
    workspace_id TEXT NOT NULL,
    office_page_id TEXT,
    page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    due_time TEXT NOT NULL DEFAULT '09:00',
    estimated_duration_min INTEGER NOT NULL DEFAULT 45,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('EVERY_DAY', 'WEEKDAYS', 'SPECIFIC_WEEKDAYS', 'WEEKLY', 'MONTHLY', 'CUSTOM_INTERVAL')),
    interval INTEGER NOT NULL DEFAULT 1,
    days_of_week INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    day_of_month INTEGER,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'EXPIRED')),
    checklist JSONB DEFAULT '[]'::JSONB,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    last_generated_date DATE,
    next_occurrence TIMESTAMPTZ,
    timezone TEXT NOT NULL DEFAULT 'Asia/Karachi',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add recurring rule tracking to tasks table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS recurring_rule_id UUID REFERENCES public.recurring_rules(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recurrence_instance_date DATE;

-- 3. Composite unique index to prevent duplicate task instances at database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_recurring_rule_instance_unique
ON public.tasks(recurring_rule_id, due_date)
WHERE recurring_rule_id IS NOT NULL;

-- 4. Enable Row Level Security (RLS) on recurring_rules
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recurring rules"
    ON public.recurring_rules FOR ALL USING (
        auth.uid() = user_id OR auth.uid() IS NULL
    );

-- 5. Trigger for recurring_rules updated_at
DROP TRIGGER IF EXISTS set_recurring_rules_updated_at ON public.recurring_rules;
CREATE TRIGGER set_recurring_rules_updated_at BEFORE UPDATE ON public.recurring_rules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
