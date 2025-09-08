# AI Chatbot Architecture - Complete Foundation

## Executive Summary

This document establishes the complete architectural foundation for transforming our Turkish events platform into an intelligent, culturally-aware AI chatbot system. The architecture combines proven technical patterns from the Supabase community with user-centric semantic search optimized for Turkish culture and language.

## Core Architecture Principles

### 1. Cultural Intelligence First
- **Turkish Primary**: All content generation optimized for Turkish cultural context
- **Natural Language**: Users search with "bu akşam", "hafta sonu", not timestamps
- **Cultural Context**: Transport patterns, prayer times, social customs integrated
- **Atmospheric Understanding**: "samimi mekan", "açık hava", "canlı atmosfer"

### 2. Narrative Over Data
- **Event Stories**: Each event becomes a compelling narrative, not data dumps
- **Dating Profile Approach**: Include everything someone might be attracted to
- **Qualitative Descriptions**: "uygun fiyat", "premium deneyim" instead of exact prices
- **Experiential Focus**: Indoor/outdoor, formal/casual, energetic/relaxed

### 3. Trigger-Based Automation
- **Zero Manual Intervention**: Everything happens automatically via database triggers
- **Edge Function Processing**: Scalable, serverless content generation
- **Real-time Updates**: Events become searchable immediately upon creation
- **Consistent Quality**: Standardized templates ensure uniform content

## Technical Architecture

### Database Schema

```sql
-- Drop existing broken table
DROP TABLE IF EXISTS unique_events_embeddings;

-- Create new knowledge sections table (inspired by ChatGPT Files)
CREATE TABLE event_knowledge_sections (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_id UUID NOT NULL REFERENCES unique_events(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- text-embedding-3-small full dimensions
  metadata JSONB DEFAULT '{
    "language": "tr",
    "content_version": "1.0",
    "cultural_context": true
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_knowledge_event_id ON event_knowledge_sections(event_id);
CREATE INDEX idx_knowledge_embedding ON event_knowledge_sections 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS for future user preferences
ALTER TABLE event_knowledge_sections ENABLE ROW LEVEL SECURITY;

-- Public access policy (will add user-specific policies later)
CREATE POLICY "Public read access" ON event_knowledge_sections
  FOR SELECT USING (true);
```

### Content Generation Strategy

#### Turkish Narrative Template
```typescript
interface EventContentTemplate {
  // Core event information in Turkish natural language
  eventDescription: string;    // "Buray konseri - pop müzik"
  temporalContext: string;     // "Cumartesi akşamı", "hafta sonu"
  venueAtmosphere: string;     // "samimi ortam", "açık hava sahne"
  culturalContext: string;     // Transport, timing, social context
  experienceDescriptor: string; // "romantik akşam", "enerji dolu gece"
  pricePosition: string;       // "uygun fiyat", "orta segment", "premium"
}

const generateTurkishEventContent = (event, venue, pricing, cultural) => {
  const template = `
${event.name} - ${event.genre} müzik etkinliği ${venue.city}'da ${venue.name} mekanında gerçekleşecek.
Tarih: ${formatTurkishDate(event.date)} ${formatTurkishTime(event.date)}
Sanatçılar: ${event.artists?.join(', ') || 'Çeşitli sanatçılar'}

Mekan Özellikleri:
- ${venue.name} ${venue.city} şehrinin ${getDistrictInfo(venue)} bölgesinde yer alıyor
- ${venue.capacity} kişi kapasiteli ${getVenueType(venue)} mekan
- ${getAtmosphereDescription(venue, event.genre)} atmosfer
- ${getTransportInfo(venue)} ulaşım imkanları

Etkinlik Deneyimi:
- ${getExperienceType(event.genre)} tarzında bir gece
- ${getAudienceProfile(event.genre)} için ideal
- ${getSocialContext(event.date, venue)} ortam
- ${getTimingAdvice(event.date)} zamanlaması

Bilet Bilgileri:
- Fiyat aralığı ${formatPriceRange(pricing)} seviyesinde
- ${getPlatformInfo(event.providers)} platformlarında satışta
- ${getAvailabilityInfo(pricing)} durumu
- ${getBestValueAdvice(pricing)} önerisi

Kültürel Notlar:
- ${getCulturalTiming(event.date)} döneminde gerçekleşen etkinlik
- ${getSeasonalContext(event.date)} mevsim özelliklerine uygun
- ${getTransportAdvice(venue, event.date)} ulaşım tavsiyesi
- ${getSocialTips(event.genre, venue)} sosyal ipuçları
  `.trim();
  
  return template;
};
```

