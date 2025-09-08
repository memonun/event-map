-- Rollback Migration: Remove User Connections (Friends System)
-- WARNING: This will delete all friend connections and social activity data

-- Drop triggers first
DROP TRIGGER IF EXISTS record_user_event_activity ON public.user_events;
DROP TRIGGER IF EXISTS set_updated_at_user_connections ON public.user_connections;

-- Drop functions
DROP FUNCTION IF EXISTS public.get_user_friends(UUID);
DROP FUNCTION IF EXISTS public.get_user_event_activity(UUID, INT);
DROP FUNCTION IF EXISTS public.get_user_upcoming_events(UUID, INT);
DROP FUNCTION IF EXISTS public.record_friend_activity();
DROP FUNCTION IF EXISTS public.cleanup_old_social_data();

-- Drop policies
-- user_connections policies
DROP POLICY IF EXISTS "Users can view own connections and connections to them" ON public.user_connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.user_connections;
DROP POLICY IF EXISTS "Users can update connection status" ON public.user_connections;
DROP POLICY IF EXISTS "Users can remove connections" ON public.user_connections;

-- friend_activities policies
DROP POLICY IF EXISTS "Users can view activities from friends" ON public.friend_activities;
DROP POLICY IF EXISTS "Users can create own activities" ON public.friend_activities;

-- friend_suggestions policies
DROP POLICY IF EXISTS "Users can view own suggestions" ON public.friend_suggestions;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_connections_user_id;
DROP INDEX IF EXISTS idx_user_connections_connected_user_id;
DROP INDEX IF EXISTS idx_user_connections_status;
DROP INDEX IF EXISTS idx_friend_activities_user_id;
DROP INDEX IF EXISTS idx_friend_activities_created_at;
DROP INDEX IF EXISTS idx_friend_activities_activity_type;
DROP INDEX IF EXISTS idx_friend_suggestions_user_id;
DROP INDEX IF EXISTS idx_friend_suggestions_score;

-- Drop tables (this will delete all data)
DROP TABLE IF EXISTS public.friend_suggestions CASCADE;
DROP TABLE IF EXISTS public.friend_activities CASCADE;
DROP TABLE IF EXISTS public.user_connections CASCADE;

-- Note: After rollback, all friend connections and social activities will be lost
-- User events and profiles remain intact