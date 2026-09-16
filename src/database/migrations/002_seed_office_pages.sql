-- ==============================================================================
-- Afaq TaskFlow - Seed Data Migration (002_seed_office_pages.sql)
-- Seeds the 8 essential Office pages for all existing Office workspaces
-- ==============================================================================

DO $$
DECLARE
    ws_record RECORD;
BEGIN
    FOR ws_record IN 
        SELECT id FROM public.workspaces WHERE type = 'office'
    LOOP
        -- Insert the 8 required pages if they don't already exist for this workspace
        INSERT INTO public.pages (workspace_id, name, description, active)
        SELECT ws_record.id, page_data.name, page_data.description, true
        FROM (
            VALUES 
                ('Shooting Page', 'Visual filming, production schedule, equipment checklist'),
                ('Ismail Shahid Fans', 'Reel content, comedy sketches, audience interaction'),
                ('ZK Production', 'Master editing pipeline, video uploads, client reviews'),
                ('Jahangir Khan', 'Creator channel management, premiere scheduling'),
                ('Inaya Kailash', 'Social content matrix, lifestyle reels, brand campaigns'),
                ('Political Affairs', 'News clippings, analytical posts, rapid commentary'),
                ('Nazia Iqbal Fanz', 'Music reels, tribute clips, audience engagement'),
                ('Suno Music', 'Album visual identity, teaser assets, delivery packages')
        ) AS page_data(name, description)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.pages 
            WHERE workspace_id = ws_record.id AND name = page_data.name
        );
    END LOOP;
END $$;
