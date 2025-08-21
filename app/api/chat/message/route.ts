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

    // Search for relevant events using embeddings table directly
    let relevantEvents: VectorSearchResult[] = [];
    
    try {
      relevantEvents = await EmbeddingsService.searchSimilarEvents(
        queryEmbedding,
        {
          limit: 8,
          threshold: 0.5
        }
      );
      console.log('Found', relevantEvents.length, 'relevant events from embeddings');
    } catch (error) {
      console.error('Embeddings search failed:', error);
      relevantEvents = [];
    }

    // Get current date for context
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Prepare context for the LLM with strict constraints
    const systemPrompt = `You are an Event Discovery Assistant for Turkey's largest event platform. You have access to REAL-TIME event data from 5 major ticketing platforms (Bubilet, Biletix, Biletinial, Passo, Bugece).

🚨 CRITICAL CONSTRAINTS:
- You can ONLY recommend events from the PROVIDED EVENT LIST below
- DO NOT use any knowledge from your training data about events, artists, or venues
- DO NOT make up or assume any event information
- Your knowledge cutoff is irrelevant - only use the current database results
- If no matching events are provided, acknowledge this and suggest broader search terms

📊 TODAY'S DATE: ${currentDate}

🎫 AVAILABLE EVENTS (Vector Search Results - Similarity Ranked):
${relevantEvents.length > 0 ? relevantEvents.map((event, index) => `
${index + 1}. **${event.name}**
   📅 ${new Date(event.date).toLocaleDateString('tr-TR', { 
     weekday: 'long', 
     year: 'numeric', 
     month: 'long', 
     day: 'numeric',
     hour: '2-digit',
     minute: '2-digit'
   })}
   📍 ${event.venue.name}, ${event.venue.city}
   🎭 Genre: ${event.genre || 'Various'}
   🎤 Artists: ${event.artist?.join(', ') || 'Multiple artists'}
   🎟️ Available on: ${event.providers?.join(', ') || 'Multiple platforms'}
   🎯 Match Score: ${(event.similarity_score * 100).toFixed(1)}%
   🆔 Event ID: ${event.id}`).join('\n') : '❌ No events found matching your query. The embeddings database may not be accessible.'}

📋 RESPONSE RULES:
- Always reference events by name from the list above
- Include specific dates, venues, and ticket platform information
- For Turkish users, respond in Turkish when appropriate
- Ask clarifying questions to improve search results
- If list is empty, inform user that semantic search is unavailable
- Suggest they try again later or contact support if problem persists
- Never mention events not in the provided list
- Always include Event ID when recommending specific events`;

    // Build conversation context
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    // Generate response using OpenAI with strict parameters
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 600,
      temperature: 0.4, // Lower temperature for more focused responses
      presence_penalty: 0.3, // Encourage staying on topic
      frequency_penalty: 0.1
    });

    let assistantResponse = completion.choices[0]?.message?.content || 
      'I apologize, but I couldn\'t generate a response. Please try again.';

    // Validate response doesn't reference external knowledge
    if (relevantEvents.length === 0 && !assistantResponse.includes('no events found') && !assistantResponse.includes('broader search')) {
      assistantResponse = `I couldn't find any events matching your query in our current database. Try using broader search terms like 'concert', 'theater', or specific city names like 'İstanbul' or 'Ankara' to discover available events.`;
    }

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