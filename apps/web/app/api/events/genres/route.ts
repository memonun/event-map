import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get all unique genres with their event counts
    const { data, error } = await supabase
      .from('unique_events')
      .select('genre')
      .gte('date', new Date().toISOString()) // Only upcoming events
      .not('genre', 'is', null);

    if (error) {
      console.error('Error fetching available genres:', error);
      return NextResponse.json(
        { error: 'Failed to fetch genres' },
        { status: 500 }
      );
    }

    // Count genres manually
    const genreCounts: { [key: string]: number } = {};
    (data || []).forEach(event => {
      if (event.genre) {
        genreCounts[event.genre] = (genreCounts[event.genre] || 0) + 1;
      }
    });

    // Also add "Uncategorized" for events without genre
    const { count: uncategorizedCount } = await supabase
      .from('unique_events')
      .select('*', { count: 'exact', head: true })
      .gte('date', new Date().toISOString())
      .is('genre', null);

    const result = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    // Add uncategorized if there are events without genre
    if (uncategorizedCount && uncategorizedCount > 0) {
      result.push({ genre: 'Uncategorized', count: uncategorizedCount });
    }

    return NextResponse.json({
      genres: result,
      count: result.length
    });

  } catch (error) {
    console.error('Error in genres API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}