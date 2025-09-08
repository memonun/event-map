-- Rollback Migration: Remove Admin Role System
-- WARNING: This will remove role-based access control
-- All users will have the same access level after rollback

-- Drop functions
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.is_user_admin(UUID);

-- Drop policies related to admin
DROP POLICY IF EXISTS "Users can view own role" ON public.user_profiles;

-- Remove role column (this will delete all role data)
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role;

-- Drop index
DROP INDEX IF EXISTS idx_user_profiles_role;

-- Restore original user creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: After rollback, all routes will be accessible by any authenticated user
-- You'll need to manually restrict access or implement alternative security