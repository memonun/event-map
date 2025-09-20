import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/artists/search?q=query - Search for artists by name or genre
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        artists: [],
        message: 'Query must be at least 2 characters'
      });
    }

    const supabase = await createClient();

    // Search artists using RPC function (bypasses schema access restrictions)
    const { data: artists, error } = await supabase
      .rpc('search_artists', { query_text: query.trim() });

    if (error) {
      console.error('Error searching artists:', error);
      return NextResponse.json(
        { error: 'Failed to search artists' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      artists: artists || [],
      total: artists?.length || 0,
      query: query.trim()
    });

  } catch (error) {
    console.error('Server error in artist search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}