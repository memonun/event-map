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
    const { limit = 10, threshold = 0.5 } = options;

    try {
      // Direct query to embeddings table
      const { data: embeddings, error } = await supabase
        .from('unique_events_embeddings')
        .select(`
          id,
          event_id,
          embedding,
          created_at
        `);

      if (error) {
        console.error('Embeddings table error:', error);
        console.warn('Embeddings table not accessible. Grant SELECT permission to unique_events_embeddings table.');
        return [];
      }

      if (!embeddings || embeddings.length === 0) {
        console.log('No embeddings found in database');
        return [];
      }

      // Calculate cosine similarity for each embedding
      const embeddingsWithSimilarity = embeddings.map(emb => ({
        ...emb,
        similarity: this.calculateCosineSimilarity(queryEmbedding, emb.embedding)
      }));

      // Filter by threshold and sort by similarity
      const filteredEmbeddings = embeddingsWithSimilarity
        .filter(emb => emb.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      if (filteredEmbeddings.length === 0) {
        console.log(`No embeddings above threshold ${threshold}`);
        return [];
      }

      // Get full event details
      const eventIds = filteredEmbeddings.map(emb => emb.event_id);
      
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
          const embeddingData = filteredEmbeddings.find(emb => emb.event_id === event.id);
          return {
            ...event,
            venue: event.venue!,
            similarity_score: embeddingData?.similarity || 0,
            matching_content: 'Vector embedding match'
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
   * Calculate cosine similarity between two vectors
   */
  private static calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
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