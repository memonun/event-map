import { createClient } from '@/lib/supabase/client';
import type { 
  VectorSearchResult, 
  EventEmbedding,
  EventSearchParams 
} from '@/lib/types';

/**
 * DEPRECATED: This service is being replaced with new architecture
 * See AI_CHATBOT_ARCHITECTURE.md for new implementation
 * Keeping minimal functionality during transition
 */
export class EmbeddingsService {
  /**
   * Search for similar events using vector similarity
   * DEPRECATED: Returns empty results during transition
   */
  static async searchSimilarEvents(
    queryEmbedding: number[],
    options: {
      limit?: number;
      threshold?: number;
      filters?: EventSearchParams;
    } = {}
  ): Promise<VectorSearchResult[]> {
    console.warn('EmbeddingsService.searchSimilarEvents is deprecated. New architecture being implemented.');
    console.log('See AI_CHATBOT_ARCHITECTURE.md for details on new system.');
    return [];
  }

  /**
   * Get embeddings for a specific event
   * DEPRECATED: Returns null during transition
   */
  static async getEventEmbedding(eventId: string): Promise<EventEmbedding | null> {
    console.warn('EmbeddingsService.getEventEmbedding is deprecated. New architecture being implemented.');
    return null;
  }

  /**
   * Search for events similar to a specific event
   * DEPRECATED: Returns empty results during transition
   */
  static async findSimilarToEvent(
    eventId: string,
    options: {
      limit?: number;
      threshold?: number;
    } = {}
  ): Promise<VectorSearchResult[]> {
    console.warn('EmbeddingsService.findSimilarToEvent is deprecated. New architecture being implemented.');
    return [];
  }

  /**
   * Hybrid search combining vector similarity with metadata filters
   * DEPRECATED: Returns empty results during transition
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
    console.warn('EmbeddingsService.hybridSearch is deprecated. New architecture being implemented.');
    return [];
  }

  /**
   * Get all available embeddings (for testing/debugging)
   * DEPRECATED: Returns empty array during transition
   */
  static async getAllEmbeddings(limit: number = 50): Promise<EventEmbedding[]> {
    console.warn('EmbeddingsService.getAllEmbeddings is deprecated. New architecture being implemented.');
    return [];
  }
}