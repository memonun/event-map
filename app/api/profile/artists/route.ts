import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/profile/artists - Get user's followed artists with details
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user profile with followed artists
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    const followedArtistNames = profile?.preferences?.followed_artists || [];

    if (followedArtistNames.length === 0) {
      return NextResponse.json({
        artists: [],
        total: 0
      });
    }

    // Get artist details for followed artists
    const { data: artists, error } = await supabase
      .from('artists.artists')
      .select('*')
      .in('normalized_name', followedArtistNames);

    if (error) {
      console.error('Error fetching followed artists:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get upcoming events count for each artist
    const artistsWithEventCounts = await Promise.all(
      (artists || []).map(async (artist) => {
        // Get upcoming events for this artist
        const { data: upcomingEvents } = await supabase
          .from('artists.event_artists')
          .select(`
            event:unique_events!inner (
              id,
              name,
              date,
              venue:canonical_venues (
                name,
                city
              )
            )
          `)
          .eq('artist_id', artist.id)
          .gte('event.date', new Date().toISOString())
          .order('event.date', { ascending: true })
          .limit(3);

        // Get total events count
        const { count: totalCount } = await supabase
          .from('artists.event_artists')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', artist.id);

        return {
          ...artist,
          upcoming_events: (upcomingEvents || []).map((item: any) => ({
            ...item.event,
            venue: item.event.venue
          })),
          upcoming_count: upcomingEvents?.length || 0,
          total_events: totalCount || 0
        };
      })
    );

    return NextResponse.json({
      artists: artistsWithEventCounts,
      total: artistsWithEventCounts.length
    });
  } catch (error) {
    console.error('Server error in artists:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/profile/artists - Follow an artist
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { artistName } = await request.json();

    if (!artistName) {
      return NextResponse.json({ error: 'Artist name is required' }, { status: 400 });
    }

    // Find artist by name (case insensitive)
    const { data: artist } = await supabase
      .from('artists.artists')
      .select('id, artists_name, normalized_name')
      .ilike('artists_name', artistName)
      .single();

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Get current preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    const currentFollowed = profile?.preferences?.followed_artists || [];
    
    if (currentFollowed.includes(artist.normalized_name)) {
      return NextResponse.json({ error: 'Artist already followed' }, { status: 400 });
    }

    // Add to followed artists
    const updatedFollowed = [...currentFollowed, artist.normalized_name];
    const updatedPreferences = {
      ...profile?.preferences,
      followed_artists: updatedFollowed
    };

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ preferences: updatedPreferences })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      artist: artist,
      message: `Now following ${artist.artists_name}`
    });
  } catch (error) {
    console.error('Server error following artist:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/profile/artists - Unfollow an artist
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { artistName } = await request.json();

    if (!artistName) {
      return NextResponse.json({ error: 'Artist name is required' }, { status: 400 });
    }

    // Get current preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    const currentFollowed = profile?.preferences?.followed_artists || [];
    
    // Find the normalized name to remove (case insensitive)
    const normalizedToRemove = currentFollowed.find((name: string) => 
      name.toLowerCase() === artistName.toLowerCase()
    );

    if (!normalizedToRemove) {
      return NextResponse.json({ error: 'Artist not followed' }, { status: 400 });
    }

    // Remove from followed artists
    const updatedFollowed = currentFollowed.filter((name: string) => name !== normalizedToRemove);
    const updatedPreferences = {
      ...profile?.preferences,
      followed_artists: updatedFollowed
    };

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ preferences: updatedPreferences })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Artist unfollowed successfully'
    });
  } catch (error) {
    console.error('Server error unfollowing artist:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}