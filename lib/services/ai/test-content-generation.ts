/**
 * Content Generation Testing Utilities
 * For testing Turkish content generation without database dependencies
 */

import type { UniqueEvent, CanonicalVenue, TurkishCulturalContext } from '@/lib/types';
import { 
  generateTurkishEventContent, 
  generateEventTypeContent, 
  type EventContentContext 
} from './content-templates';
import { analyzeCulturalContext } from './cultural-context';

/**
 * Create sample event data for testing
 */
export function createSampleEvent(): UniqueEvent {
  return {
    id: 'test-event-123',
    name: 'Sezen Aksu Konseri',
    canonical_venue_id: 'test-venue-456',
    date: new Date('2025-09-15T20:00:00').toISOString(),
    genre: 'Music',
    promoter: ['Biletix Productions'],
    artist: ['Sezen Aksu'],
    description: 'Türk pop müziğinin efsanevi ismi Sezen Aksu ile unutulmaz bir gece',
    providers: ['Biletix', 'Bubilet'],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    biletinial_event_id: null,
    biletix_event_id: 12345,
    passo_event_id: null,
    bugece_event_id: null,
    bubilet_event_id: 67890,
    image_url: 'https://example.com/sezen-aksu.jpg',
    featured_image: null
  };
}

/**
 * Create sample venue data for testing
 */
export function createSampleVenue(): CanonicalVenue {
  return {
    id: 'test-venue-456',
    name: 'Zorlu Center PSM',
    city: 'Istanbul',
    capacity: 2200,
    coordinates: { lat: 41.0677, lng: 29.0149 },
    created_at: new Date().toISOString()
  };
}

/**
 * Test basic content generation
 */
export function testBasicContentGeneration(): {
  success: boolean;
  content?: string;
  error?: string;
} {
  try {
    const event = createSampleEvent();
    const venue = createSampleVenue();
    
    const contentContext: EventContentContext = {
      event,
      venue
    };
    
    const content = generateTurkishEventContent(contentContext);
    
    return {
      success: true,
      content
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Test content generation with cultural context
 */
export function testCulturalContentGeneration(): {
  success: boolean;
  content?: string;
  cultural_context?: TurkishCulturalContext;
  error?: string;
} {
  try {
    const event = createSampleEvent();
    const venue = createSampleVenue();
    
    // Analyze cultural context
    const cultural_context = analyzeCulturalContext(event, venue);
    
    const contentContext: EventContentContext = {
      event,
      venue,
      cultural_context
    };
    
    const content = generateEventTypeContent('music', contentContext);
    
    return {
      success: true,
      content,
      cultural_context
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Test multiple event types
 */
export function testMultipleEventTypes(): {
  success: boolean;
  results?: Array<{
    type: string;
    content: string;
  }>;
  error?: string;
} {
  try {
    const event = createSampleEvent();
    const venue = createSampleVenue();
    
    const cultural_context = analyzeCulturalContext(event, venue);
    const contentContext: EventContentContext = {
      event,
      venue,
      cultural_context
    };
    
    const eventTypes: Array<'music' | 'theater' | 'comedy' | 'sports' | 'exhibition'> = [
      'music', 'theater', 'comedy', 'sports', 'exhibition'
    ];
    
    const results = eventTypes.map(type => {
      // Modify event for each type
      const modifiedEvent = {
        ...event,
        name: type === 'music' ? 'Sezen Aksu Konseri' :
              type === 'theater' ? 'Hamlet Tiyatro Oyunu' :
              type === 'comedy' ? 'Ata Demirer Stand-Up' :
              type === 'sports' ? 'Galatasaray - Fenerbahçe Derbisi' :
              'Modern Sanat Sergisi',
        genre: type === 'music' ? 'Music' :
               type === 'theater' ? 'Theater' :
               type === 'comedy' ? 'Comedy' :
               type === 'sports' ? 'Sports' :
               'Exhibition'
      };
      
      const modifiedContext: EventContentContext = {
        ...contentContext,
        event: modifiedEvent
      };
      
      return {
        type,
        content: generateEventTypeContent(type, modifiedContext)
      };
    });
    
    return {
      success: true,
      results
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Run all tests and return comprehensive results
 */
export function runAllContentTests(): {
  success: boolean;
  basicTest: ReturnType<typeof testBasicContentGeneration>;
  culturalTest: ReturnType<typeof testCulturalContentGeneration>;
  multipleTypesTest: ReturnType<typeof testMultipleEventTypes>;
} {
  const basicTest = testBasicContentGeneration();
  const culturalTest = testCulturalContentGeneration();
  const multipleTypesTest = testMultipleEventTypes();
  
  const success = basicTest.success && culturalTest.success && multipleTypesTest.success;
  
  return {
    success,
    basicTest,
    culturalTest,
    multipleTypesTest
  };
}