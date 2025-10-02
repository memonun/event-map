// Admin access control utilities
import { createClient } from '@/lib/supabase/server';
import { createClient as createClientClient } from '@/lib/supabase/client';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// Server-side admin check
export async function checkAdminAccess(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return data?.role === UserRole.ADMIN;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

// Client-side admin check
export async function checkAdminAccessClient(): Promise<boolean> {
  try {
    const supabase = createClientClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return data?.role === UserRole.ADMIN;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

// Get user role (server-side)
export async function getUserRole(): Promise<UserRole> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return UserRole.USER;

    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return (data?.role as UserRole) || UserRole.USER;
  } catch (error) {
    console.error('Error getting user role:', error);
    return UserRole.USER;
  }
}

// Set user as admin (one-time setup function)
export async function setUserAsAdmin(userEmail: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get user by email
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;
    
    const targetUser = (users as any[]).find((u: any) => u.email === userEmail);
    if (!targetUser) {
      console.error('User not found:', userEmail);
      return false;
    }

    // Update user profile role
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: UserRole.ADMIN })
      .eq('id', targetUser.id);

    if (error) throw error;
    
    console.log(`✅ Set ${userEmail} as admin`);
    return true;
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return false;
  }
}