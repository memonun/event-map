import { createClient } from '@/lib/supabase/client';

export interface EventPriceData {
  platform: string;
  categories: PriceCategory[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  hasAvailableTickets: boolean;
}

export interface PriceCategory {
  category: string;
  price: number;
  remaining?: number;
  soldOut: boolean;
}

export class ClientPricesService {
  private static supabase = createClient();

  static async getEventPrices(eventId: string): Promise<EventPriceData[]> {
    try {
      console.log('Fetching prices for event:', eventId);

      // Use RPC function to get price data from all platforms
      const { data: priceData, error } = await this.supabase
        .rpc('get_event_prices', { event_id_param: eventId });

      if (error) {
        console.error('Error calling get_event_prices RPC:', error);
        return [];
      }

      if (!priceData || priceData.length === 0) {
        console.log('No price data found for event:', eventId);
        return [];
      }

      console.log('Raw price data received:', priceData);

      // Group prices by platform
      const platformGroups = priceData.reduce((groups: Record<string, any[]>, price: any) => {
        if (!groups[price.platform]) {
          groups[price.platform] = [];
        }
        groups[price.platform].push(price);
        return groups;
      }, {});

      const prices: EventPriceData[] = [];

      // Process each platform's prices
      for (const [platformName, platformPrices] of Object.entries(platformGroups)) {
        // Get the most recent prices (group by snapshot_id if available, otherwise use all recent prices)
        let latestPrices = platformPrices;

        // If snapshot_id exists, use latest snapshot
        if ((platformPrices as any[])[0]?.snapshot_id) {
          const latestSnapshot = (platformPrices as any[])
            .filter((p: any) => p.snapshot_id)
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.snapshot_id;

          if (latestSnapshot) {
            latestPrices = (platformPrices as any[]).filter((p: any) => p.snapshot_id === latestSnapshot);
          }
        }

        const categories: PriceCategory[] = (latestPrices as any[]).map((price: any) => ({
          category: price.category || 'Genel',
          price: parseFloat(price.price) || 0,
          remaining: price.remaining || undefined,
          soldOut: price.sold_out || false
        }));

        const priceValues = categories.map(c => c.price).filter(p => p > 0);

        if (priceValues.length > 0) {
          prices.push({
            platform: platformName,
            categories,
            minPrice: Math.min(...priceValues),
            maxPrice: Math.max(...priceValues),
            avgPrice: priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length,
            hasAvailableTickets: categories.some(c => !c.soldOut)
          });

          console.log(`✅ Found ${priceValues.length} price categories for ${platformName}:`,
            priceValues.map(p => `₺${p}`).join(', '));
        }
      }

      console.log(`✅ Successfully processed prices from ${prices.length} platforms`);
      return prices;
    } catch (error) {
      console.error('Error fetching event prices:', error);
      return [];
    }
  }

  static async getEventMinPrice(eventId: string): Promise<number | null> {
    try {
      const prices = await this.getEventPrices(eventId);

      if (prices.length === 0) return null;

      const allMinPrices = prices.map(p => p.minPrice).filter(p => p > 0);
      return allMinPrices.length > 0 ? Math.min(...allMinPrices) : null;
    } catch (error) {
      console.error('Error fetching event min price:', error);
      return null;
    }
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  static formatPriceRange(minPrice: number, maxPrice: number): string {
    if (minPrice === maxPrice) {
      return this.formatPrice(minPrice);
    }
    return `${this.formatPrice(minPrice)} - ${this.formatPrice(maxPrice)}`;
  }
}