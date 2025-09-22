// User service for profile management
import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserStats } from '@/lib/types/database';

const supabase = createClient();

export class UserService {
  // Get current user profile
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Get user profile by username
  static async getUserProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile by username:', error);
      return null;
    }
  }

  // Update current user profile
  static async updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Create user profile (usually called automatically via trigger)
  static async createUserProfile(profileData: {
    username: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
  }): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          username: profileData.username,
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url,
          bio: profileData.bio,
          location: profileData.location,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Check if username is available
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .single();

      // If we get an error, it means no user found (available)
      // If we get data, username is taken
      return !data && error?.code === 'PGRST116';
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  // Get user statistics (once Phase 2 is implemented)
  static async getUserStats(userId?: string): Promise<UserStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return null;

      // For now, return basic stats - will be enhanced in Phase 2
      const { data, error } = await supabase.rpc('get_user_stats', {
        p_user_id: targetUserId
      });

      if (error) {
        // If function doesn't exist yet, return default stats
        return {
          events_attended: 0,
          events_going: 0,
          events_interested: 0,
          capsules_created: 0,
          cities_visited: 0,
          genres_explored: 0,
          total_connections: 0
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  // Update user preferences
  static async updateUserPreferences(preferences: UserProfile['preferences']): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .update({ preferences })
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }
}