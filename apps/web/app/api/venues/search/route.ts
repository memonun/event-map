import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/venues/search?q=query - Search for venues by name or city
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        venues: [],
        message: 'Query must be at least 2 characters'
      });
    }

    const supabase = await createClient();

    // Search venues by name or city with case-insensitive matching
    const { data: venues, error } = await supabase
      .from('canonical_venues')
      .select('id, name, city, capacity')
      .or(`name.ilike.%${query.trim()}%, city.ilike.%${query.trim()}%`)
      .order('name')
      .limit(20);

    if (error) {
      console.error('Error searching venues:', error);
      return NextResponse.json(
        { error: 'Failed to search venues' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      venues: venues || [],
      total: venues?.length || 0,
      query: query.trim()
    });

  } catch (error) {
    console.error('Server error in venue search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}