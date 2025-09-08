// Script to fix embeddings data format and content
// Run with: npx ts-node scripts/fix-embeddings.ts

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
const openaiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

interface EventWithVenue {
  id: string;
  name: string;
  date: string;
  genre: string | null;
  artist: string[] | null;
  description: string | null;
  venue: {
    name: string;
    city: string;
  };
}

interface ExistingEmbedding {
  id: string;
  event_id: string;
  embedding: string;
  content: string;
  created_at: string;
}

async function fixEmbeddings() {
  console.log('🔧 Starting embeddings fix process...\n');

  try {
    // 1. Get all existing embeddings with issues
    console.log('📋 Fetching existing embeddings...');
    const { data: existingEmbeddings, error: embeddingsError } = await supabase
      .from('unique_events_embeddings')
      .select('*')
      .order('created_at', { ascending: false });

    if (embeddingsError) {
      throw new Error(`Failed to fetch embeddings: ${embeddingsError.message}`);
    }

    console.log(`Found ${existingEmbeddings?.length || 0} existing embeddings\n`);

    if (!existingEmbeddings || existingEmbeddings.length === 0) {
      console.log('❌ No embeddings found to fix');
      return;
    }

    // 2. Get event details for content generation
    console.log('📝 Fetching event details...');
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
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    const events = eventsWithVenues?.filter(e => e.venue) as any[];
    console.log(`Found ${events?.length || 0} events with venue data\n`);

    // 3. Process each embedding
    let fixedCount = 0;
    let errorCount = 0;

    for (const embedding of existingEmbeddings) {
      try {
        const event = events.find(e => e.id === embedding.event_id);
        if (!event) {
          console.log(`⚠️  Event not found for embedding ${embedding.id}`);
          continue;
        }

        console.log(`🔧 Processing: ${event.name}`);

        // Generate proper content
        const content = generateEventContent(event);
        
        // Parse and validate embedding
        let embeddingArray: number[] | null = null;
        
        if (typeof embedding.embedding === 'string') {
          try {
            embeddingArray = JSON.parse(embedding.embedding);
            if (!Array.isArray(embeddingArray) || embeddingArray.length !== 384) {
              throw new Error('Invalid embedding format');
            }
          } catch (error) {
            console.log(`  ❌ Invalid embedding format, regenerating...`);
            // Regenerate embedding with proper content
            const embeddingResponse = await openai.embeddings.create({
              model: 'text-embedding-3-small',
              input: content,
            });
            embeddingArray = embeddingResponse.data[0].embedding;
          }
        }

        if (!embeddingArray) {
          console.log(`  ❌ Failed to get valid embedding`);
          errorCount++;
          continue;
        }

        // Update the embedding with fixed data
        const { error: updateError } = await supabase
          .from('unique_events_embeddings')
          .update({
            content: content,
            embedding: JSON.stringify(embeddingArray), // Store as JSON string
            updated_at: new Date().toISOString()
          })
          .eq('id', embedding.id);

        if (updateError) {
          console.log(`  ❌ Update failed: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`  ✅ Fixed successfully`);
          fixedCount++;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.log(`  ❌ Error processing embedding: ${error}`);
        errorCount++;
      }
    }

    console.log(`\n🎉 Fix process complete!`);
    console.log(`✅ Fixed: ${fixedCount} embeddings`);
    console.log(`❌ Errors: ${errorCount} embeddings`);

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

function generateEventContent(event: EventWithVenue): string {
  const parts = [];
  
  // Event name and basic info
  parts.push(`Event: ${event.name}`);
  
  // Date and time
  const eventDate = new Date(event.date);
  parts.push(`Date: ${eventDate.toLocaleDateString('tr-TR')} at ${eventDate.toLocaleTimeString('tr-TR')}`);
  
  // Venue and location
  parts.push(`Venue: ${event.venue.name} in ${event.venue.city}`);
  
  // Genre
  if (event.genre) {
    parts.push(`Genre: ${event.genre}`);
  }
  
  // Artists
  if (event.artist && event.artist.length > 0) {
    parts.push(`Artists: ${event.artist.join(', ')}`);
  }
  
  // Description
  if (event.description) {
    parts.push(`Description: ${event.description}`);
  }
  
  return parts.join('. ');
}

// Run the script
if (require.main === module) {
  fixEmbeddings().catch(console.error);
}

export { fixEmbeddings };