import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params;

    if (!venueId) {
      return NextResponse.json(
        { error: 'Venue ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get upcoming events for the venue with venue information
    const { data: events, error } = await supabase
      .from('unique_events')
      .select(`
        *,
        canonical_venues!inner(
          id,
          name,
          city,
          capacity,
          coordinates
        )
      `)
      .eq('canonical_venue_id', venueId)
      .gt('date', new Date().toISOString())
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching venue events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch venue events' },
        { status: 500 }
      );
    }

    // Transform the data to match EventWithVenue interface
    const eventsWithVenue = (events || []).map(event => ({
      ...event,
      venue: event.canonical_venues
    }));

    return NextResponse.json({
      events: eventsWithVenue,
      count: eventsWithVenue.length
    });
  } catch (error) {
    console.error('Error in venue events API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}