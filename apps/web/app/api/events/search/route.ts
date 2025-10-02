import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { EventSearchParams } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse search parameters
    const params: EventSearchParams = {
      query: searchParams.get('query') || undefined,
      genre: searchParams.get('genre') || undefined,
      city: searchParams.get('city') || undefined,
      date_from: searchParams.get('date_from') || new Date().toISOString(),
      date_to: searchParams.get('date_to') || undefined,
      platforms: searchParams.get('platforms')?.split(',') || undefined,
      limit: parseInt(searchParams.get('limit') || '100'),
    };

    const supabase = await createClient();

    let query = supabase
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
        venue:canonical_venues (
          id,
          name,
          city,
          capacity,
          coordinates
        )
      `)
      .gte('date', params.date_from || new Date().toISOString())
      .order('date', { ascending: true })
      .limit(Math.min(params.limit || 100, 1000)); // Cap at 1000 for performance

    // Apply filters - Simplified and faster search
    if (params.query && params.query.length > 0) {
      const searchTerm = params.query.trim();

      // Only search if term is meaningful (2+ chars to avoid massive result sets)
      if (searchTerm.length >= 2) {
        // Use more efficient search with proper indexing
        query = query.or(`name.ilike.*${searchTerm}*,genre.ilike.*${searchTerm}*`);
      }
    }

    if (params.genre) {
      // Handle special uncategorized value
      if (params.genre === '__uncategorized__') {
        query = query.is('genre', null);
      } else {
        query = query.eq('genre', params.genre);
      }
    }

    if (params.date_to) {
      query = query.lte('date', params.date_to);
    }

    if (params.platforms && params.platforms.length > 0) {
      query = query.overlaps('providers', params.platforms);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error searching events:', error);
      return NextResponse.json(
        { error: 'Failed to search events' },
        { status: 500 }
      );
    }

    let events = (data as any[] || [])
      .filter(event => event.venue)
      .map(event => {
        // Convert coordinate format if needed
        let coordinates = event.venue!.coordinates;
        if (coordinates && coordinates.latitude && coordinates.longitude) {
          coordinates = {
            lat: coordinates.latitude,
            lng: coordinates.longitude
          };
        }

        return {
          ...event,
          venue: {
            ...event.venue!,
            coordinates
          }
        };
      });

    // Apply additional filters after fetching (Supabase doesn't support nested relationship filters)
    if (params.city) {
      events = events.filter(event => event.venue?.city === params.city);
    }

    return NextResponse.json({
      events,
      total: events.length,
      has_more: events.length >= (params.limit || 100)
    });

  } catch (error) {
    console.error('Error in events search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}