-- ==============================================================================
-- Afaq TaskFlow - Migration 008: Office Daily Content Management & 8 Pages
-- ==============================================================================
-- 1. Updates and guarantees the exact 8 canonical Office pages
--    - High Priority Client Reels (5):
--        1. Shooting Film Video
--        2. Ismail Shahid Fans
--        3. Jahangir Khan
--        4. ZK Production
--        5. New Client Page (temporary name, editable later)
--    - Medium Priority Facebook (2):
--        6. Nazia Fanz
--        7. Inaya Kailashi
--    - Music (1):
--        8. Suno Music
-- 2. Upserts canonical recurring rules for daily reel generation & Suno pipeline
-- ==============================================================================

DO $$
DECLARE
    ws_record RECORD;
    shooting_page_id UUID;
    ismail_page_id UUID;
    jahangir_page_id UUID;
    zk_page_id UUID;
    new_client_page_id UUID;
    nazia_page_id UUID;
    inaya_page_id UUID;
    suno_page_id UUID;
BEGIN
    FOR ws_record IN 
        SELECT id, user_id FROM public.workspaces WHERE type = 'office'
    LOOP
        -- 1. Update existing legacy page names to Phase 15 canonical names
        UPDATE public.pages 
        SET name = 'Shooting Film Video', 
            description = 'Visual filming, 4K reel drops, camera rig & sound stage setup'
        WHERE workspace_id = ws_record.id AND (name = 'Shooting Page' OR name = 'Shooting Film Video');

        UPDATE public.pages 
        SET name = 'Inaya Kailashi', 
            description = 'Social content matrix, lifestyle reels, Facebook & TikTok drops'
        WHERE workspace_id = ws_record.id AND (name = 'Inaya Kailash' OR name = 'Inaya Kailashi');

        UPDATE public.pages 
        SET name = 'Nazia Fanz', 
            description = 'Music reels, video clips & Facebook audience engagement'
        WHERE workspace_id = ws_record.id AND (name = 'Nazia Iqbal Fanz' OR name = 'Nazia Fanz');

        UPDATE public.pages 
        SET name = 'New Client Page', 
            description = 'Temporary client slot — page name editable by admin/user'
        WHERE workspace_id = ws_record.id AND (name = 'Political Affairs' OR name = 'New Client Page');

        -- 2. Upsert each of the 8 canonical pages
        -- 1. Shooting Film Video
        INSERT INTO public.pages (workspace_id, name, description, active)
        SELECT ws_record.id, 'Shooting Film Video', 'Visual filming, 4K reel drops, camera rig & sound stage setup', true
        WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Shooting Film Video');

        -- 2. Ismail Shahid Fans
        INSERT INTO public.pages (workspace_id, name, description, active)
        SELECT ws_record.id, 'Ismail Shahid Fans', 'Daily comedy sketches, short clips & high-engagement reels', true
        WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Ismail Shahid Fans');

        -- 3. Jahangir Khan
        INSERT INTO public.pages (workspace_id, name, description, active)
        SELECT ws_record.id, 'Jahangir Khan', 'Creator interviews, soundbites & prime reel scheduling', true
        WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Jahangir Khan');

        -- 4. ZK Production
        INSERT INTO public.pages (workspace_id, name, description, active)
        SELECT ws_record.id, 'ZK Production', 'Master editing pipeline, color grading & 4K cinematic delivery', true
        WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE workspace_id = ws_record.id AND name = 'ZK Production');

        -- 5. New Client Page (Temporary & Editable)
        INSERT INTO public.pages (workspace_id, name, description, active)
        SELECT ws_record.id, 'New Client Page', 'Temporary client slot — page name editable by admin/user', true
        WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE workspace_id = ws_record.id AND name = 'New Client Page');

        -- 6. Nazia Fanz
        INSERT INTO public.pages (workspace_id, name, description, active)
        SELECT ws_record.id, 'Nazia Fanz', 'Music reels, video clips & Facebook audience engagement', true
        WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Nazia Fanz');

        -- 7. Inaya Kailashi
        INSERT INTO public.pages (workspace_id, name, description, active)
        SELECT ws_record.id, 'Inaya Kailashi', 'Social content matrix, lifestyle reels, Facebook & TikTok drops', true
        WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Inaya Kailashi');

        -- 8. Suno Music
        INSERT INTO public.pages (workspace_id, name, description, active)
        SELECT ws_record.id, 'Suno Music', 'Visual asset production pipeline: Visual Creation -> Editing -> Review -> Export -> Delivered', true
        WHERE NOT EXISTS (SELECT 1 FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Suno Music');

        -- Get IDs for rule linking
        SELECT id INTO shooting_page_id FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Shooting Film Video' LIMIT 1;
        SELECT id INTO ismail_page_id FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Ismail Shahid Fans' LIMIT 1;
        SELECT id INTO jahangir_page_id FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Jahangir Khan' LIMIT 1;
        SELECT id INTO zk_page_id FROM public.pages WHERE workspace_id = ws_record.id AND name = 'ZK Production' LIMIT 1;
        SELECT id INTO new_client_page_id FROM public.pages WHERE workspace_id = ws_record.id AND name = 'New Client Page' LIMIT 1;
        SELECT id INTO nazia_page_id FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Nazia Fanz' LIMIT 1;
        SELECT id INTO inaya_page_id FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Inaya Kailashi' LIMIT 1;
        SELECT id INTO suno_page_id FROM public.pages WHERE workspace_id = ws_record.id AND name = 'Suno Music' LIMIT 1;

        -- 3. Upsert High Priority Client Reel Recurring Rules
        -- 3.1 Shooting Film Video
        INSERT INTO public.recurring_rules (
            user_id, title, description, template_id, workspace_id, office_page_id, page_id,
            priority, due_time, estimated_duration_min, recurrence_type, interval, days_of_week,
            status, checklist, tags, timezone
        )
        SELECT 
            ws_record.user_id,
            'Upload Reel — Shooting Film Video',
            'Daily client reel workflow for Shooting Film Video',
            'CLIENT_DAILY_REEL',
            'office',
            'shooting-film-video',
            shooting_page_id,
            'HIGH',
            '13:15',
            45,
            'WEEKDAYS',
            1,
            ARRAY[1,2,3,4,5],
            'ACTIVE',
            '["Prepare/select content", "Edit reel", "Caption", "Hashtags", "Upload", "Verify upload"]'::jsonb,
            ARRAY['office', 'client-reels', 'shooting-film-video', 'high-priority'],
            'Asia/Karachi'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.recurring_rules 
            WHERE workspace_id = 'office' AND office_page_id = 'shooting-film-video'
        );

        -- 3.2 Ismail Shahid Fans
        INSERT INTO public.recurring_rules (
            user_id, title, description, template_id, workspace_id, office_page_id, page_id,
            priority, due_time, estimated_duration_min, recurrence_type, interval, days_of_week,
            status, checklist, tags, timezone
        )
        SELECT 
            ws_record.user_id,
            'Upload Reel — Ismail Shahid Fans',
            'Daily client reel workflow for Ismail Shahid Fans',
            'CLIENT_DAILY_REEL',
            'office',
            'ismail-shahid-fans',
            ismail_page_id,
            'HIGH',
            '14:00',
            45,
            'WEEKDAYS',
            1,
            ARRAY[1,2,3,4,5],
            'ACTIVE',
            '["Prepare/select content", "Edit reel", "Caption", "Hashtags", "Upload", "Verify upload"]'::jsonb,
            ARRAY['office', 'client-reels', 'ismail-shahid-fans', 'high-priority'],
            'Asia/Karachi'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.recurring_rules 
            WHERE workspace_id = 'office' AND office_page_id = 'ismail-shahid-fans'
        );

        -- 3.3 Jahangir Khan
        INSERT INTO public.recurring_rules (
            user_id, title, description, template_id, workspace_id, office_page_id, page_id,
            priority, due_time, estimated_duration_min, recurrence_type, interval, days_of_week,
            status, checklist, tags, timezone
        )
        SELECT 
            ws_record.user_id,
            'Upload Reel — Jahangir Khan',
            'Daily client reel workflow for Jahangir Khan',
            'CLIENT_DAILY_REEL',
            'office',
            'jahangir-khan',
            jahangir_page_id,
            'HIGH',
            '15:00',
            45,
            'WEEKDAYS',
            1,
            ARRAY[1,2,3,4,5],
            'ACTIVE',
            '["Prepare/select content", "Edit reel", "Caption", "Hashtags", "Upload", "Verify upload"]'::jsonb,
            ARRAY['office', 'client-reels', 'jahangir-khan', 'high-priority'],
            'Asia/Karachi'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.recurring_rules 
            WHERE workspace_id = 'office' AND office_page_id = 'jahangir-khan'
        );

        -- 3.4 ZK Production
        INSERT INTO public.recurring_rules (
            user_id, title, description, template_id, workspace_id, office_page_id, page_id,
            priority, due_time, estimated_duration_min, recurrence_type, interval, days_of_week,
            status, checklist, tags, timezone
        )
        SELECT 
            ws_record.user_id,
            'Upload Reel — ZK Production',
            'Daily client reel workflow for ZK Production',
            'CLIENT_DAILY_REEL',
            'office',
            'zk-production',
            zk_page_id,
            'HIGH',
            '16:00',
            45,
            'WEEKDAYS',
            1,
            ARRAY[1,2,3,4,5],
            'ACTIVE',
            '["Prepare/select content", "Edit reel", "Caption", "Hashtags", "Upload", "Verify upload"]'::jsonb,
            ARRAY['office', 'client-reels', 'zk-production', 'high-priority'],
            'Asia/Karachi'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.recurring_rules 
            WHERE workspace_id = 'office' AND office_page_id = 'zk-production'
        );

        -- 3.5 New Client Page (Temporary & Editable)
        INSERT INTO public.recurring_rules (
            user_id, title, description, template_id, workspace_id, office_page_id, page_id,
            priority, due_time, estimated_duration_min, recurrence_type, interval, days_of_week,
            status, checklist, tags, timezone
        )
        SELECT 
            ws_record.user_id,
            'Upload Reel — New Client Page',
            'Daily client reel workflow for New Client Page (editable)',
            'CLIENT_DAILY_REEL',
            'office',
            'new-client-page',
            new_client_page_id,
            'HIGH',
            '17:00',
            45,
            'WEEKDAYS',
            1,
            ARRAY[1,2,3,4,5],
            'ACTIVE',
            '["Prepare/select content", "Edit reel", "Caption", "Hashtags", "Upload", "Verify upload"]'::jsonb,
            ARRAY['office', 'client-reels', 'new-client-page', 'high-priority'],
            'Asia/Karachi'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.recurring_rules 
            WHERE workspace_id = 'office' AND office_page_id = 'new-client-page'
        );

        -- 4. Upsert Medium Priority Facebook Recurring Rules
        -- 4.1 Nazia Fanz
        INSERT INTO public.recurring_rules (
            user_id, title, description, template_id, workspace_id, office_page_id, page_id,
            priority, due_time, estimated_duration_min, recurrence_type, interval, days_of_week,
            status, checklist, tags, timezone
        )
        SELECT 
            ws_record.user_id,
            'Upload Content — Nazia Fanz',
            'Daily Facebook content distribution for Nazia Fanz',
            'FACEBOOK_DAILY_CONTENT',
            'office',
            'nazia-fanz',
            nazia_page_id,
            'MEDIUM',
            '18:00',
            35,
            'WEEKDAYS',
            1,
            ARRAY[1,2,3,4,5],
            'ACTIVE',
            '["Prepare/select content", "Edit reel", "Caption", "Hashtags", "Upload", "Verify upload"]'::jsonb,
            ARRAY['office', 'facebook', 'nazia-fanz', 'medium-priority'],
            'Asia/Karachi'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.recurring_rules 
            WHERE workspace_id = 'office' AND office_page_id = 'nazia-fanz'
        );

        -- 4.2 Inaya Kailashi
        INSERT INTO public.recurring_rules (
            user_id, title, description, template_id, workspace_id, office_page_id, page_id,
            priority, due_time, estimated_duration_min, recurrence_type, interval, days_of_week,
            status, checklist, tags, timezone
        )
        SELECT 
            ws_record.user_id,
            'Upload Content — Inaya Kailashi',
            'Daily Facebook content distribution for Inaya Kailashi',
            'FACEBOOK_DAILY_CONTENT',
            'office',
            'inaya-kailashi',
            inaya_page_id,
            'MEDIUM',
            '19:00',
            35,
            'WEEKDAYS',
            1,
            ARRAY[1,2,3,4,5],
            'ACTIVE',
            '["Prepare/select content", "Edit reel", "Caption", "Hashtags", "Upload", "Verify upload"]'::jsonb,
            ARRAY['office', 'facebook', 'inaya-kailashi', 'medium-priority'],
            'Asia/Karachi'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.recurring_rules 
            WHERE workspace_id = 'office' AND office_page_id = 'inaya-kailashi'
        );

        -- 5. Upsert Suno Music Production Rule (Separate 5-stage workflow)
        INSERT INTO public.recurring_rules (
            user_id, title, description, template_id, workspace_id, office_page_id, page_id,
            priority, due_time, estimated_duration_min, recurrence_type, interval, days_of_week,
            status, checklist, tags, timezone
        )
        SELECT 
            ws_record.user_id,
            'Suno Music Visual Production',
            'Visual production pipeline: Visual Creation -> Editing -> Review -> Export -> Delivered',
            'SUNO_MUSIC_WORKFLOW',
            'office',
            'suno-music',
            suno_page_id,
            'MEDIUM',
            '15:00',
            60,
            'WEEKDAYS',
            1,
            ARRAY[1,2,3,4,5],
            'ACTIVE',
            '["Visual Creation", "Editing", "Review", "Export", "Delivered"]'::jsonb,
            ARRAY['office', 'suno-music', 'visual-production', 'music-pipeline'],
            'Asia/Karachi'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.recurring_rules 
            WHERE workspace_id = 'office' AND office_page_id = 'suno-music'
        );

    END LOOP;
END $$;