#### Supporting Functions

```typescript
// Turkish temporal language processing
const formatTurkishDate = (date: Date) => {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  // Add contextual temporal markers
  const today = new Date();
  const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Bu akşam';
  if (diffDays === 1) return 'Yarın akşam';
  if (diffDays <= 7) return `Bu ${dayName}`;
  if (diffDays <= 14) return `Gelecek ${dayName}`;
  
  return `${day} ${month} ${dayName}`;
};

// Cultural context integration
const getCulturalTiming = (date: Date) => {
  const month = date.getMonth();
  const day = date.getDay();
  const hour = date.getHours();
  
  // Ramadan considerations
  if (isRamadanPeriod(date)) {
    return 'Ramazan ayı süresince';
  }
  
  // Weekend patterns
  if (day === 5 || day === 6) { // Friday or Saturday
    return 'Hafta sonu eğlencesi';
  }
  
  // Evening timing
  if (hour >= 18 && hour <= 23) {
    return 'Akşam saatleri';
  }
  
  return 'Gündüz etkinliği';
};

// Atmosphere descriptions
const getAtmosphereDescription = (venue: Venue, genre: string) => {
  const atmosphereMap = {
    'rock': 'enerji dolu ve coşkulu',
    'jazz': 'samimi ve sofistike', 
    'pop': 'eğlenceli ve dinamik',
    'classical': 'sakin ve zarif',
    'electronic': 'modern ve enerjik',
    'folk': 'sıcak ve nostaljik'
  };
  
  const venueAtmosphere = venue.capacity > 1000 ? 'büyük sahne' : 'yakın ve samimi';
  const genreAtmosphere = atmosphereMap[genre.toLowerCase()] || 'özgün';
  
  return `${genreAtmosphere} ${venueAtmosphere}`;
};

// Transport context for Turkish cities
const getTransportInfo = (venue: Venue) => {
  if (venue.city === 'İstanbul') {
    return 'Metro, metrobüs ve otobüs bağlantıları mevcut';
  }
  if (venue.city === 'Ankara') {
    return 'Metro ve otobüs ulaşımı kolay';
  }
  if (venue.city === 'İzmir') {
    return 'Metro ve otobüs bağlantılı';
  }
  return 'Şehir merkezi ulaşım ağında';
};
```

### Edge Functions Architecture

