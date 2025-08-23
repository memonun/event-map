import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(_request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient();
    
    console.log('🔧 Starting embeddings fix process...');

    // 1. Get first 5 broken embeddings for testing
    const { data: existingEmbeddings, error: embeddingsError } = await supabase
      .from('unique_events_embeddings')
      .select('*')
      .limit(5);

    if (embeddingsError) {
      return NextResponse.json(
        { error: `Failed to fetch embeddings: ${embeddingsError.message}` },
        { status: 500 }
      );
    }

    if (!existingEmbeddings || existingEmbeddings.length === 0) {
      return NextResponse.json({
        message: 'No embeddings found to fix',
        fixed: 0,
        errors: 0
      });
    }

    // 2. Get event details
    const eventIds = existingEmbeddings.map(e => e.event_id);
    
    const { data: eventsWithVenues, error: eventsError } = await supabase
      .from('unique_events')
      .select(`
        id,
        name,
        date,
        genre,
        artist,
        description,
        venue:canonical_venues (
          name,
          city
        )
      `)
      .in('id', eventIds);

    if (eventsError) {
      return NextResponse.json(
        { error: `Failed to fetch events: ${eventsError.message}` },
        { status: 500 }
      );
    }

    const events = eventsWithVenues?.filter(e => e.venue) || [];
    
    // 3. Fix embeddings
    let fixedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const embedding of existingEmbeddings) {
      try {
        const event = events.find((e) => e.id === embedding.event_id);
        if (!event) {
          results.push({ id: embedding.id, status: 'error', reason: 'Event not found' });
          errorCount++;
          continue;
        }

        // Generate proper content
        const content = generateEventContent({
          ...event,
          venue: Array.isArray(event.venue) ? event.venue[0] : event.venue
        });
        
        // Parse existing embedding or regenerate
        let embeddingArray: number[] | null = null;
        
        if (typeof embedding.embedding === 'string') {
          try {
            embeddingArray = JSON.parse(embedding.embedding);
            if (!Array.isArray(embeddingArray) || embeddingArray.length !== 384) {
              throw new Error('Invalid embedding format');
            }
          } catch (_error) {
            // Regenerate embedding
            const embeddingResponse = await openai.embeddings.create({
              model: 'text-embedding-3-small',
              input: content,
            });
            embeddingArray = embeddingResponse.data[0].embedding;
          }
        }

        if (!embeddingArray) {
          results.push({ id: embedding.id, status: 'error', reason: 'Failed to get valid embedding' });
          errorCount++;
          continue;
        }

        // Update the embedding
        const { error: updateError } = await supabase
          .from('unique_events_embeddings')
          .update({
            content: content,
            embedding: JSON.stringify(embeddingArray),
            updated_at: new Date().toISOString()
          })
          .eq('id', embedding.id);

        if (updateError) {
          results.push({ id: embedding.id, status: 'error', reason: updateError.message });
          errorCount++;
        } else {
          results.push({ 
            id: embedding.id, 
            status: 'fixed', 
            eventName: event.name,
            contentLength: content.length,
            embeddingDimensions: embeddingArray.length
          });
          fixedCount++;
        }

      } catch (error) {
        results.push({ id: embedding.id, status: 'error', reason: (error as Error).message });
        errorCount++;
      }
    }

    return NextResponse.json({
      message: `Fix process complete`,
      fixed: fixedCount,
      errors: errorCount,
      total: existingEmbeddings.length,
      results
    });

  } catch (error) {
    console.error('Fix embeddings API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fix embeddings',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

function generateEventContent(event: { name: string; date: string; venue: { name: string; city: string }; genre?: string; artist?: string[]; description?: string }): string {
  const parts = [];
  
  parts.push(`Event: ${event.name}`);
  
  const eventDate = new Date(event.date);
  parts.push(`Date: ${eventDate.toLocaleDateString('tr-TR')} at ${eventDate.toLocaleTimeString('tr-TR')}`);
  
  parts.push(`Venue: ${event.venue.name} in ${event.venue.city}`);
  
  if (event.genre) {
    parts.push(`Genre: ${event.genre}`);
  }
  
  if (event.artist && event.artist.length > 0) {
    parts.push(`Artists: ${event.artist.join(', ')}`);
  }
  
  if (event.description) {
    parts.push(`Description: ${event.description}`);
  }
  
  return parts.join('. ');
}