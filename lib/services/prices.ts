import { createClient } from '@/lib/supabase/server';
import type { PlatformPrice, PriceComparisonResponse } from '@/lib/types';

export class PricesService {
  /**
   * Get current prices for an event across all platforms
   */
  static async getEventPrices(eventId: string): Promise<PriceComparisonResponse> {
    const supabase = await createClient();
    
    // First get the event to find platform-specific IDs
    const { data: event, error: eventError } = await supabase
      .from('unique_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Error fetching event for prices:', eventError);
      return { event_id: eventId, platforms: [] };
    }

    const platforms = [];

    // Get Bubilet prices
    if (event.bubilet_event_id) {
      const prices = await this.getPlatformPrices('bubilet', event.bubilet_event_id);
      if (prices.length > 0) {
        platforms.push({
          platform: 'bubilet',
          prices,
          min_price: Math.min(...prices.map(p => p.price)),
          max_price: Math.max(...prices.map(p => p.price)),
          url: null // TODO: Add platform URL generation
        });
      }
    }

    // Get Biletix prices
    if (event.biletix_event_id) {
      const prices = await this.getPlatformPrices('biletix', event.biletix_event_id);
      if (prices.length > 0) {
        platforms.push({
          platform: 'biletix',
          prices,
          min_price: Math.min(...prices.map(p => p.price)),
          max_price: Math.max(...prices.map(p => p.price)),
          url: null
        });
      }
    }

    // Get Biletinial prices
    if (event.biletinial_event_id) {
      const prices = await this.getPlatformPrices('biletinial', event.biletinial_event_id);
      if (prices.length > 0) {
        platforms.push({
          platform: 'biletinial',
          prices,
          min_price: Math.min(...prices.map(p => p.price)),
          max_price: Math.max(...prices.map(p => p.price)),
          url: null
        });
      }
    }

    // Get Passo prices
    if (event.passo_event_id) {
      const prices = await this.getPlatformPrices('passo', event.passo_event_id);
      if (prices.length > 0) {
        platforms.push({
          platform: 'passo',
          prices,
          min_price: Math.min(...prices.map(p => p.price)),
          max_price: Math.max(...prices.map(p => p.price)),
          url: null
        });
      }
    }

    // Get Bugece prices
    if (event.bugece_event_id) {
      const prices = await this.getPlatformPrices('bugece', event.bugece_event_id);
      if (prices.length > 0) {
        platforms.push({
          platform: 'bugece',
          prices,
          min_price: Math.min(...prices.map(p => p.price)),
          max_price: Math.max(...prices.map(p => p.price)),
          url: null
        });
      }
    }

    return { event_id: eventId, platforms };
  }

  /**
   * Get current prices for a specific platform and event
   */
  private static async getPlatformPrices(
    platform: string, 
    eventId: number
  ): Promise<PlatformPrice[]> {
    const supabase = await createClient();
    
    // Get the latest snapshot ID for this event
    const { data: latestSnapshot, error: snapshotError } = await supabase
      .from(`ticketing_platforms_raw_data.${platform}_prices`)
      .select('snapshot_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (snapshotError || !latestSnapshot) {
      return [];
    }

    // Get all prices for the latest snapshot
    const { data, error } = await supabase
      .from(`ticketing_platforms_raw_data.${platform}_prices`)
      .select('*')
      .eq('event_id', eventId)
      .eq('snapshot_id', latestSnapshot.snapshot_id)
      .order('price', { ascending: true });

    if (error) {
      console.error(`Error fetching ${platform} prices:`, error);
      return [];
    }

    return data || [];
  }

  /**
   * Get price history for an event on a specific platform
   */
  static async getPriceHistory(
    platform: string,
    eventId: number,
    days: number = 30
  ): Promise<PlatformPrice[]> {
    const supabase = await createClient();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from(`ticketing_platforms_raw_data.${platform}_price_history`)
      .select('*')
      .eq('event_id', eventId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Error fetching ${platform} price history:`, error);
      return [];
    }

    return data || [];
  }

  /**
   * Get cheapest available prices across all platforms for multiple events
   */
  static async getCheapestPrices(eventIds: string[]): Promise<{
    event_id: string;
    min_price: number | null;
    platform: string | null;
  }[]> {
    const supabase = await createClient();
    
    const results = [];
    
    for (const eventId of eventIds) {
      const priceComparison = await this.getEventPrices(eventId);
      
      let minPrice: number | null = null;
      let cheapestPlatform: string | null = null;
      
      for (const platformData of priceComparison.platforms) {
        if (platformData.min_price !== null) {
          if (minPrice === null || platformData.min_price < minPrice) {
            minPrice = platformData.min_price;
            cheapestPlatform = platformData.platform;
          }
        }
      }
      
      results.push({
        event_id: eventId,
        min_price: minPrice,
        platform: cheapestPlatform
      });
    }
    
    return results;
  }

  /**
   * Get average price for a venue
   */
  static async getVenueAveragePrice(venueId: string): Promise<number | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_venue_average_price', {
      venue_id: venueId
    });

    if (error) {
      console.error('Error fetching venue average price:', error);
      return null;
    }

    return data;
  }

  /**
   * Get price trends for a genre
   */
  static async getGenrePriceTrends(genre: string, days: number = 90): Promise<{
    date: string;
    avg_price: number;
    event_count: number;
  }[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_genre_price_trends', {
      target_genre: genre,
      days_back: days
    });

    if (error) {
      console.error('Error fetching genre price trends:', error);
      return [];
    }

    return data || [];
  }
}