#### Content Generation Edge Function
```typescript
// supabase/functions/generate-event-content/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { eventIds, table, contentColumn, embeddingColumn } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    for (const eventId of eventIds) {
      // Fetch comprehensive event data
      const { data: eventData } = await supabase
        .from('unique_events')
        .select(`
          *,
          venue:canonical_venues(*),
          pricing:biletix_prices(*),
          platform_data:bubilet_prices(*)
        `)
        .eq('id', eventId)
        .single();

      if (!eventData) continue;

      // Generate Turkish narrative content
      const content = await generateTurkishEventContent(
        eventData,
        eventData.venue,
        [...(eventData.pricing || []), ...(eventData.platform_data || [])],
        await getCulturalContext(eventData)
      );

      // Generate embedding using OpenAI
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: content,
          dimensions: 1536
        }),
      });

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // Update database with content and embedding
      await supabase
        .from(table)
        .update({
          [contentColumn]: content,
          [embeddingColumn]: JSON.stringify(embedding),
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Vector Search Functions

```sql
-- Modern vector search function optimized for Turkish queries
CREATE OR REPLACE FUNCTION search_turkish_events(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.6,
  match_count INT DEFAULT 10,
  language_preference TEXT DEFAULT 'tr'
)
RETURNS TABLE (
  event_id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    ek.event_id,
    ek.content,
    1 - (ek.embedding <=> query_embedding) AS similarity,
    ek.metadata
  FROM event_knowledge_sections ek
  WHERE 
    (ek.metadata->>'language' = language_preference OR language_preference IS NULL)
    AND 1 - (ek.embedding <=> query_embedding) > match_threshold
  ORDER BY ek.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Query intent detection for different search types
CREATE OR REPLACE FUNCTION detect_query_intent(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  intent JSONB := '{}';
BEGIN
  -- Temporal intent detection
  IF query_text ~* 'bu akşam|tonight|this evening' THEN
    intent := jsonb_set(intent, '{temporal}', '"today_evening"');
  ELSIF query_text ~* 'yarın|tomorrow' THEN
    intent := jsonb_set(intent, '{temporal}', '"tomorrow"');
  ELSIF query_text ~* 'hafta sonu|weekend' THEN
    intent := jsonb_set(intent, '{temporal}', '"weekend"');
  END IF;

  -- Price sensitivity detection  
  IF query_text ~* 'ucuz|cheap|budget|uygun fiyat' THEN
    intent := jsonb_set(intent, '{price_sensitivity}', '"budget"');
  ELSIF query_text ~* 'premium|pahalı|expensive|lüks' THEN
    intent := jsonb_set(intent, '{price_sensitivity}', '"premium"');
  END IF;

  -- Social context detection
  IF query_text ~* 'romantik|romantic|date|randevu' THEN
    intent := jsonb_set(intent, '{social_context}', '"romantic"');
  ELSIF query_text ~* 'aile|family|çocuk' THEN
    intent := jsonb_set(intent, '{social_context}', '"family"');
  ELSIF query_text ~* 'arkadaş|friends|grup' THEN
    intent := jsonb_set(intent, '{social_context}', '"friends"');
  END IF;

  RETURN intent;
END;
$$;
```

## Migration Strategy

### Phase 1: Preparation (Day 1-2)
1. **Backup Current Data**: Archive existing embeddings for rollback
2. **Branch Creation**: Create `feature/ai-chatbot-redesign` branch
3. **Environment Setup**: Prepare Edge Functions development environment
4. **Testing Framework**: Set up comprehensive testing suite

### Phase 2: Database Migration (Day 3-4)
1. **Schema Creation**: Deploy new `event_knowledge_sections` table
2. **Function Deployment**: Install vector search and intent detection functions
3. **Trigger Setup**: Enable automatic content generation triggers
4. **Cleanup**: Remove old embeddings table and broken components

### Phase 3: Content System (Day 5-7)
1. **Template Deployment**: Implement Turkish narrative templates
2. **Cultural Context**: Add cultural timing and atmosphere functions
3. **Edge Function**: Deploy content generation Edge Function
4. **Batch Processing**: Process existing 5,240+ events

### Phase 4: Search Integration (Week 2)
1. **Search Service**: Update to use PostgreSQL vector functions
2. **Intent Detection**: Implement query understanding system
3. **Response Generation**: Build context-aware response system
4. **UI Integration**: Connect with existing chat components

## Quality Assurance

### Automated Testing
- **Unit Tests**: All content generation functions
- **Integration Tests**: End-to-end chat functionality
- **Performance Tests**: Response time and throughput
- **Cultural Tests**: Turkish language and context accuracy

### Manual Validation
- **Content Quality**: Review generated narratives for accuracy
- **Cultural Appropriateness**: Validate Turkish cultural context
- **Search Relevance**: Test with real Turkish user queries
- **Response Quality**: Ensure helpful, contextual responses

### Performance Metrics
- **Response Time**: <2 seconds for chat queries
- **Content Generation**: All events processed within 24 hours
- **Cost Efficiency**: <$50/month OpenAI API usage
- **Search Accuracy**: >85% relevant results for Turkish queries

## Future Roadmap

### Phase 2: User Personalization (Month 2)
- User preference tracking
- Favorite artists, venues, genres
- Personalized recommendation algorithms
- RLS policies for user-specific data

### Phase 3: B2B Analytics (Month 3-4)
- Market analysis capabilities  
- Trend detection and reporting
- Venue and artist performance metrics
- Pricing strategy recommendations

### Phase 4: Advanced Features (Month 5-6)
- Voice query support
- Image recognition for event posters
- Social media integration
- Real-time availability tracking

## Success Metrics

### Technical Success
- ✅ Zero "undefined" responses
- ✅ All events searchable in Turkish
- ✅ <2 second response time
- ✅ 99%+ uptime
- ✅ Scalable to 10,000+ events

### User Experience Success  
- ✅ Natural Turkish language queries work
- ✅ Cultural context integrated (transport, timing, atmosphere)
- ✅ Intent understanding ("romantik akşam", "bütçe dostu")
- ✅ Helpful, contextual responses
- ✅ No technical jargon or errors

### Business Success
- ✅ Foundation for B2B analytics
- ✅ Competitive advantage in Turkish market
- ✅ User engagement improvement
- ✅ Cost-effective scaling model
- ✅ Cultural market intelligence capabilities

---

This architecture document serves as the complete foundation for our AI chatbot transformation. Every technical decision, cultural consideration, and implementation detail has been carefully planned to create a world-class, Turkish-optimized event discovery system.