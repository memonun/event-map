import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ServerEventsService } from '@/lib/services/server/events';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '500');

    // Extract bounds parameters
    const north = searchParams.get('north');
    const south = searchParams.get('south');
    const east = searchParams.get('east');
    const west = searchParams.get('west');

    const supabase = await createClient();

    // If bounds are provided, use bounds-based query with direct SQL
    if (north && south && east && west) {
      console.log('Using bounds-based query:', { north, south, east, west });

      // Query events within bounds using direct SQL with PostGIS functions
      const { data, error } = await supabase
        .from('unique_events')
        .select(`
          id,
          name,
          date,
          artist,
          genre,
          description,
          providers,
          canonical_venue_id,
          biletinial_event_id,
          biletix_event_id,
          passo_event_id,
          bugece_event_id,
          bubilet_event_id,
          status,
          created_at,
          updated_at,
          canonical_venues (
            id,
            name,
            city,
            capacity,
            coordinates,
            created_at
          )
        `)
        .not('canonical_venues.coordinates', 'is', null)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error in bounds-based query:', error);
        return NextResponse.json(
          { error: 'Failed to fetch events in bounds' },
          { status: 500 }
        );
      }

      // Filter events by bounds and transform the response
      const events = (data || [])
        .filter(event => {
          if (!event.canonical_venues?.coordinates) return false;

          let coordinates = event.canonical_venues.coordinates;

          // Parse coordinates if they're stored as JSON string
          if (typeof coordinates === 'string') {
            try {
              coordinates = JSON.parse(coordinates);
            } catch (error) {
              console.error('Failed to parse coordinates:', coordinates, error);
              return false;
            }
          }

          // Handle both {lat, lng} and {latitude, longitude} formats
          const lat = coordinates.lat || coordinates.latitude;
          const lng = coordinates.lng || coordinates.longitude;

          if (!lat || !lng) return false;

          // Check if coordinates are within bounds
          return lat >= parseFloat(south) &&
                 lat <= parseFloat(north) &&
                 lng >= parseFloat(west) &&
                 lng <= parseFloat(east);
        })
        .map(event => {
          const venue = event.canonical_venues;
          let coordinates = venue.coordinates;

          // Parse coordinates if they're stored as JSON string
          if (typeof coordinates === 'string') {
            try {
              coordinates = JSON.parse(coordinates);
            } catch (error) {
              console.error('Failed to parse coordinates:', coordinates, error);
              coordinates = null;
            }
          }

          // Convert database format to map format {lat, lng}
          if (coordinates && (coordinates.latitude || coordinates.lat)) {
            coordinates = {
              lat: coordinates.lat || coordinates.latitude,
              lng: coordinates.lng || coordinates.longitude
            };
          }

          return {
            ...event,
            venue: {
              id: venue.id,
              name: venue.name,
              city: venue.city,
              capacity: venue.capacity,
              coordinates,
              created_at: venue.created_at
            }
          };
        });

      console.log(`Found ${events.length} events in bounds`);

      // Log sample BEFORE enrichment
      if (events.length > 0) {
        console.log(`[Map API] Sample event BEFORE enrichment:`, {
          id: events[0].id,
          name: events[0].name,
          has_biletinial_id: !!events[0].biletinial_event_id,
          has_bubilet_id: !!events[0].bubilet_event_id,
          has_image_url: !!events[0].image_url
        });
      }

      // Enrich events with images from provider platforms
      const enrichedEvents = await ServerEventsService.enrichEventsWithImages(events);

      // Log sample AFTER enrichment
      if (enrichedEvents.length > 0) {
        console.log(`[Map API] Sample event AFTER enrichment:`, {
          id: enrichedEvents[0].id,
          name: enrichedEvents[0].name,
          has_image_url: !!enrichedEvents[0].image_url,
          image_url: enrichedEvents[0].image_url
        });
      }

      return NextResponse.json({
        events: enrichedEvents,
        count: enrichedEvents.length
      });
    }

    // Fallback: get all events with coordinates (existing behavior)
    console.log('Using fallback query (all events with coordinates)');

    // First, let's get venues that have coordinates
    const { data: venuesWithCoords } = await supabase
      .from('canonical_venues')
      .select('id')
      .not('coordinates', 'is', null);

    const venueIds = (venuesWithCoords || []).map(v => v.id);

    if (venueIds.length === 0) {
      return NextResponse.json({
        events: [],
        count: 0
      });
    }

    const { data, error } = await supabase
      .from('unique_events')
      .select(`
        id,
        name,
        date,
        artist,
        genre,
        description,
        providers,
        canonical_venue_id,
        biletinial_event_id,
        biletix_event_id,
        passo_event_id,
        bugece_event_id,
        bubilet_event_id,
        status,
        created_at,
        updated_at,
        canonical_venues (
          id,
          name,
          city,
          capacity,
          coordinates,
          created_at
        )
      `)
      .in('canonical_venue_id', venueIds)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching events for map:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events for map' },
        { status: 500 }
      );
    }

    const events = (data || [])
      .filter(event => event.canonical_venues)
      .map(event => {
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

        return {
          ...event,
          venue: {
            id: venue.id,
            name: venue.name,
            city: venue.city,
            capacity: venue.capacity,
            coordinates,
            created_at: venue.created_at
          }
        };
      })
      .filter(event => event.venue.coordinates);

    // Log sample BEFORE enrichment
    if (events.length > 0) {
      console.log(`[Map API Fallback] Sample event BEFORE enrichment:`, {
        id: events[0].id,
        name: events[0].name,
        has_biletinial_id: !!events[0].biletinial_event_id,
        has_bubilet_id: !!events[0].bubilet_event_id,
        has_image_url: !!events[0].image_url
      });
    }

    // Enrich events with images from provider platforms
    const enrichedEvents = await ServerEventsService.enrichEventsWithImages(events);

    // Log sample AFTER enrichment
    if (enrichedEvents.length > 0) {
      console.log(`[Map API Fallback] Sample event AFTER enrichment:`, {
        id: enrichedEvents[0].id,
        name: enrichedEvents[0].name,
        has_image_url: !!enrichedEvents[0].image_url,
        image_url: enrichedEvents[0].image_url
      });
    }

    return NextResponse.json({
      events: enrichedEvents,
      count: enrichedEvents.length
    });

  } catch (error) {
    console.error('Error in events map API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}