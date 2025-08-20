import { createClient } from '@/lib/supabase/client';
import type { 
  VectorSearchResult, 
  EventEmbedding,
  EventSearchParams 
} from '@/lib/types';

export class EmbeddingsService {
  /**
   * Search for similar events using vector similarity
   */
  static async searchSimilarEvents(
    queryEmbedding: number[],
    options: {
      limit?: number;
      threshold?: number;
      filters?: EventSearchParams;
    } = {}
  ): Promise<VectorSearchResult[]> {
    const supabase = createClient();
    const { limit = 10, threshold = 0.7 } = options;

    try {
      // First, get similar events using vector search
      // Note: This uses Supabase's pgvector extension for similarity search
      const { data: similarEvents, error } = await supabase.rpc('search_similar_events', {
        query_embedding: queryEmbedding,
        similarity_threshold: threshold,
        result_limit: limit
      });

      if (error) {
        console.error('Vector search error:', error);
        return [];
      }

      if (!similarEvents || similarEvents.length === 0) {
        return [];
      }

      // Get full event details for the similar events
      const eventIds = similarEvents.map((item: { event_id: string }) => item.event_id);
      
      const { data: eventsWithVenues, error: eventsError } = await supabase
        .from('unique_events')
        .select(`
          *,
          venue:canonical_venues (
            id,
            name,
            city,
            capacity,
            coordinates
          )
        `)
        .in('id', eventIds)
        .gte('date', new Date().toISOString()) // Only upcoming events
        .order('date', { ascending: true });

      if (eventsError) {
        console.error('Events fetch error:', eventsError);
        return [];
      }

      // Combine similarity scores with event data
      const results: VectorSearchResult[] = (eventsWithVenues || [])
        .filter(event => event.venue)
        .map(event => {
          const similarityData = similarEvents.find((item: { 
            event_id: string; 
            similarity: number; 
            content: string 
          }) => item.event_id === event.id);
          return {
            ...event,
            venue: event.venue!,
            similarity_score: similarityData?.similarity || 0,
            matching_content: similarityData?.content || ''
          };
        })
        .sort((a, b) => b.similarity_score - a.similarity_score);

      return results;
    } catch (error) {
      console.error('Error in searchSimilarEvents:', error);
      return [];
    }
  }

  /**
   * Get embeddings for a specific event
   */
  static async getEventEmbedding(eventId: string): Promise<EventEmbedding | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('unique_events_embeddings')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event embedding:', error);
      return null;
    }

    return data;
  }

  /**
   * Search for events similar to a specific event
   */
  static async findSimilarToEvent(
    eventId: string,
    options: {
      limit?: number;
      threshold?: number;
    } = {}
  ): Promise<VectorSearchResult[]> {
    // First get the embedding for the reference event
    const eventEmbedding = await this.getEventEmbedding(eventId);
    
    if (!eventEmbedding) {
      console.warn('No embedding found for event:', eventId);
      return [];
    }

    // Search for similar events using the embedding
    return this.searchSimilarEvents(eventEmbedding.embedding, {
      ...options,
      // Exclude the original event from results
      filters: { query: `NOT id.eq.${eventId}` }
    });
  }

  /**
   * Hybrid search combining vector similarity with metadata filters
   */
  static async hybridSearch(
    queryEmbedding: number[],
    filters: EventSearchParams,
    options: {
      limit?: number;
      vectorWeight?: number;
      metadataWeight?: number;
    } = {}
  ): Promise<VectorSearchResult[]> {
    const { limit = 20, vectorWeight = 0.7, metadataWeight = 0.3 } = options;

    // Get vector similarity results
    const vectorResults = await this.searchSimilarEvents(queryEmbedding, {
      limit: limit * 2, // Get more for filtering
      threshold: 0.5 // Lower threshold for hybrid approach
    });

    if (vectorResults.length === 0) {
      return [];
    }

    // Apply additional metadata filters
    let filteredResults = vectorResults;

    if (filters.genre) {
      filteredResults = filteredResults.filter(event => 
        event.genre?.toLowerCase().includes(filters.genre!.toLowerCase())
      );
    }

    if (filters.city) {
      filteredResults = filteredResults.filter(event => 
        event.venue.city?.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.date_from) {
      filteredResults = filteredResults.filter(event => 
        new Date(event.date) >= new Date(filters.date_from!)
      );
    }

    if (filters.date_to) {
      filteredResults = filteredResults.filter(event => 
        new Date(event.date) <= new Date(filters.date_to!)
      );
    }

    if (filters.platforms && filters.platforms.length > 0) {
      filteredResults = filteredResults.filter(event => 
        event.providers?.some(provider => 
          filters.platforms!.includes(provider)
        )
      );
    }

    // Re-score results based on hybrid approach
    const hybridResults = filteredResults.map(event => ({
      ...event,
      similarity_score: (event.similarity_score * vectorWeight) + 
                       (this.calculateMetadataScore(event, filters) * metadataWeight)
    }));

    // Sort by hybrid score and return top results
    return hybridResults
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit);
  }

  /**
   * Calculate metadata relevance score for hybrid search
   */
  private static calculateMetadataScore(event: VectorSearchResult, filters: EventSearchParams): number {
    let score = 0;
    let factors = 0;

    // Genre match
    if (filters.genre && event.genre) {
      score += event.genre.toLowerCase().includes(filters.genre.toLowerCase()) ? 1 : 0;
      factors++;
    }

    // City match
    if (filters.city && event.venue.city) {
      score += event.venue.city.toLowerCase().includes(filters.city.toLowerCase()) ? 1 : 0;
      factors++;
    }

    // Platform match
    if (filters.platforms && filters.platforms.length > 0 && event.providers) {
      const platformMatch = event.providers.some(provider => 
        filters.platforms!.includes(provider)
      );
      score += platformMatch ? 1 : 0;
      factors++;
    }

    // Date proximity (upcoming events get higher scores)
    const daysUntilEvent = Math.max(0, 
      (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilEvent <= 30) {
      score += Math.max(0, (30 - daysUntilEvent) / 30);
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Get all available embeddings (for testing/debugging)
   */
  static async getAllEmbeddings(limit: number = 50): Promise<EventEmbedding[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('unique_events_embeddings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching embeddings:', error);
      return [];
    }

    return data || [];
  }
}