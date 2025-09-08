-- Rollback Migration: Remove User Profiles Foundation
-- Phase 1 Rollback: Safely remove user profile extension
-- WARNING: This will delete all user profile data

-- Drop trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON public.user_profiles;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.trigger_set_updated_at();

-- Drop policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_profiles_username;

-- Drop table (this will delete all user profile data)
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Revoke permissions (cleanup)
REVOKE ALL ON public.user_profiles FROM anon, authenticated;

-- Note: Supabase auth.users table remains untouched
-- All authentication functionality remains intact