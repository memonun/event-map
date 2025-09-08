-- AI Chatbot Knowledge Base Migration
-- Creates new architecture for Turkish event discovery
-- Based on ChatGPT Files pattern with Turkish cultural optimization

-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Create private schema for internal functions (following ChatGPT Files pattern)
CREATE SCHEMA IF NOT EXISTS private;

-- Drop old broken embeddings table
DROP TABLE IF EXISTS unique_events_embeddings;

-- Create new event knowledge sections table
CREATE TABLE event_knowledge_sections (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_id UUID NOT NULL REFERENCES unique_events(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
  metadata JSONB DEFAULT '{
    "language": "tr",
    "content_version": "1.0", 
    "cultural_context": true,
    "generated_at": null,
    "template_version": "1.0"
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_knowledge_event_id ON event_knowledge_sections(event_id);
CREATE INDEX idx_knowledge_created_at ON event_knowledge_sections(created_at);
CREATE INDEX idx_knowledge_language ON event_knowledge_sections((metadata->>'language'));

-- Vector similarity index (ivfflat for cosine distance)
CREATE INDEX idx_knowledge_embedding ON event_knowledge_sections 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Enable Row Level Security for future user personalization
ALTER TABLE event_knowledge_sections ENABLE ROW LEVEL SECURITY;

-- Public read access policy (will add user-specific policies later)
CREATE POLICY "Public read access" ON event_knowledge_sections
  FOR SELECT USING (true);

-- Turkish-optimized vector search function
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
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    ek.event_id,
    ek.content,
    1 - (ek.embedding <=> query_embedding) AS similarity,
    ek.metadata,
    ek.created_at
  FROM event_knowledge_sections ek
  WHERE 
    (ek.metadata->>'language' = language_preference OR language_preference IS NULL)
    AND 1 - (ek.embedding <=> query_embedding) > match_threshold
  ORDER BY ek.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Query intent detection for Turkish cultural context
CREATE OR REPLACE FUNCTION detect_turkish_query_intent(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  intent JSONB := '{}';
BEGIN
  -- Temporal intent detection (Turkish patterns)
  IF query_text ~* 'bu akşam|tonight|this evening' THEN
    intent := jsonb_set(intent, '{temporal}', '"today_evening"');
  ELSIF query_text ~* 'yarın|tomorrow|yarın akşam' THEN
    intent := jsonb_set(intent, '{temporal}', '"tomorrow"');
  ELSIF query_text ~* 'hafta sonu|weekend|cumartesi|pazar' THEN
    intent := jsonb_set(intent, '{temporal}', '"weekend"');
  ELSIF query_text ~* 'bu hafta|this week' THEN
    intent := jsonb_set(intent, '{temporal}', '"this_week"');
  ELSIF query_text ~* 'bayram|tatil|holiday' THEN
    intent := jsonb_set(intent, '{temporal}', '"holiday"');
  END IF;

  -- Price sensitivity detection (Turkish patterns)
  IF query_text ~* 'ucuz|cheap|budget|uygun fiyat|ekonomik|hesaplı' THEN
    intent := jsonb_set(intent, '{price_sensitivity}', '"budget"');
  ELSIF query_text ~* 'premium|pahalı|expensive|lüks|kaliteli' THEN
    intent := jsonb_set(intent, '{price_sensitivity}', '"premium"');
  ELSIF query_text ~* 'ücretsiz|free|bedava' THEN
    intent := jsonb_set(intent, '{price_sensitivity}', '"free"');
  END IF;

  -- Social context detection (Turkish patterns)
  IF query_text ~* 'romantik|romantic|date|randevu|sevgili' THEN
    intent := jsonb_set(intent, '{social_context}', '"romantic"');
  ELSIF query_text ~* 'aile|family|çocuk|bebek|kids' THEN
    intent := jsonb_set(intent, '{social_context}', '"family"');
  ELSIF query_text ~* 'arkadaş|friends|grup|ekip|beraber' THEN
    intent := jsonb_set(intent, '{social_context}', '"friends"');
  ELSIF query_text ~* 'tek başına|alone|solo|bireysel' THEN
    intent := jsonb_set(intent, '{social_context}', '"solo"');
  END IF;

  -- Atmosphere/mood detection (Turkish patterns)
  IF query_text ~* 'sakin|calm|huzurlu|sessiz|quiet' THEN
    intent := jsonb_set(intent, '{atmosphere}', '"calm"');
  ELSIF query_text ~* 'eğlenceli|fun|neşeli|canlı|energetic' THEN
    intent := jsonb_set(intent, '{atmosphere}', '"energetic"');
  ELSIF query_text ~* 'samimi|intimate|yakın|sıcak' THEN
    intent := jsonb_set(intent, '{atmosphere}', '"intimate"');
  ELSIF query_text ~* 'açık hava|outdoor|dış mekan|bahçe' THEN
    intent := jsonb_set(intent, '{atmosphere}', '"outdoor"');
  END IF;

  -- Location preferences (Turkish cities)
  IF query_text ~* 'istanbul|İstanbul' THEN
    intent := jsonb_set(intent, '{location}', '"istanbul"');
  ELSIF query_text ~* 'ankara|Ankara' THEN
    intent := jsonb_set(intent, '{location}', '"ankara"');
  ELSIF query_text ~* 'izmir|İzmir' THEN
    intent := jsonb_set(intent, '{location}', '"izmir"');
  ELSIF query_text ~* 'antalya|Antalya' THEN
    intent := jsonb_set(intent, '{location}', '"antalya"');
  END IF;

  -- Genre preferences (Turkish terms)
  IF query_text ~* 'konser|concert|müzik|music' THEN
    intent := jsonb_set(intent, '{genre}', '"music"');
  ELSIF query_text ~* 'tiyatro|theater|oyun|theatre' THEN
    intent := jsonb_set(intent, '{genre}', '"theater"');
  ELSIF query_text ~* 'stand up|komedi|comedy|gülmece' THEN
    intent := jsonb_set(intent, '{genre}', '"comedy"');
  ELSIF query_text ~* 'sergi|exhibition|galeri|sanat' THEN
    intent := jsonb_set(intent, '{genre}', '"exhibition"');
  ELSIF query_text ~* 'spor|sports|maç|futbol' THEN
    intent := jsonb_set(intent, '{genre}', '"sports"');
  END IF;

  RETURN intent;
END;
$$;

-- Trigger function for automatic content generation (ChatGPT Files pattern)
CREATE OR REPLACE FUNCTION private.embed_event_content() 
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
  batch_size INT = 5;
  timeout_milliseconds INT = 5 * 60 * 1000; -- 5 minutes
  batch_count INT;
BEGIN
  -- Calculate number of batches needed
  batch_count := ceiling((SELECT count(*) FROM inserted) / batch_size::float);
  
  -- Loop through each batch and invoke Edge Function for content generation
  FOR i IN 0 .. (batch_count-1) LOOP
    PERFORM
      net.http_post(
        url := supabase_url() || '/functions/v1/generate-event-content',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', current_setting('request.headers')::json->>'authorization'
        ),
        body := jsonb_build_object(
          'eventIds', (
            SELECT json_agg(ue.id) 
            FROM (
              SELECT id FROM inserted 
              LIMIT batch_size OFFSET i * batch_size
            ) ue
          ),
          'table', 'event_knowledge_sections',
          'contentColumn', 'content',
          'embeddingColumn', 'embedding'
        ),
        timeout_milliseconds := timeout_milliseconds
      );
  END LOOP;

  RETURN NULL;
END;
$$;

-- Create trigger for automatic processing when events are inserted/updated
CREATE TRIGGER embed_event_knowledge
  AFTER INSERT ON unique_events
  REFERENCING NEW TABLE AS inserted
  FOR EACH STATEMENT
  EXECUTE PROCEDURE private.embed_event_content();

-- Function to manually regenerate content for specific events
CREATE OR REPLACE FUNCTION regenerate_event_content(target_event_ids UUID[])
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  processed_count INT := 0;
  event_id UUID;
BEGIN
  -- Delete existing knowledge sections for target events
  DELETE FROM event_knowledge_sections 
  WHERE event_id = ANY(target_event_ids);
  
  -- Insert placeholder records to trigger content generation
  FOR event_id IN SELECT unnest(target_event_ids) LOOP
    INSERT INTO event_knowledge_sections (event_id, content, embedding)
    VALUES (event_id, 'PLACEHOLDER_CONTENT', '[0]'::vector);
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$;

-- Add helpful comments
COMMENT ON TABLE event_knowledge_sections IS 'Turkish-optimized event knowledge base with cultural context and semantic search';
COMMENT ON FUNCTION search_turkish_events IS 'Semantic search optimized for Turkish language and cultural patterns';
COMMENT ON FUNCTION detect_turkish_query_intent IS 'Detects user intent from Turkish natural language queries';
COMMENT ON FUNCTION regenerate_event_content IS 'Manually regenerate content and embeddings for specific events';

-- Grant necessary permissions
GRANT SELECT ON event_knowledge_sections TO authenticated, anon;
GRANT USAGE ON SCHEMA private TO authenticated, anon;