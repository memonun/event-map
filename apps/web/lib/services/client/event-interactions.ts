// Event interaction service for user RSVP and engagement
import { createClient } from '@/lib/supabase/client';
import { UserEvent, EventAggregates } from '@/lib/types/database';

export type EventStatus = 'going' | 'interested' | 'maybe' | 'not_going' | 'attended' | 'missed' | 'wish_went';

export interface EventInteractionData {
  status: EventStatus;
  reminder_set?: boolean;
  reminder_time?: string;
  price_alert?: boolean;
  price_threshold?: number;
  notes?: string;
}

export class EventInteractionService {
  // Get user's status for a specific event
  static async getUserEventStatus(eventId: string): Promise<EventStatus | null> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_events')
        .select('status')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .single();

      if (error || !data) return null;
      return data.status as EventStatus;
    } catch (error) {
      console.error('Error fetching user event status:', error);
      return null;
    }
  }

  // Get user's status for multiple events
  static async getUserEventStatuses(eventIds: string[]): Promise<Record<string, EventStatus>> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      const { data, error } = await supabase
        .from('user_events')
        .select('event_id, status')
        .eq('user_id', user.id)
        .in('event_id', eventIds);

      if (error || !data) return {};
      
      return data.reduce((acc, item) => {
        acc[item.event_id] = item.status as EventStatus;
        return acc;
      }, {} as Record<string, EventStatus>);
    } catch (error) {
      console.error('Error fetching user event statuses:', error);
      return {};
    }
  }

  // Set or update user's status for an event
  static async setEventStatus(eventId: string, status: EventStatus | 'remove'): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If removing status, delete the record
      if (status === 'remove') {
        const { error } = await supabase
          .from('user_events')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) throw error;
        return true;
      }

      // Upsert the status
      const { error } = await supabase
        .from('user_events')
        .upsert({
          user_id: user.id,
          event_id: eventId,
          status: status,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,event_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting event status:', error);
      return false;
    }
  }

  // Update full event interaction data
  static async updateEventInteraction(eventId: string, data: EventInteractionData): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_events')
        .upsert({
          user_id: user.id,
          event_id: eventId,
          ...data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,event_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating event interaction:', error);
      return false;
    }
  }

  // Get all user's events by status
  static async getUserEventsByStatus(status: EventStatus): Promise<UserEvent[]> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_events')
        .select(`
          *,
          event:unique_events (
            id,
            name,
            date,
            genre,
            venue:canonical_venues (
              name,
              city
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user events by status:', error);
      return [];
    }
  }

  // Get all user's upcoming events
  static async getUserUpcomingEvents(): Promise<UserEvent[]> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_events')
        .select(`
          *,
          event:unique_events!inner (
            id,
            name,
            date,
            genre,
            venue:canonical_venues (
              name,
              city
            )
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['going', 'interested', 'maybe'])
        .gte('event.date', new Date().toISOString())
        .order('event.date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }

  // Get event social stats (aggregates)
  static async getEventSocialStats(eventId: string): Promise<EventAggregates | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('event_aggregates')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (error) {
        // If no aggregates exist yet, return zeros
        return {
          event_id: eventId,
          attendee_count: 0,
          going_count: 0,
          interested_count: 0,
          capsule_count: 0,
          avg_rating: null,
          rating_count: 0,
          last_activity_at: null,
          updated_at: new Date().toISOString()
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching event social stats:', error);
      return null;
    }
  }

  // Get multiple events' social stats
  static async getMultipleEventStats(eventIds: string[]): Promise<Record<string, EventAggregates>> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('event_aggregates')
        .select('*')
        .in('event_id', eventIds);

      if (error) throw error;
      
      const statsMap: Record<string, EventAggregates> = {};
      
      // Create map of existing stats
      if (data) {
        data.forEach(stat => {
          statsMap[stat.event_id] = stat;
        });
      }
      
      // Fill in missing events with default stats
      eventIds.forEach(eventId => {
        if (!statsMap[eventId]) {
          statsMap[eventId] = {
            event_id: eventId,
            attendee_count: 0,
            going_count: 0,
            interested_count: 0,
            capsule_count: 0,
            avg_rating: null,
            rating_count: 0,
            last_activity_at: null,
            updated_at: new Date().toISOString()
          };
        }
      });
      
      return statsMap;
    } catch (error) {
      console.error('Error fetching multiple event stats:', error);
      return {};
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  // Get user's event lists
  static async getUserLists(): Promise<any[]> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user lists:', error);
      return [];
    }
  }

  // Add event to a list
  static async addEventToList(listId: string, eventId: string, notes?: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('list_events')
        .insert({
          list_id: listId,
          event_id: eventId,
          notes: notes
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding event to list:', error);
      return false;
    }
  }

  // Remove event from a list
  static async removeEventFromList(listId: string, eventId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('list_events')
        .delete()
        .eq('list_id', listId)
        .eq('event_id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing event from list:', error);
      return false;
    }
  }
}