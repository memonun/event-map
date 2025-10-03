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
   * Get events within map bounds using API route
   */
  static async getEventsInBounds(bounds: MapBounds, limit: number = 500): Promise<EventWithVenue[]> {
    try {
      // Build query parameters with bounds
      const searchParams = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`/api/events/map?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.events || [];

    } catch (error) {
      console.error('Error fetching events in bounds:', error);
      return [];
    }
  }

  /**
   * Search events with filters using API route
   */
  static async searchEvents(params: EventSearchParams): Promise<EventsResponse> {
    try {
      // Build query parameters
      const searchParams = new URLSearchParams();

      if (params.query) searchParams.append('query', params.query);
      if (params.genre) searchParams.append('genre', params.genre);
      if (params.city) searchParams.append('city', params.city);
      if (params.date_from) searchParams.append('date_from', params.date_from);
      if (params.date_to) searchParams.append('date_to', params.date_to);
      if (params.platforms) searchParams.append('platforms', params.platforms.join(','));
      if (params.limit) searchParams.append('limit', params.limit.toString());

      // Call our API route instead of direct Supabase call
      const response = await fetch(`/api/events/search?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error searching events:', error);
      return { events: [], total: 0, has_more: false };
    }
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

    const eventsWithVenues = (data || [])
      .filter(event => event.venue)
      .map(event => ({
        ...event,
        venue: event.venue!
      }));

    // Enrich events with images for better user experience
    const enrichedEvents = await this.enrichEventsWithImages(eventsWithVenues);
    return enrichedEvents;
  }

  /**
   * Get events for map display (only events with coordinates) using API route
   */
  static async getEventsForMap(limit: number = 500): Promise<EventWithVenue[]> {
    try {
      const response = await fetch(`/api/events/map?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.events || [];

    } catch (error) {
      console.error('Error fetching events for map:', error);
      return [];
    }
  }

  /**
   * Get available genres for filtering using API route
   */
  static async getAvailableGenres(): Promise<{ genre: string; count: number }[]> {
    try {
      const response = await fetch('/api/events/genres');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.genres || [];

    } catch (error) {
      console.error('Error fetching available genres:', error);
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
   * Get event with ticket URLs and actual time using RPC function
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
      console.log('Fetching ticket URLs for event:', eventId);

      // Use RPC function to get ticket URLs from all platforms
      const { data: platformData, error } = await supabase
        .rpc('get_event_ticket_urls', { event_id_param: eventId });

      if (error) {
        console.error('Error calling get_event_ticket_urls RPC:', error);
        return {
          ...baseEvent,
          ticket_urls: [],
          actual_time: undefined
        };
      }

      console.log('Platform data received:', platformData);

      // Process the RPC results
      if (platformData && platformData.length > 0) {
        platformData.forEach((row: any) => {
          if (row.url) {
            ticketUrls.push({
              platform: row.platform,
              url: row.url,
              available: row.available || true
            });
          }

          // Get actual time from first available provider
          if (!actualTime && row.event_time) {
            actualTime = row.event_time;
          }
        });
      }

      console.log('Processed ticket URLs:', ticketUrls);

      // Enrich event with image using provider hierarchy
      const enrichedEvent = await this.enrichEventWithImage(baseEvent);

      return {
        ...enrichedEvent,
        ticket_urls: ticketUrls,
        actual_time: actualTime
      };

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

  /**
   * Get image from a specific provider table
   * Checks poster_image_url first, then thumbnail_url as fallback
   */
  private static async getImageFromProvider(
    providerId: number | null,
    providerName: string
  ): Promise<string | null> {
    if (!providerId) return null;

    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .schema('ticketing_platforms_raw_data')
        .from(`${providerName}_events`)
        .select('poster_image_url, thumbnail_url')
        .eq('id', providerId)
        .single();

      if (error || !data) return null;

      // Prefer poster_image_url over thumbnail_url
      return data.poster_image_url || data.thumbnail_url || null;
    } catch (error) {
      console.error(`Error fetching image from ${providerName}:`, error);
      return null;
    }
  }

  /**
   * Enrich event with image data from provider platforms
   * Implements provider hierarchy: biletinial → bubilet → bugece → biletix → passo
   * For each provider, prefers poster_image_url over thumbnail_url
   */
  static async enrichEventWithImage(event: EventWithVenue): Promise<EventWithVenue> {
    try {
      // Provider hierarchy: biletinial → bubilet → bugece → biletix → passo
      const providers: Array<{ id: number | null; name: string }> = [
        { id: event.biletinial_event_id, name: 'biletinial' },
        { id: event.bubilet_event_id, name: 'bubilet' },
        { id: event.bugece_event_id, name: 'bugece' },
        { id: event.biletix_event_id, name: 'biletix' },
        { id: event.passo_event_id, name: 'passo' },
      ];

      // Check each provider in order until we find an image
      for (const provider of providers) {
        const imageUrl = await this.getImageFromProvider(provider.id, provider.name);

        if (imageUrl) {
          return {
            ...event,
            image_url: imageUrl,
            featured_image: imageUrl
          };
        }
      }
    } catch (error) {
      console.error('Error enriching event with image:', error);
    }

    return event;
  }

  /**
   * Enrich multiple events with image data
   */
  static async enrichEventsWithImages(events: EventWithVenue[]): Promise<EventWithVenue[]> {
    const enrichmentPromises = events.map(event => 
      this.enrichEventWithImage(event)
    );
    
    return await Promise.all(enrichmentPromises);
  }
}