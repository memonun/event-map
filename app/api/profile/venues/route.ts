import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/profile/venues - Get user's favorite venues with details
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user profile with favorite venues
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    const favoriteVenueIds = profile?.preferences?.favorite_venues || [];

    if (favoriteVenueIds.length === 0) {
      return NextResponse.json({
        venues: [],
        total: 0
      });
    }

    // Get venue details for favorites
    const { data: venues, error } = await supabase
      .from('canonical_venues')
      .select('*')
      .in('id', favoriteVenueIds);

    if (error) {
      console.error('Error fetching favorite venues:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get upcoming events count for each venue
    const venuesWithEventCounts = await Promise.all(
      (venues || []).map(async (venue) => {
        const { count: upcomingCount } = await supabase
          .from('unique_events')
          .select('*', { count: 'exact', head: true })
          .eq('canonical_venue_id', venue.id)
          .gte('date', new Date().toISOString());

        const { count: totalCount } = await supabase
          .from('unique_events')
          .select('*', { count: 'exact', head: true })
          .eq('canonical_venue_id', venue.id);

        return {
          ...venue,
          upcoming_events: upcomingCount || 0,
          total_events: totalCount || 0
        };
      })
    );

    return NextResponse.json({
      venues: venuesWithEventCounts,
      total: venuesWithEventCounts.length
    });
  } catch (error) {
    console.error('Server error in venues:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/profile/venues - Add venue to favorites
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { venueId } = await request.json();

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 });
    }

    // Verify venue exists
    const { data: venue } = await supabase
      .from('canonical_venues')
      .select('id, name')
      .eq('id', venueId)
      .single();

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Get current preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    const currentFavorites = profile?.preferences?.favorite_venues || [];
    
    if (currentFavorites.includes(venueId)) {
      return NextResponse.json({ error: 'Venue already in favorites' }, { status: 400 });
    }

    // Add to favorites
    const updatedFavorites = [...currentFavorites, venueId];
    const updatedPreferences = {
      ...profile?.preferences,
      favorite_venues: updatedFavorites
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
      venue: venue,
      message: `${venue.name} added to favorites`
    });
  } catch (error) {
    console.error('Server error adding venue to favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/profile/venues - Remove venue from favorites
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { venueId } = await request.json();

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 });
    }

    // Get current preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    const currentFavorites = profile?.preferences?.favorite_venues || [];
    
    if (!currentFavorites.includes(venueId)) {
      return NextResponse.json({ error: 'Venue not in favorites' }, { status: 400 });
    }

    // Remove from favorites
    const updatedFavorites = currentFavorites.filter((id: string) => id !== venueId);
    const updatedPreferences = {
      ...profile?.preferences,
      favorite_venues: updatedFavorites
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
      message: 'Venue removed from favorites'
    });
  } catch (error) {
    console.error('Server error removing venue from favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}