import { createClient } from '@/lib/supabase/client';
import type { 
  EventWithVenue, 
  EventWithTicketUrls,
  TicketUrl,
  EventSearchParams, 
  EventsResponse, 
  MapBounds
} from '@/lib/types';

export class ClientEventsService {
  /**
   * Get events near a specific location using PostGIS
   */
  static async getEventsNearLocation(
    lat: number,
    lng: number,
    radiusMeters: number = 5000,
    limit: number = 100
  ): Promise<EventWithVenue[]> {
    const supabase = createClient();
    
    // Try RPC function first, fallback to direct query
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_events_near_location', {
      search_lat: lat,
      search_lng: lng,
      radius_meters: radiusMeters,
      result_limit: limit
    });

    if (!rpcError && rpcData) {
      // Transform the RPC response to match EventWithVenue interface
      return (rpcData || []).map((row: Record<string, unknown>) => ({
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

    // Fallback: Use direct query with simple coordinate filtering
    console.log('RPC failed, using fallback query:', rpcError?.message);
    
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
      .not('canonical_venues.coordinates', 'is', null)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error in fallback events query:', error);
      return [];
    }

    return (data || [])
      .filter(event => event.venue && event.venue.coordinates)
      .map(event => ({
        ...event,
        venue: event.venue!
      }));
  }

  /**
   * Get events within map bounds
   */
  static async getEventsInBounds(bounds: MapBounds, limit: number = 500): Promise<EventWithVenue[]> {
    const supabase = createClient();
    
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
    const supabase = createClient();
    
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
      // Handle special uncategorized value
      if (params.genre === '__uncategorized__') {
        query = query.is('genre', null);
      } else {
        query = query.eq('genre', params.genre);
      }
    }

    // Note: City filter will be applied after fetching since Supabase 
    // doesn't support filtering on nested relationships directly

    if (params.date_to) {
      query = query.lte('date', params.date_to);
    }

    if (params.platforms && params.platforms.length > 0) {
      query = query.overlaps('providers', params.platforms);
    }

    // Apply pagination - no arbitrary cap on limit
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching events:', error);
      return { events: [], total: 0, has_more: false };
    }

    let events = (data || [])
      .filter(event => event.venue)
      .map(event => {
        // Convert coordinate format if needed
        let coordinates = event.venue!.coordinates;
        if (coordinates && coordinates.latitude && coordinates.longitude) {
          coordinates = {
            lat: coordinates.latitude,
            lng: coordinates.longitude
          };
        }
        
        return {
          ...event,
          venue: {
            ...event.venue!,
            coordinates
          }
        };
      });

    // Apply city filter after fetching (Supabase doesn't support nested relationship filters)
    if (params.city) {
      events = events.filter(event => event.venue?.city === params.city);
    }

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
    const supabase = createClient();
    
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
    const supabase = createClient();
    
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
   * Get events for map display (only events with coordinates)
   */
  static async getEventsForMap(limit: number = 500): Promise<EventWithVenue[]> {
    const supabase = createClient();
    
    // First, let's get venues that have coordinates
    const { data: venuesWithCoords } = await supabase
      .from('canonical_venues')
      .select('id')
      .not('coordinates', 'is', null);

    const venueIds = (venuesWithCoords || []).map(v => v.id);
    console.log('Venues with coordinates:', venueIds.length);

    if (venueIds.length === 0) {
      console.log('No venues with coordinates found');
      return [];
    }

    const { data, error } = await supabase
      .from('unique_events')
      .select(`
        *,
        canonical_venues (
          id,
          name,
          city,
          capacity,
          coordinates
        )
      `)
      .in('canonical_venue_id', venueIds)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching events for map:', error);
      return [];
    }

    console.log('Raw events data for map:', data?.length, data?.slice(0, 2));

    return (data || [])
      .filter(event => {
        const hasVenue = event.canonical_venues;
        if (!hasVenue) {
          console.log('Event missing venue data:', event.name);
          return false;
        }
        return true;
      })
      .map(event => {
        // Map the joined venue data to the expected format
        const venue = event.canonical_venues;
        
        // Parse coordinates if they're stored as JSON string
        let coordinates = venue.coordinates;
        if (typeof coordinates === 'string') {
          try {
            coordinates = JSON.parse(coordinates);
          } catch (error) {
            console.error('Failed to parse coordinates:', coordinates, error);
            coordinates = null;
          }
        }
        
        // Convert database format {latitude, longitude} to map format {lat, lng}
        if (coordinates && coordinates.latitude && coordinates.longitude) {
          coordinates = {
            lat: coordinates.latitude,
            lng: coordinates.longitude
          };
        }
        
        console.log('Processing event:', event.name, 'with venue:', venue.name, 'coordinates:', coordinates);
        
        return {
          ...event,
          venue: {
            id: venue.id,
            name: venue.name,
            city: venue.city,
            capacity: venue.capacity,
            coordinates,
            created_at: ''
          }
        };
      })
      .filter(event => event.venue.coordinates) as EventWithVenue[];
  }

  /**
   * Get available genres for filtering
   */
  static async getAvailableGenres(): Promise<{ genre: string; count: number }[]> {
    const supabase = createClient();
    
    try {
      // Get all unique genres with their event counts
      const { data, error } = await supabase
        .from('unique_events')
        .select('genre')
        .gte('date', new Date().toISOString()) // Only upcoming events
        .not('genre', 'is', null);

      if (error) {
        console.error('Error fetching available genres:', error);
        return [];
      }

      // Count genres manually
      const genreCounts: { [key: string]: number } = {};
      (data || []).forEach(event => {
        if (event.genre) {
          genreCounts[event.genre] = (genreCounts[event.genre] || 0) + 1;
        }
      });

      // Also add "Uncategorized" for events without genre
      const { count: uncategorizedCount } = await supabase
        .from('unique_events')
        .select('*', { count: 'exact', head: true })
        .gte('date', new Date().toISOString())
        .is('genre', null);

      const result = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count);

      // Add uncategorized if there are events without genre
      if (uncategorizedCount && uncategorizedCount > 0) {
        result.push({ genre: 'Uncategorized', count: uncategorizedCount });
      }

      return result;
    } catch (error) {
      console.error('Error in getAvailableGenres:', error);
      return [];
    }
  }

  /**
   * Get popular genres (legacy method)
   */
  static async getPopularGenres(limit: number = 20): Promise<{ genre: string; count: number }[]> {
    const supabase = createClient();
    
    // Try RPC function first
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_popular_genres', {
      result_limit: limit
    });

    if (!rpcError && rpcData) {
      return rpcData || [];
    }

    // Fallback: Manual genre aggregation
    console.log('RPC failed, using fallback genre query:', rpcError?.message);
    
    const { data, error } = await supabase
      .from('unique_events')
      .select('genre')
      .not('genre', 'is', null)
      .gte('date', new Date().toISOString());

    if (error) {
      console.error('Error in fallback genre query:', error);
      return [];
    }

    // Count genres manually
    const genreCounts: { [key: string]: number } = {};
    (data || []).forEach(event => {
      if (event.genre) {
        genreCounts[event.genre] = (genreCounts[event.genre] || 0) + 1;
      }
    });

    return Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get event with ticket URLs and actual time from platform tables (application-layer approach)
   */
  static async getEventWithTicketUrls(eventId: string): Promise<EventWithTicketUrls | null> {
    const supabase = createClient();
    
    // First get the base event
    const baseEvent = await this.getEventById(eventId);
    if (!baseEvent) {
      return null;
    }

    const ticketUrls: TicketUrl[] = [];
    let actualTime: string | undefined;

    try {
      // Query each platform table for ticket URLs and actual time based on platform event IDs
      
      // Bubilet
      if (baseEvent.bubilet_event_id) {
        const { data: bubiletEvent } = await supabase
          .from('ticketing_platforms_raw_data.bubilet_events')
          .select('event_url, date')
          .eq('id', baseEvent.bubilet_event_id)
          .single();
        
        if (bubiletEvent?.event_url) {
          ticketUrls.push({
            platform: 'bubilet',
            url: bubiletEvent.event_url,
            available: true
          });
        }
        
        // Get actual time from first available provider
        if (!actualTime && bubiletEvent?.date) {
          actualTime = bubiletEvent.date;
        }
      }

      // Biletix
      if (baseEvent.biletix_event_id && !actualTime) {
        const { data: biletixEvent } = await supabase
          .from('ticketing_platforms_raw_data.biletix_events')
          .select('event_url, date')
          .eq('id', baseEvent.biletix_event_id)
          .single();
        
        if (biletixEvent?.event_url) {
          ticketUrls.push({
            platform: 'biletix',
            url: biletixEvent.event_url,
            available: true
          });
        }
        
        if (!actualTime && biletixEvent?.date) {
          actualTime = biletixEvent.date;
        }
      }

      // Passo
      if (baseEvent.passo_event_id && !actualTime) {
        const { data: passoEvent } = await supabase
          .from('ticketing_platforms_raw_data.passo_events')
          .select('event_url, date')
          .eq('id', baseEvent.passo_event_id)
          .single();
        
        if (passoEvent?.event_url) {
          ticketUrls.push({
            platform: 'passo',
            url: passoEvent.event_url,
            available: true
          });
        }
        
        if (!actualTime && passoEvent?.date) {
          actualTime = passoEvent.date;
        }
      }

      // Bugece
      if (baseEvent.bugece_event_id && !actualTime) {
        const { data: bugeceEvent } = await supabase
          .from('ticketing_platforms_raw_data.bugece_events')
          .select('event_url, date')
          .eq('id', baseEvent.bugece_event_id)
          .single();
        
        if (bugeceEvent?.event_url) {
          ticketUrls.push({
            platform: 'bugece',
            url: bugeceEvent.event_url,
            available: true
          });
        }
        
        if (!actualTime && bugeceEvent?.date) {
          actualTime = bugeceEvent.date;
        }
      }

      // Biletinial
      if (baseEvent.biletinial_event_id && !actualTime) {
        const { data: biletinialEvent } = await supabase
          .from('ticketing_platforms_raw_data.biletinial_events')
          .select('event_url, date')
          .eq('id', baseEvent.biletinial_event_id)
          .single();
        
        if (biletinialEvent?.event_url) {
          ticketUrls.push({
            platform: 'biletinial',
            url: biletinialEvent.event_url,
            available: true
          });
        }
        
        if (!actualTime && biletinialEvent?.date) {
          actualTime = biletinialEvent.date;
        }
      }

    } catch (error) {
      console.error('Error fetching ticket URLs:', error);
      // Continue with empty ticket URLs rather than failing completely
    }

    return {
      ...baseEvent,
      ticket_urls: ticketUrls,
      actual_time: actualTime
    };
  }
}