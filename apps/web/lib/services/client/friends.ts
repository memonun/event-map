// Friends service for event-related social features
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types/database';

const supabase = createClient();

export interface FriendAtEvent {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  status: 'attended' | 'going' | 'interested' | 'maybe';
  event_id: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface FriendWithEventData extends UserProfile {
  status: 'attended' | 'going' | 'interested' | 'maybe';
  event_id: string;
  is_online?: boolean;
  last_seen?: string;
}

export class FriendsService {
  // Get all user's friends
  static async getUserFriends(): Promise<UserProfile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_user_friends', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching friends:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserFriends:', error);
      return [];
    }
  }

  // Get friends who are attending a specific event
  static async getFriendsAtEvent(eventId: string): Promise<FriendAtEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get user's friends
      const friends = await this.getUserFriends();
      const friendIds = friends.map(friend => friend.id);

      if (friendIds.length === 0) return [];

      // Get friend event interactions for this specific event
      const { data: friendsAtEvent, error } = await supabase
        .from('user_event_interactions')
        .select(`
          user_id,
          event_id,
          status,
          user_profiles!inner (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .in('user_id', friendIds)
        .in('status', ['attended', 'going', 'interested', 'maybe']);

      if (error) {
        console.error('Error fetching friends at event:', error);
        return [];
      }

      // Transform data to FriendAtEvent format
      return ((friendsAtEvent as any[]) || []).map(interaction => ({
        id: (interaction.user_profiles as any).id,
        username: (interaction.user_profiles as any).username,
        display_name: (interaction.user_profiles as any).display_name,
        avatar_url: (interaction.user_profiles as any).avatar_url,
        status: interaction.status as 'attended' | 'going' | 'interested' | 'maybe',
        event_id: interaction.event_id,
        is_online: Math.random() > 0.3, // Mock online status for now
        last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString() // Random last seen within 1 hour
      }));
    } catch (error) {
      console.error('Error in getFriendsAtEvent:', error);
      return [];
    }
  }

  // Get friends at events for a specific venue
  static async getFriendsAtVenue(venueId: string): Promise<FriendAtEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get user's friends
      const friends = await this.getUserFriends();
      const friendIds = friends.map(friend => friend.id);

      if (friendIds.length === 0) return [];

      // Get events at this venue
      const { data: venueEvents, error: eventsError } = await supabase
        .from('unique_events')
        .select('id')
        .eq('canonical_venue_id', venueId)
        .gte('date', new Date().toISOString()); // Only future events

      if (eventsError || !venueEvents) return [];

      const eventIds = venueEvents.map(event => event.id);
      if (eventIds.length === 0) return [];

      // Get friend event interactions for these events
      const { data: friendsAtVenue, error } = await supabase
        .from('user_event_interactions')
        .select(`
          user_id,
          event_id,
          status,
          user_profiles!inner (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .in('event_id', eventIds)
        .in('user_id', friendIds)
        .in('status', ['attended', 'going', 'interested', 'maybe']);

      if (error) {
        console.error('Error fetching friends at venue:', error);
        return [];
      }

      // Transform and deduplicate friends (a friend might be going to multiple events at the venue)
      const friendsMap = new Map<string, FriendAtEvent>();

      ((friendsAtVenue as any[]) || []).forEach(interaction => {
        const friendId = (interaction.user_profiles as any).id;

        // If friend is already in map, prioritize higher engagement status
        if (friendsMap.has(friendId)) {
          const existing = friendsMap.get(friendId)!;
          const statusPriority: { [key: string]: number } = { 'going': 4, 'attended': 3, 'interested': 2, 'maybe': 1 };
          if (statusPriority[interaction.status] > statusPriority[existing.status]) {
            friendsMap.set(friendId, {
              id: (interaction.user_profiles as any).id,
              username: (interaction.user_profiles as any).username,
              display_name: (interaction.user_profiles as any).display_name,
              avatar_url: (interaction.user_profiles as any).avatar_url,
              status: interaction.status as 'attended' | 'going' | 'interested' | 'maybe',
              event_id: interaction.event_id,
              is_online: Math.random() > 0.3,
              last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString()
            });
          }
        } else {
          friendsMap.set(friendId, {
            id: (interaction.user_profiles as any).id,
            username: (interaction.user_profiles as any).username,
            display_name: (interaction.user_profiles as any).display_name,
            avatar_url: (interaction.user_profiles as any).avatar_url,
            status: interaction.status as 'attended' | 'going' | 'interested' | 'maybe',
            event_id: interaction.event_id,
            is_online: Math.random() > 0.3,
            last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString()
          });
        }
      });

      return Array.from(friendsMap.values());
    } catch (error) {
      console.error('Error in getFriendsAtVenue:', error);
      return [];
    }
  }

  // Get mock friends for testing (fallback when no real friends)
  static generateMockFriendsAtEvent(eventId: string, count: number = 4): FriendAtEvent[] {
    const mockNames = ['Ayşe', 'Mehmet', 'Fatma', 'Ali', 'Zeynep', 'Emre', 'Selin', 'Burak', 'Elif', 'Can'];
    const statuses: ('attended' | 'going' | 'interested' | 'maybe')[] = ['going', 'interested', 'going', 'maybe'];

    return Array.from({ length: count }, (_, i) => ({
      id: `mock-friend-${i}`,
      username: `${mockNames[i % mockNames.length].toLowerCase()}${Math.floor(Math.random() * 100)}`,
      display_name: mockNames[i % mockNames.length],
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(mockNames[i % mockNames.length])}&background=random&color=fff&size=128`,
      status: statuses[i % statuses.length],
      event_id: eventId,
      is_online: Math.random() > 0.3,
      last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString()
    }));
  }

  // Send friend request
  static async sendFriendRequest(friendId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/profile/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  }

  // Accept friend request
  static async acceptFriendRequest(connectionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_friends')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', connectionId);

      return !error;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  }

  // Get friend connection status with another user
  static async getFriendshipStatus(userId: string): Promise<'friends' | 'pending' | 'none' | 'blocked'> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'none';

      const { data: connection } = await supabase
        .from('user_friends')
        .select('status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
        .single();

      if (!connection) return 'none';

      return connection.status === 'accepted' ? 'friends' : connection.status as 'pending' | 'blocked';
    } catch (error) {
      console.error('Error getting friendship status:', error);
      return 'none';
    }
  }
}