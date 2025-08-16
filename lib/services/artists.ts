import { createClient } from '@/lib/supabase/server';
import type { 
  Artist, 
  UnifiedArtistProfile,
  EventWithVenue 
} from '@/lib/types';

export class ArtistsService {
  /**
   * Get artists for an event
   */
  static async getEventArtists(eventId: string): Promise<(Artist & { 
    position: number;
    profile?: UnifiedArtistProfile;
  })[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('artists.event_artists')
      .select(`
        position,
        artist:artists!inner (
          id,
          artists_name,
          normalized_name,
          spotify_link,
          genre
        )
      `)
      .eq('event_id', eventId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching event artists:', error);
      return [];
    }

    // Get unified profiles for each artist
    const artistsWithProfiles = [];
    
    for (const item of data || []) {
      const artist = {
        ...item.artist,
        position: item.position,
        created_at: '',
        updated_at: ''
      };

      // Try to get unified profile
      const profile = await this.getArtistProfile(artist.normalized_name);
      if (profile) {
        artist.profile = profile;
      }

      artistsWithProfiles.push(artist);
    }

    return artistsWithProfiles;
  }

  /**
   * Get unified artist profile
   */
  static async getArtistProfile(normalizedName: string): Promise<UnifiedArtistProfile | null> {
    const supabase = await createClient();
    
    // First get canonical artist
    const { data: canonicalArtist, error: canonicalError } = await supabase
      .from('canonical_artists')
      .select('unified_profile_id')
      .eq('normalized_name', normalizedName)
      .single();

    if (canonicalError || !canonicalArtist?.unified_profile_id) {
      return null;
    }

    // Get unified profile
    const { data: profile, error: profileError } = await supabase
      .from('unified_artist_profile')
      .select('*')
      .eq('uuid', canonicalArtist.unified_profile_id)
      .single();

    if (profileError) {
      console.error('Error fetching artist profile:', profileError);
      return null;
    }

    return profile;
  }

  /**
   * Search artists
   */
  static async searchArtists(query: string, limit: number = 20): Promise<Artist[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('artists.artists')
      .select('*')
      .ilike('artists_name', `%${query}%`)
      .order('artists_name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error searching artists:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get events for an artist
   */
  static async getArtistEvents(artistId: string, upcoming: boolean = true): Promise<EventWithVenue[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('artists.event_artists')
      .select(`
        event:unique_events!inner (
          *,
          venue:canonical_venues (
            id,
            name,
            city,
            capacity,
            coordinates
          )
        )
      `)
      .eq('artist_id', artistId)
      .order('event.date', { ascending: true });

    if (upcoming) {
      query = query.gte('event.date', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching artist events:', error);
      return [];
    }

    return (data || [])
      .map(item => item.event)
      .filter(event => event.venue)
      .map(event => ({
        ...event,
        venue: event.venue!
      }));
  }

  /**
   * Get top artists by event count
   */
  static async getTopArtists(limit: number = 50): Promise<(Artist & {
    event_count: number;
    profile?: UnifiedArtistProfile;
  })[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_top_artists_by_events', {
      result_limit: limit
    });

    if (error) {
      console.error('Error fetching top artists:', error);
      return [];
    }

    // Enhance with profiles
    const artistsWithProfiles = [];
    
    for (const artist of data || []) {
      const profile = await this.getArtistProfile(artist.normalized_name);
      artistsWithProfiles.push({
        ...artist,
        profile
      });
    }

    return artistsWithProfiles;
  }

  /**
   * Get artists by genre
   */
  static async getArtistsByGenre(genre: string, limit: number = 50): Promise<Artist[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('artists.artists')
      .select('*')
      .contains('genre', [genre])
      .order('artists_name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching artists by genre:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get artist popularity metrics
   */
  static async getArtistPopularity(artistId: string): Promise<{
    monthly_listeners?: number;
    followers?: number;
    event_count: number;
    upcoming_events: number;
  } | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_artist_popularity_metrics', {
      artist_id: artistId
    });

    if (error) {
      console.error('Error fetching artist popularity:', error);
      return null;
    }

    return data;
  }

  /**
   * Get similar artists (based on shared events/venues)
   */
  static async getSimilarArtists(artistId: string, limit: number = 10): Promise<Artist[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_similar_artists', {
      target_artist_id: artistId,
      result_limit: limit
    });

    if (error) {
      console.error('Error fetching similar artists:', error);
      return [];
    }

    return data || [];
  }
}