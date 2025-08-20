import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingsService } from '@/lib/services/client/embeddings';

export async function POST(request: NextRequest) {
  try {
    const { eventId, limit = 5, threshold = 0.7 } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Find similar events using the embeddings service
    const similarEvents = await EmbeddingsService.findSimilarToEvent(
      eventId,
      {
        limit: Number(limit),
        threshold: Number(threshold)
      }
    );

    return NextResponse.json({
      similarEvents,
      count: similarEvents.length,
      referenceEventId: eventId
    });

  } catch (error) {
    console.error('Similar Events API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to find similar events',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const limit = searchParams.get('limit') || '5';
  const threshold = searchParams.get('threshold') || '0.7';

  if (!eventId) {
    return NextResponse.json(
      { error: 'Event ID is required' },
      { status: 400 }
    );
  }

  try {
    const similarEvents = await EmbeddingsService.findSimilarToEvent(
      eventId,
      {
        limit: Number(limit),
        threshold: Number(threshold)
      }
    );

    return NextResponse.json({
      similarEvents,
      count: similarEvents.length,
      referenceEventId: eventId
    });

  } catch (error) {
    console.error('Similar Events API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to find similar events',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}