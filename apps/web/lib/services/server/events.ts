import { createClient } from '@/lib/supabase/server';
import type { EventWithVenue } from '@/lib/types';

/**
 * Server-side Events Service
 * Handles event data enrichment and processing on the server
 * Uses server Supabase client for API routes
 */
export class ServerEventsService {
  /**
   * Get image from a specific provider table
   * Checks poster_image_url first, then thumbnail_url as fallback
   * Uses get_event_image RPC function to access ticketing_platforms_raw_data schema
   */
  private static async getImageFromProvider(
    providerId: number | null,
    providerName: string
  ): Promise<string | null> {
    if (!providerId) return null;

    const supabase = await createClient();

    try {
      console.log(`[getImageFromProvider] Querying ${providerName}_events for ID: ${providerId} using RPC`);

      // Use RPC function to access ticketing_platforms_raw_data schema
      const { data, error } = await supabase.rpc('get_event_image', {
        p_schema_name: 'ticketing_platforms_raw_data',
        p_table_name: `${providerName}_events`,
        p_event_id: providerId
      });

      console.log(`[getImageFromProvider] RPC result for ${providerName}_events (ID: ${providerId}):`, {
        hasError: !!error,
        hasData: !!data,
        dataLength: data?.length,
        error: error,
        data: data
      });

      if (error) {
        console.error(`[getImageFromProvider] Error fetching from ${providerName}_events (ID: ${providerId}):`, {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      // RPC returns an array, get first result
      if (!data || data.length === 0) {
        console.log(`[getImageFromProvider] No data found in ${providerName}_events for ID: ${providerId}`);
        return null;
      }

      const row = data[0];

      // Prefer poster_image_url over thumbnail_url
      const imageUrl = row.poster_image_url || row.thumbnail_url || null;

      if (imageUrl) {
        console.log(`[getImageFromProvider] Found image in ${providerName}_events (ID: ${providerId}): ${imageUrl.substring(0, 80)}...`);
      } else {
        console.log(`[getImageFromProvider] Row found but no image URLs in ${providerName}_events (ID: ${providerId})`);
      }

      return imageUrl;
    } catch (error) {
      console.error(`Error fetching image from ${providerName}:`, error);
      return null;
    }
  }

  /**
   * Enrich event with image data from provider platforms
   * Implements provider hierarchy: biletinial → bubilet → bugece → biletix → passo
   * For each provider, prefers poster_image_url over thumbnail_url
   */
  static async enrichEventWithImage(event: EventWithVenue): Promise<EventWithVenue> {
    // Special logging for test event
    const isTestEvent = event.id === '1f725318-38f1-4515-a0b6-5bb4c058656a';

    if (isTestEvent) {
      console.log(`[TEST EVENT] Can Gox Konseri - Starting enrichment`);
      console.log(`[TEST EVENT] Provider IDs:`, {
        biletinial: event.biletinial_event_id,
        bubilet: event.bubilet_event_id,
        bugece: event.bugece_event_id,
        biletix: event.biletix_event_id,
        passo: event.passo_event_id
      });
    }

    try {
      // Provider hierarchy: biletinial → bubilet → bugece → biletix → passo
      const providers: Array<{ id: number | null; name: string }> = [
        { id: event.biletinial_event_id, name: 'biletinial' },
        { id: event.bubilet_event_id, name: 'bubilet' },
        { id: event.bugece_event_id, name: 'bugece' },
        { id: event.biletix_event_id, name: 'biletix' },
        { id: event.passo_event_id, name: 'passo' },
      ];

      // Check each provider in order until we find an image
      for (const provider of providers) {
        const imageUrl = await this.getImageFromProvider(provider.id, provider.name);

        if (isTestEvent) {
          console.log(`[TEST EVENT] Checked ${provider.name} (ID: ${provider.id}): ${imageUrl ? 'FOUND' : 'not found'}`);
        }

        if (imageUrl) {
          if (isTestEvent) {
            console.log(`[TEST EVENT] Using image from ${provider.name}: ${imageUrl}`);
          }
          return {
            ...event,
            image_url: imageUrl,
            featured_image: imageUrl
          };
        }
      }

      if (isTestEvent) {
        console.log(`[TEST EVENT] No image found from any provider`);
      }
    } catch (error) {
      console.error('Error enriching event with image:', error);
    }

    return event;
  }

  /**
   * Enrich multiple events with image data
   * Uses Promise.all for parallel processing
   */
  static async enrichEventsWithImages(events: EventWithVenue[]): Promise<EventWithVenue[]> {
    console.log(`[ServerEventsService] Starting enrichment for ${events.length} events`);

    // Log sample event BEFORE enrichment
    if (events.length > 0) {
      const sample = events[0];
      console.log(`[ServerEventsService] Sample event BEFORE enrichment:`, {
        id: sample.id,
        name: sample.name,
        biletinial_event_id: sample.biletinial_event_id,
        bubilet_event_id: sample.bubilet_event_id,
        bugece_event_id: sample.bugece_event_id,
        biletix_event_id: sample.biletix_event_id,
        passo_event_id: sample.passo_event_id,
        image_url: sample.image_url
      });
    }

    try {
      const enrichmentPromises = events.map(event =>
        this.enrichEventWithImage(event)
      );

      const enrichedEvents = await Promise.all(enrichmentPromises);

      // Log sample AFTER enrichment
      if (enrichedEvents.length > 0) {
        console.log(`[ServerEventsService] Sample event AFTER enrichment:`, {
          id: enrichedEvents[0].id,
          name: enrichedEvents[0].name,
          image_url: enrichedEvents[0].image_url
        });
      }

      const eventsWithImages = enrichedEvents.filter(e => e.image_url).length;
      console.log(`[ServerEventsService] Enrichment complete: ${eventsWithImages}/${enrichedEvents.length} events now have images`);

      return enrichedEvents;
    } catch (error) {
      console.error('Error enriching events with images:', error);
      // Return original events if enrichment fails
      return events;
    }
  }
}
