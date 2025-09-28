import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const limit = searchParams.get('limit') || '20';

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get venues with coordinates - we'll calculate event counts separately
    const { data: venues, error } = await supabase
      .from('canonical_venues')
      .select('*')
      .not('coordinates', 'is', null)
      .limit(parseInt(limit) * 3); // Get more to filter by distance

    if (error) {
      console.error('Error fetching venues:', error);
      return NextResponse.json(
        { error: 'Failed to fetch venues' },
        { status: 500 }
      );
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

    // Calculate distance and filter nearby venues
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = 50;

    const nearbyVenues = (venues || [])
      .map(venue => {
        // Handle both coordinate formats: {lat, lng} and {latitude, longitude}
        const venueLat = venue.coordinates?.lat || venue.coordinates?.latitude;
        const venueLng = venue.coordinates?.lng || venue.coordinates?.longitude;

        if (!venueLat || !venueLng) return null;

        // Calculate distance using Haversine formula
        const distance = calculateDistance(userLat, userLng, venueLat, venueLng);

        if (distance > radiusKm) return null;

        return {
          ...venue,
          coordinates: {
            lat: venueLat,
            lng: venueLng,
            // Keep original format as backup
            latitude: venue.coordinates?.latitude,
            longitude: venue.coordinates?.longitude
          },
          event_count: eventCounts[venue.id] || 0,
          distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
        };
      })
      .filter(venue => venue !== null)
      .sort((a, b) => {
        // Sort by distance first, then by event count
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        return b.event_count - a.event_count;
      })
      .slice(0, parseInt(limit));

    return NextResponse.json({
      venues: nearbyVenues,
      count: nearbyVenues.length
    });
  } catch (error) {
    console.error('Error in nearby venues API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}