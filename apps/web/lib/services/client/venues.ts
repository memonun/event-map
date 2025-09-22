import { createClient } from '@/lib/supabase/client';
import type { CanonicalVenue } from '@/lib/types';

export class ClientVenuesService {
  /**
   * Get all venues with coordinates
   */
  static async getVenuesWithCoordinates(): Promise<CanonicalVenue[]> {
    const supabase = createClient();
    
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
   * Get venues in a specific city
   */
  static async getVenuesByCity(city: string): Promise<CanonicalVenue[]> {
    const supabase = createClient();
    
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
    const supabase = createClient();
    
    // Try RPC first, fallback to basic query
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_venues_near_location', {
      search_lat: lat,
      search_lng: lng,
      radius_meters: radiusMeters
    });

    if (!rpcError && rpcData) {
      return rpcData || [];
    }

    // Fallback: get all venues with coordinates (basic implementation)
    console.log('RPC failed, using fallback venues query:', rpcError?.message);
    return this.getVenuesWithCoordinates();
  }

  /**
   * Get all cities with venues
   */
  static async getCitiesWithVenues(): Promise<{ city: string; venue_count: number }[]> {
    const supabase = createClient();
    
    // Try RPC first, fallback to manual aggregation
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_cities_with_venues');

    if (!rpcError && rpcData) {
      return rpcData || [];
    }

    // Fallback: Manual city aggregation
    console.log('RPC failed, using fallback city query:', rpcError?.message);
    
    const { data, error } = await supabase
      .from('canonical_venues')
      .select('city')
      .not('city', 'is', null);

    if (error) {
      console.error('Error in fallback city query:', error);
      return [];
    }

    // Count cities manually
    const cityCounts: { [key: string]: number } = {};
    (data || []).forEach(venue => {
      if (venue.city) {
        cityCounts[venue.city] = (cityCounts[venue.city] || 0) + 1;
      }
    });

    return Object.entries(cityCounts)
      .map(([city, venue_count]) => ({ city, venue_count }))
      .sort((a, b) => b.venue_count - a.venue_count);
  }
}