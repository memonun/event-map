import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/profile/artists/calendar - Get upcoming events from followed artists
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's followed artists
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    const followedArtistNames = profile?.preferences?.followed_artists || [];

    if (followedArtistNames.length === 0) {
      return NextResponse.json({
        events: [],
        total: 0,
        by_month: {},
        by_artist: {}
      });
    }

    // Get artists data first
    const { data: artists } = await supabase
      .from('artists.artists')
      .select('id, artists_name, normalized_name')
      .in('normalized_name', followedArtistNames);

    if (!artists || artists.length === 0) {
      return NextResponse.json({
        events: [],
        total: 0,
        by_month: {},
        by_artist: {}
      });
    }

    const artistIds = artists.map(a => a.id);

    // Get upcoming events for followed artists
    const { data: eventArtists, error } = await supabase
      .from('artists.event_artists')
      .select(`
        artist:artists!inner (
          id,
          artists_name,
          normalized_name
        ),
        event:unique_events!inner (
          id,
          name,
          date,
          genre,
          image_url,
          venue:canonical_venues!inner (
            id,
            name,
            city,
            coordinates
          )
        )
      `)
      .in('artist_id', artistIds)
      .gte('event.date', new Date().toISOString())
      .order('event.date', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching artist calendar:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data
    const events = (eventArtists || []).map((item: any) => ({
      ...item.event,
      artist: item.artist,
      venue: item.event.venue
    }));

    // Group by month
    const byMonth: Record<string, any[]> = {};
    const byArtist: Record<string, any[]> = {};

    events.forEach((event: any) => {
      const eventDate = new Date(event.date);
      const monthKey = eventDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = [];
      }
      byMonth[monthKey].push(event);

      const artistName = event.artist.artists_name;
      if (!byArtist[artistName]) {
        byArtist[artistName] = [];
      }
      byArtist[artistName].push(event);
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(byMonth).sort((a, b) => {
      return new Date(a + ' 1').getTime() - new Date(b + ' 1').getTime();
    });

    const sortedByMonth: Record<string, any[]> = {};
    sortedMonths.forEach(month => {
      sortedByMonth[month] = byMonth[month].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });

    return NextResponse.json({
      events,
      total: events.length,
      by_month: sortedByMonth,
      by_artist: byArtist,
      followed_artists: artists
    });
  } catch (error) {
    console.error('Server error in artist calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}