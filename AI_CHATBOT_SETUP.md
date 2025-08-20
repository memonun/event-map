# 🤖 AI Chatbot Setup Guide

## Prerequisites

1. **Supabase Database** with pgvector extension enabled
2. **OpenAI API Key** for embeddings and chat completions
3. **Event embeddings** populated in `unique_events_embeddings` table

## Setup Steps

### 1. Install Dependencies
The OpenAI dependency has been installed automatically:
```bash
npm install openai
```

### 2. Environment Variables
Add your OpenAI API key to `.env.local`:
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Database Setup
Run the vector search SQL migration in your Supabase SQL editor:
```bash
# File: supabase/migrations/create_vector_search_functions.sql
# This creates the pgvector functions and indexes
```

### 4. Verify Setup
1. Start the development server: `npm run dev`
2. Navigate to `/debug/chatbot` (create this page if testing)
3. Use the test component to verify embeddings and API

## Current Implementation Status

### ✅ Completed Features
- **Vector Search Service**: Similarity search with 384-dimensional embeddings
- **Chat API Routes**: OpenAI integration with Turkish/English support
- **UI Components**: Floating chatbot button and full conversation modal
- **Event Integration**: Rich event cards with images and booking links
- **Hybrid Search**: Combines semantic similarity with metadata filtering

### 🎯 Available Endpoints
- `POST /api/chat/message` - Main chat conversation
- `POST /api/chat/embed` - Generate embeddings
- `GET/POST /api/chat/similar-events` - Find similar events

### 🎨 UI Components
- `FloatingChatbot` - Toggle button (bottom-right corner)
- `ChatModal` - Full conversation interface
- `EventRecommendationCard` - AI-recommended events

## Usage

### Basic Chat
```typescript
// Send a message to the AI
const response = await fetch('/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'İstanbul\'da bu hafta sonu hangi konserler var?',
    conversationHistory: []
  })
});
```

### Vector Search
```typescript
import { EmbeddingsService } from '@/lib/services/client/embeddings';

// Search for similar events
const results = await EmbeddingsService.searchSimilarEvents(
  embedding, // 384-dimensional array
  { limit: 10, threshold: 0.7 }
);
```

## Sample Conversations

**Turkish:**
- "Bu hafta sonu İstanbul'da hangi etkinlikler var?"
- "Rock konserleri öner bana"
- "Kadıköy'de cuma akşamı ne var?"

**English:**
- "What concerts are happening this weekend?"
- "Show me indie music events"
- "Find events similar to [event name]"

## Performance Notes

- **Vector Search**: Optimized with ivfflat index for fast similarity search
- **Caching**: Conversation context maintained in memory
- **Rate Limiting**: Consider implementing for production use
- **Streaming**: Can be enhanced with streaming responses

## Troubleshooting

### Common Issues

1. **"No embeddings found"**
   - Ensure `unique_events_embeddings` table is populated
   - Check SQL migration has been run

2. **"API key error"**
   - Verify `OPENAI_API_KEY` is set correctly
   - Check API key has sufficient credits

3. **"Chat not appearing"**
   - Chatbot only shows if `OPENAI_API_KEY` is present
   - Check browser console for errors

### Debug Tools
Use `components/debug/chatbot-test.tsx` to verify:
- Embeddings table access
- Vector search functionality  
- Chat API connectivity

## Scaling for Production

### Current Limitations (20 events)
- Limited event coverage for recommendations
- Simple conversation memory (last 5 messages)
- Basic error handling

### Production Enhancements
- Full event catalog embeddings (5,240+ events)
- Persistent conversation storage
- User preference learning
- Multi-language support enhancement
- Voice input integration
- Advanced context awareness

## Architecture Overview

```
┌─ UI Layer ─────────────────────┐
│  FloatingChatbot               │
│  ChatModal                     │
│  EventRecommendationCard       │
└────────────────────────────────┘
           │
┌─ API Layer ────────────────────┐
│  /api/chat/message             │
│  /api/chat/embed               │
│  /api/chat/similar-events      │
└────────────────────────────────┘
           │
┌─ Service Layer ────────────────┐
│  EmbeddingsService             │
│  OpenAI API                    │
└────────────────────────────────┘
           │
┌─ Database Layer ───────────────┐
│  unique_events_embeddings      │
│  pgvector functions            │
└────────────────────────────────┘
```

Your AI chatbot is ready to help users discover events through natural conversation! 🎉