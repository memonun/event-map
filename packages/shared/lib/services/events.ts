import { createClient } from '@/lib/supabase/server';
import type { 
  EventWithVenue, 
  EventSearchParams, 
  EventsResponse, 
  MapBounds
} from '@/lib/types';

export class EventsService {
  /**
   * Get events near a specific location using PostGIS
   */
  static async getEventsNearLocation(
    lat: number,
    lng: number,
    radiusMeters: number = 5000,
    limit: number = 100
  ): Promise<EventWithVenue[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_events_near_location', {
      search_lat: lat,
      search_lng: lng,
      radius_meters: radiusMeters,
      result_limit: limit
    });

    if (error) {
      console.error('Error fetching events near location:', error);
      return [];
    }

    // Transform the RPC response to match EventWithVenue interface
    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      canonical_venue_id: row.canonical_venue_id,
      date: row.date,
      genre: row.genre,
      promoter: null,
      artist: row.artist,
      description: row.description,
      providers: row.providers,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      biletinial_event_id: row.biletinial_event_id,
      biletix_event_id: row.biletix_event_id,
      passo_event_id: row.passo_event_id,
      bugece_event_id: row.bugece_event_id,
      bubilet_event_id: row.bubilet_event_id,
      venue: {
        id: row.venue_id,
        name: row.venue_name,
        city: row.venue_city,
        capacity: row.venue_capacity,
        coordinates: row.venue_coordinates,
        created_at: ''
      }
    }));
  }

  /**
   * Get events within map bounds
   */
  static async getEventsInBounds(bounds: MapBounds, limit: number = 500): Promise<EventWithVenue[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_events_in_bounds', {
      north_lat: bounds.north,
      south_lat: bounds.south,
      east_lng: bounds.east,
      west_lng: bounds.west,
      result_limit: limit
    });

    if (error) {
      console.error('Error fetching events in bounds:', error);
      return [];
    }

    // Transform the RPC response to match EventWithVenue interface
    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      canonical_venue_id: row.canonical_venue_id,
      date: row.date,
      genre: row.genre,
      promoter: null,
      artist: row.artist,
      description: row.description,
      providers: row.providers,
      status: row.status,
      created_at: '',
      updated_at: '',
      biletinial_event_id: null,
      biletix_event_id: null,
      passo_event_id: null,
      bugece_event_id: null,
      bubilet_event_id: null,
      venue: {
        id: row.venue_id,
        name: row.venue_name,
        city: row.venue_city,
        capacity: row.venue_capacity,
        coordinates: row.venue_coordinates,
        created_at: ''
      }
    }));
  }

  /**
   * Search events with filters
   */
  static async searchEvents(params: EventSearchParams): Promise<EventsResponse> {
    const supabase = await createClient();
    
    let query = supabase
      .from('unique_events')
      .select(`
        *,
        venue:canonical_venues (
          id,
          name,
          city,
          capacity,
          coordinates
        )
      `, { count: 'exact' })
      .gte('date', params.date_from || new Date().toISOString())
      .order('date', { ascending: true });

    // Apply filters
    if (params.query) {
      query = query.ilike('name', `%${params.query}%`);
    }

    if (params.genre) {
      query = query.eq('genre', params.genre);
    }

    if (params.city) {
      query = query.eq('venue.city', params.city);
    }

    if (params.date_to) {
      query = query.lte('date', params.date_to);
    }

    if (params.platforms && params.platforms.length > 0) {
      query = query.overlaps('providers', params.platforms);
    }

    // Apply pagination
    const offset = params.offset || 0;
    const limit = Math.min(params.limit || 50, 100);
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching events:', error);
      return { events: [], total: 0, has_more: false };
    }

    const events = (data || [])
      .filter(event => event.venue)
      .map(event => ({
        ...event,
        venue: event.venue!
      }));

    return {
      events,
      total: count || 0,
      has_more: (count || 0) > offset + limit
    };
  }

  /**
   * Get a single event with full details
   */
  static async getEventById(id: string): Promise<EventWithVenue | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('unique_events')
      .select(`
        *,
        venue:canonical_venues (
          id,
          name,
          city,
          capacity,
          coordinates
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    if (!data?.venue) {
      return null;
    }

    return {
      ...data,
      venue: data.venue
    };
  }

  /**
   * Get upcoming events by date range
   */
  static async getUpcomingEvents(
    days: number = 30,
    limit: number = 50
  ): Promise<EventWithVenue[]> {
    const supabase = await createClient();
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const { data, error } = await supabase
      .from('unique_events')
      .select(`
        *,
        venue:canonical_venues (
          id,
          name,
          city,
          capacity,
          coordinates
        )
      `)
      .gte('date', new Date().toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }

    return (data || [])
      .filter(event => event.venue)
      .map(event => ({
        ...event,
        venue: event.venue!
      }));
  }

  /**
   * Get events by genre
   */
  static async getEventsByGenre(genre: string, limit: number = 50): Promise<EventWithVenue[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('unique_events')
      .select(`
        *,
        venue:canonical_venues (
          id,
          name,
          city,
          capacity,
          coordinates
        )
      `)
      .eq('genre', genre)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching events by genre:', error);
      return [];
    }

    return (data || [])
      .filter(event => event.venue)
      .map(event => ({
        ...event,
        venue: event.venue!
      }));
  }

  /**
   * Get popular genres
   */
  static async getPopularGenres(limit: number = 20): Promise<{ genre: string; count: number }[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_popular_genres', {
      result_limit: limit
    });

    if (error) {
      console.error('Error fetching popular genres:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get events by city
   */
  static async getEventsByCity(city: string, limit: number = 50): Promise<EventWithVenue[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('unique_events')
      .select(`
        *,
        venue:canonical_venues!inner (
          id,
          name,
          city,
          capacity,
          coordinates
        )
      `)
      .eq('venue.city', city)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching events by city:', error);
      return [];
    }

    return (data || []).map(event => ({
      ...event,
      venue: event.venue!
    }));
  }
}