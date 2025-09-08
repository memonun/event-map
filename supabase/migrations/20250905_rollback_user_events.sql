-- Rollback Migration: Remove User Events System (Phase 2)
-- WARNING: This will delete all user event interactions, lists, and aggregates

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_update_event_aggregates ON public.user_events;
DROP TRIGGER IF EXISTS on_user_profile_created_create_lists ON public.user_profiles;
DROP TRIGGER IF EXISTS set_updated_at_user_events ON public.user_events;
DROP TRIGGER IF EXISTS set_updated_at_user_lists ON public.user_lists;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_event_aggregates();
DROP FUNCTION IF EXISTS public.get_user_event_status(UUID, UUID);
DROP FUNCTION IF EXISTS public.get_event_social_stats(UUID);
DROP FUNCTION IF EXISTS public.create_default_user_lists();

-- Drop policies
-- user_events policies
DROP POLICY IF EXISTS "Users can view own event interactions" ON public.user_events;
DROP POLICY IF EXISTS "Users can create own event interactions" ON public.user_events;
DROP POLICY IF EXISTS "Users can update own event interactions" ON public.user_events;
DROP POLICY IF EXISTS "Users can delete own event interactions" ON public.user_events;

-- event_aggregates policies
DROP POLICY IF EXISTS "Anyone can view event aggregates" ON public.event_aggregates;

-- user_lists policies
DROP POLICY IF EXISTS "Users can view own lists" ON public.user_lists;
DROP POLICY IF EXISTS "Users can create own lists" ON public.user_lists;
DROP POLICY IF EXISTS "Users can update own lists" ON public.user_lists;
DROP POLICY IF EXISTS "Users can delete own lists" ON public.user_lists;

-- list_events policies
DROP POLICY IF EXISTS "Users can view events in accessible lists" ON public.list_events;
DROP POLICY IF EXISTS "Users can add events to own lists" ON public.list_events;
DROP POLICY IF EXISTS "Users can remove events from own lists" ON public.list_events;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_events_user_id;
DROP INDEX IF EXISTS idx_user_events_event_id;
DROP INDEX IF EXISTS idx_user_events_status;
DROP INDEX IF EXISTS idx_user_events_created_at;
DROP INDEX IF EXISTS idx_event_aggregates_event_id;
DROP INDEX IF EXISTS idx_user_lists_user_id;
DROP INDEX IF EXISTS idx_list_events_list_id;
DROP INDEX IF EXISTS idx_list_events_event_id;

-- Drop tables (this will delete all data)
DROP TABLE IF EXISTS public.list_events CASCADE;
DROP TABLE IF EXISTS public.user_lists CASCADE;
DROP TABLE IF EXISTS public.event_aggregates CASCADE;
DROP TABLE IF EXISTS public.user_events CASCADE;

-- Note: After rollback, all user event interactions will be lost
-- The main event data and user profiles remain intact