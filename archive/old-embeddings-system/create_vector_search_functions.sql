-- Create vector search functions for event recommendations
-- Run this in your Supabase SQL editor

-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Function to search for similar events using vector similarity
CREATE OR REPLACE FUNCTION search_similar_events(
  query_embedding vector(384),
  similarity_threshold float DEFAULT 0.7,
  result_limit int DEFAULT 10
)
RETURNS TABLE (
  event_id uuid,
  similarity float,
  content text
) LANGUAGE sql STABLE AS $$
  SELECT 
    event_id,
    1 - (embedding <=> query_embedding) as similarity,
    content
  FROM unique_events_embeddings
  WHERE 1 - (embedding <=> query_embedding) > similarity_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT result_limit;
$$;

-- Function to get embedding for a specific event
CREATE OR REPLACE FUNCTION get_event_embedding(target_event_id uuid)
RETURNS TABLE (
  id uuid,
  event_id uuid,
  embedding vector(384),
  content text,
  created_at timestamptz,
  updated_at timestamptz
) LANGUAGE sql STABLE AS $$
  SELECT id, event_id, embedding, content, created_at, updated_at
  FROM unique_events_embeddings
  WHERE event_id = target_event_id;
$$;

-- Function to find events similar to a specific event
CREATE OR REPLACE FUNCTION find_similar_events(
  reference_event_id uuid,
  similarity_threshold float DEFAULT 0.7,
  result_limit int DEFAULT 10
)
RETURNS TABLE (
  event_id uuid,
  similarity float,
  content text
) LANGUAGE sql STABLE AS $$
  WITH reference_embedding AS (
    SELECT embedding
    FROM unique_events_embeddings
    WHERE event_id = reference_event_id
    LIMIT 1
  )
  SELECT 
    e.event_id,
    1 - (e.embedding <=> r.embedding) as similarity,
    e.content
  FROM unique_events_embeddings e
  CROSS JOIN reference_embedding r
  WHERE e.event_id != reference_event_id
    AND 1 - (e.embedding <=> r.embedding) > similarity_threshold
  ORDER BY e.embedding <=> r.embedding
  LIMIT result_limit;
$$;

-- Function for hybrid search combining vector similarity with metadata filters
CREATE OR REPLACE FUNCTION hybrid_search_events(
  query_embedding vector(384),
  genre_filter text DEFAULT NULL,
  city_filter text DEFAULT NULL,
  date_from timestamptz DEFAULT NOW(),
  date_to timestamptz DEFAULT NULL,
  similarity_threshold float DEFAULT 0.5,
  result_limit int DEFAULT 20
)
RETURNS TABLE (
  event_id uuid,
  event_name text,
  event_date timestamptz,
  event_genre text,
  venue_name text,
  venue_city text,
  similarity float,
  content text
) LANGUAGE sql STABLE AS $$
  SELECT 
    ue.id as event_id,
    ue.name as event_name,
    ue.date as event_date,
    ue.genre as event_genre,
    cv.name as venue_name,
    cv.city as venue_city,
    1 - (uee.embedding <=> query_embedding) as similarity,
    uee.content
  FROM unique_events_embeddings uee
  JOIN unique_events ue ON uee.event_id = ue.id
  JOIN canonical_venues cv ON ue.canonical_venue_id = cv.id
  WHERE 
    ue.date >= date_from
    AND (date_to IS NULL OR ue.date <= date_to)
    AND (genre_filter IS NULL OR ue.genre ILIKE '%' || genre_filter || '%')
    AND (city_filter IS NULL OR cv.city ILIKE '%' || city_filter || '%')
    AND 1 - (uee.embedding <=> query_embedding) > similarity_threshold
  ORDER BY uee.embedding <=> query_embedding
  LIMIT result_limit;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_embeddings_event_id ON unique_events_embeddings(event_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON unique_events_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Add helpful comments
COMMENT ON FUNCTION search_similar_events IS 'Search for events using vector similarity with cosine distance';
COMMENT ON FUNCTION find_similar_events IS 'Find events similar to a reference event using vector embeddings';
COMMENT ON FUNCTION hybrid_search_events IS 'Combine vector similarity search with metadata filtering for enhanced results';