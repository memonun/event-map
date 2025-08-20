import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { EmbeddingsService } from '@/lib/services/client/embeddings';
import type { ChatMessage, VectorSearchResult } from '@/lib/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          message: 'AI functionality is currently unavailable. Please check configuration.',
          eventRecommendations: []
        },
        { status: 200 }
      );
    }

    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate embedding for the user's message
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small', // 384 dimensions to match your database
      input: message,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search for relevant events using vector similarity
    const relevantEvents = await EmbeddingsService.searchSimilarEvents(
      queryEmbedding,
      {
        limit: 5,
        threshold: 0.6
      }
    );

    // Prepare context for the LLM
    const systemPrompt = `You are an AI assistant for an Event Map platform in Turkey. You help users discover events, concerts, shows, and activities.

CURRENT CONTEXT:
- You have access to event data from 5 major Turkish ticketing platforms
- Events include concerts, theater, stand-up comedy, sports, exhibitions
- You can recommend events based on user preferences, location, date, and genre
- Always respond in a helpful, friendly tone
- If recommending events, provide specific details like date, venue, and genre
- For Turkish users, you can respond in Turkish when appropriate

AVAILABLE EVENTS (based on similarity to user query):
${relevantEvents.map(event => `
- ${event.name}
  Date: ${new Date(event.date).toLocaleDateString('tr-TR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
  Venue: ${event.venue.name}, ${event.venue.city}
  Genre: ${event.genre || 'Various'}
  Artists: ${event.artist?.join(', ') || 'See event details'}
  Platforms: ${event.providers?.join(', ') || 'Multiple platforms'}
  Similarity: ${(event.similarity_score * 100).toFixed(1)}%
`).join('\n')}

GUIDELINES:
- If no relevant events are found, suggest alternative search criteria or popular upcoming events
- Always include practical information (dates, venues, how to get tickets)
- Be conversational and helpful, not robotic
- Ask follow-up questions to better understand user preferences
- For location-based queries, consider travel distance and accessibility`;

    // Build conversation context
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const assistantResponse = completion.choices[0]?.message?.content || 
      'I apologize, but I couldn\'t generate a response. Please try again.';

    // Create response with event recommendations
    const response: {
      message: string;
      eventRecommendations?: VectorSearchResult[];
      conversationId?: string;
    } = {
      message: assistantResponse,
    };

    // Include event recommendations if found
    if (relevantEvents.length > 0) {
      response.eventRecommendations = relevantEvents;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Return a user-friendly error message
    return NextResponse.json(
      { 
        error: 'Sorry, I encountered an issue processing your request. Please try again.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}