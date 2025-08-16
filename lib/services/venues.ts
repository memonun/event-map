import { createClient } from '@/lib/supabase/server';
import type { CanonicalVenue } from '@/lib/types';

export class VenuesService {
  /**
   * Get all venues with coordinates
   */
  static async getVenuesWithCoordinates(): Promise<CanonicalVenue[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('canonical_venues')
      .select('*')
      .not('coordinates', 'is', null)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching venues with coordinates:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get venue by ID
   */
  static async getVenueById(id: string): Promise<CanonicalVenue | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('canonical_venues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching venue:', error);
      return null;
    }

    return data;
  }

  /**
   * Get venues in a specific city
   */
  static async getVenuesByCity(city: string): Promise<CanonicalVenue[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('canonical_venues')
      .select('*')
      .eq('city', city)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching venues by city:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get venues near a location
   */
  static async getVenuesNearLocation(
    lat: number,
    lng: number,
    radiusMeters: number = 5000
  ): Promise<CanonicalVenue[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_venues_near_location', {
      search_lat: lat,
      search_lng: lng,
      radius_meters: radiusMeters
    });

    if (error) {
      console.error('Error fetching venues near location:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Search venues by name
   */
  static async searchVenues(query: string, limit: number = 50): Promise<CanonicalVenue[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('canonical_venues')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error searching venues:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get venue statistics
   */
  static async getVenueStats(venueId: string): Promise<{
    total_events: number;
    upcoming_events: number;
    genres: string[];
    avg_capacity_usage?: number;
  } | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_venue_statistics', {
      venue_id: venueId
    });

    if (error) {
      console.error('Error fetching venue statistics:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all cities with venues
   */
  static async getCitiesWithVenues(): Promise<{ city: string; venue_count: number }[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_cities_with_venues');

    if (error) {
      console.error('Error fetching cities with venues:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get venue event count
   */
  static async getVenueEventCount(venueId: string): Promise<number> {
    const supabase = await createClient();
    
    const { count, error } = await supabase
      .from('unique_events')
      .select('*', { count: 'exact', head: true })
      .eq('canonical_venue_id', venueId)
      .gte('date', new Date().toISOString());

    if (error) {
      console.error('Error fetching venue event count:', error);
      return 0;
    }

    return count || 0;
  }
}