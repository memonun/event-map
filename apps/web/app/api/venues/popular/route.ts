import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '20';

    const supabase = await createClient();

    // Get popular venues ordered by capacity
    const { data: venues, error } = await supabase
      .from('canonical_venues')
      .select('*')
      .order('capacity', { ascending: false, nullsLast: true })
      .limit(parseInt(limit));

    if (error) {
      console.error('Error fetching popular venues:', error);

      // Fallback to simple query if the complex one fails
      const { data: fallbackVenues, error: fallbackError } = await supabase
        .from('canonical_venues')
        .select('*')
        .order('capacity', { ascending: false, nullsLast: true })
        .limit(parseInt(limit));

      if (fallbackError) {
        return NextResponse.json(
          { error: 'Failed to fetch popular venues' },
          { status: 500 }
        );
      }

      // Add event_count: 0 to fallback venues
      const venuesWithEventCount = (fallbackVenues || []).map(venue => ({
        ...venue,
        event_count: 0
      }));

      return NextResponse.json({
        venues: venuesWithEventCount,
        count: venuesWithEventCount.length
      });
    }

    // Get event counts for venues
    const venueIds = (venues || []).map(v => v.id);
    let eventCounts = {};

    if (venueIds.length > 0) {
      const { data: eventCountData } = await supabase
        .from('unique_events')
        .select('canonical_venue_id')
        .in('canonical_venue_id', venueIds)
        .gt('date', new Date().toISOString());

      // Count events per venue
      (eventCountData || []).forEach(event => {
        eventCounts[event.canonical_venue_id] = (eventCounts[event.canonical_venue_id] || 0) + 1;
      });
    }

    // Add event_count field to each venue and standardize coordinates
    const venuesWithEventCount = (venues || []).map(venue => ({
      ...venue,
      coordinates: venue.coordinates ? {
        lat: venue.coordinates.lat || venue.coordinates.latitude,
        lng: venue.coordinates.lng || venue.coordinates.longitude,
        // Keep original format as backup
        latitude: venue.coordinates.latitude,
        longitude: venue.coordinates.longitude
      } : venue.coordinates,
      event_count: eventCounts[venue.id] || 0
    }));

    return NextResponse.json({
      venues: venuesWithEventCount,
      count: venuesWithEventCount.length
    });
  } catch (error) {
    console.error('Error in popular venues API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}