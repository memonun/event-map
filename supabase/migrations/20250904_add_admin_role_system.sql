-- Migration: Add Admin Role System
-- CRITICAL SECURITY FIX: Separate admin and user access
-- Description: Adds role-based access control to prevent unauthorized access to admin tools

-- Add role column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('admin', 'user'));

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy for user profiles to include role visibility
CREATE POLICY "Users can view own role" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id OR true); -- Keep existing public access

-- Create RLS policy for admin-only operations (to be used by admin tables later)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_user_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_user_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- Update user profile creation trigger to handle role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'user';
BEGIN
  -- Check if this is the admin email (you'll need to update this with your email)
  -- For now, we'll set it manually after migration
  
  INSERT INTO public.user_profiles (id, username, display_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON COLUMN public.user_profiles.role IS 'User role: admin (full access) or user (regular platform access)';
COMMENT ON FUNCTION public.is_user_admin IS 'Check if a user has admin role';
COMMENT ON FUNCTION public.get_user_role IS 'Get user role (admin/user)';
COMMENT ON FUNCTION public.is_admin IS 'Check if current authenticated user is admin';