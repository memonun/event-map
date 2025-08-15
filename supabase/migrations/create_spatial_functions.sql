-- Create spatial functions for efficient event discovery
-- These functions should be run in your Supabase SQL editor

-- Function to get events near a specific location
CREATE OR REPLACE FUNCTION get_events_near_location(
  search_lat FLOAT,
  search_lng FLOAT,
  radius_meters INT DEFAULT 5000,
  result_limit INT DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  canonical_venue_id UUID,
  date TIMESTAMPTZ,
  genre TEXT,
  artist TEXT[],
  description TEXT,
  providers TEXT[],
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  biletinial_event_id BIGINT,
  biletix_event_id BIGINT,
  passo_event_id BIGINT,
  bugece_event_id BIGINT,
  bubilet_event_id BIGINT,
  venue_id UUID,
  venue_name TEXT,
  venue_city TEXT,
  venue_capacity INT,
  venue_coordinates JSONB,
  distance_meters FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.canonical_venue_id,
    e.date,
    e.genre,
    e.artist,
    e.description,
    e.providers,
    e.status,
    e.created_at,
    e.updated_at,
    e.biletinial_event_id,
    e.biletix_event_id,
    e.passo_event_id,
    e.bugece_event_id,
    e.bubilet_event_id,
    v.id as venue_id,
    v.name as venue_name,
    v.city as venue_city,
    v.capacity as venue_capacity,
    v.coordinates as venue_coordinates,
    ST_Distance(
      ST_MakePoint((v.coordinates->>'lng')::float, (v.coordinates->>'lat')::float)::geography,
      ST_MakePoint(search_lng, search_lat)::geography
    ) as distance_meters
  FROM unique_events e
  JOIN canonical_venues v ON e.canonical_venue_id = v.id
  WHERE 
    v.coordinates IS NOT NULL
    AND e.date > NOW()
    AND ST_DWithin(
      ST_MakePoint((v.coordinates->>'lng')::float, (v.coordinates->>'lat')::float)::geography,
      ST_MakePoint(search_lng, search_lat)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC
  LIMIT result_limit;
END;
$$;

-- Function to get venues near a location
CREATE OR REPLACE FUNCTION get_venues_near_location(
  search_lat FLOAT,
  search_lng FLOAT,
  radius_meters INT DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  city TEXT,
  capacity INT,
  coordinates JSONB,
  created_at TIMESTAMPTZ,
  distance_meters FLOAT,
  event_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.name,
    v.city,
    v.capacity,
    v.coordinates,
    v.created_at,
    ST_Distance(
      ST_MakePoint((v.coordinates->>'lng')::float, (v.coordinates->>'lat')::float)::geography,
      ST_MakePoint(search_lng, search_lat)::geography
    ) as distance_meters,
    COUNT(e.id) as event_count
  FROM canonical_venues v
  LEFT JOIN unique_events e ON v.id = e.canonical_venue_id AND e.date > NOW()
  WHERE 
    v.coordinates IS NOT NULL
    AND ST_DWithin(
      ST_MakePoint((v.coordinates->>'lng')::float, (v.coordinates->>'lat')::float)::geography,
      ST_MakePoint(search_lng, search_lat)::geography,
      radius_meters
    )
  GROUP BY v.id, v.name, v.city, v.capacity, v.coordinates, v.created_at
  ORDER BY distance_meters ASC;
END;
$$;

-- Function to get events within map bounds
CREATE OR REPLACE FUNCTION get_events_in_bounds(
  north_lat FLOAT,
  south_lat FLOAT,
  east_lng FLOAT,
  west_lng FLOAT,
  result_limit INT DEFAULT 500
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  canonical_venue_id UUID,
  date TIMESTAMPTZ,
  genre TEXT,
  artist TEXT[],
  description TEXT,
  providers TEXT[],
  status TEXT,
  venue_id UUID,
  venue_name TEXT,
  venue_city TEXT,
  venue_capacity INT,
  venue_coordinates JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.canonical_venue_id,
    e.date,
    e.genre,
    e.artist,
    e.description,
    e.providers,
    e.status,
    v.id as venue_id,
    v.name as venue_name,
    v.city as venue_city,
    v.capacity as venue_capacity,
    v.coordinates as venue_coordinates
  FROM unique_events e
  JOIN canonical_venues v ON e.canonical_venue_id = v.id
  WHERE 
    v.coordinates IS NOT NULL
    AND e.date > NOW()
    AND (v.coordinates->>'lat')::float BETWEEN south_lat AND north_lat
    AND (v.coordinates->>'lng')::float BETWEEN west_lng AND east_lng
  ORDER BY e.date ASC
  LIMIT result_limit;
END;
$$;

-- Function to get popular genres with event counts
CREATE OR REPLACE FUNCTION get_popular_genres(result_limit INT DEFAULT 20)
RETURNS TABLE (
  genre TEXT,
  count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.genre,
    COUNT(*) as count
  FROM unique_events e
  WHERE 
    e.genre IS NOT NULL 
    AND e.date > NOW()
  GROUP BY e.genre
  ORDER BY count DESC
  LIMIT result_limit;
END;
$$;

-- Function to get cities with venue counts
CREATE OR REPLACE FUNCTION get_cities_with_venues()
RETURNS TABLE (
  city TEXT,
  venue_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.city,
    COUNT(*) as venue_count
  FROM canonical_venues v
  WHERE v.city IS NOT NULL
  GROUP BY v.city
  ORDER BY venue_count DESC;
END;
$$;

-- Function to get venue statistics
CREATE OR REPLACE FUNCTION get_venue_statistics(venue_id UUID)
RETURNS TABLE (
  total_events BIGINT,
  upcoming_events BIGINT,
  genres TEXT[],
  avg_capacity_usage FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE e.date > NOW()) as upcoming_events,
    array_agg(DISTINCT e.genre) FILTER (WHERE e.genre IS NOT NULL) as genres,
    NULL::FLOAT as avg_capacity_usage -- TODO: Calculate based on price/ticket data
  FROM unique_events e
  WHERE e.canonical_venue_id = venue_id;
END;
$$;

-- Function to get venue average price
CREATE OR REPLACE FUNCTION get_venue_average_price(venue_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
AS $$
DECLARE
  avg_price FLOAT;
BEGIN
  -- This is a simplified version - in production you'd want to calculate
  -- average prices across all platforms for events at this venue
  SELECT AVG(
    CASE 
      WHEN bp.price IS NOT NULL THEN bp.price
      ELSE NULL
    END
  ) INTO avg_price
  FROM unique_events e
  LEFT JOIN ticketing_platforms_raw_data.bubilet_prices bp ON e.bubilet_event_id = bp.event_id
  WHERE e.canonical_venue_id = venue_id
  AND e.date > NOW()
  AND bp.snapshot_id = (
    SELECT MAX(snapshot_id) 
    FROM ticketing_platforms_raw_data.bubilet_prices 
    WHERE event_id = bp.event_id
  );
  
  RETURN avg_price;
END;
$$;

-- Function to get genre price trends
CREATE OR REPLACE FUNCTION get_genre_price_trends(
  target_genre TEXT,
  days_back INT DEFAULT 90
)
RETURNS TABLE (
  date DATE,
  avg_price FLOAT,
  event_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(e.date) as date,
    AVG(bp.price) as avg_price,
    COUNT(DISTINCT e.id) as event_count
  FROM unique_events e
  LEFT JOIN ticketing_platforms_raw_data.bubilet_prices bp ON e.bubilet_event_id = bp.event_id
  WHERE 
    e.genre = target_genre
    AND e.date BETWEEN (NOW() - INTERVAL '1 day' * days_back) AND NOW()
    AND bp.snapshot_id = (
      SELECT MAX(snapshot_id) 
      FROM ticketing_platforms_raw_data.bubilet_prices 
      WHERE event_id = bp.event_id
    )
  GROUP BY DATE(e.date)
  ORDER BY date DESC;
END;
$$;

-- Function to get top artists by event count
CREATE OR REPLACE FUNCTION get_top_artists_by_events(result_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  artists_name TEXT,
  normalized_name TEXT,
  spotify_link TEXT,
  genre TEXT[],
  event_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.artists_name,
    a.normalized_name,
    a.spotify_link,
    a.genre,
    COUNT(ea.event_id) as event_count
  FROM artists.artists a
  JOIN artists.event_artists ea ON a.id = ea.artist_id
  JOIN unique_events e ON ea.event_id = e.id
  WHERE e.date > NOW()
  GROUP BY a.id, a.artists_name, a.normalized_name, a.spotify_link, a.genre
  ORDER BY event_count DESC
  LIMIT result_limit;
END;
$$;

-- Function to get artist popularity metrics
CREATE OR REPLACE FUNCTION get_artist_popularity_metrics(artist_id UUID)
RETURNS TABLE (
  monthly_listeners INT,
  followers INT,
  event_count BIGINT,
  upcoming_events BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uap.monthly_listeners,
    uap.followers,
    COUNT(ea.event_id) as event_count,
    COUNT(ea.event_id) FILTER (WHERE e.date > NOW()) as upcoming_events
  FROM artists.artists a
  LEFT JOIN canonical_artists ca ON a.normalized_name = ca.normalized_name
  LEFT JOIN unified_artist_profile uap ON ca.unified_profile_id = uap.uuid
  LEFT JOIN artists.event_artists ea ON a.id = ea.artist_id
  LEFT JOIN unique_events e ON ea.event_id = e.id
  WHERE a.id = artist_id
  GROUP BY uap.monthly_listeners, uap.followers;
END;
$$;

-- Function to get similar artists (based on shared events/venues)
CREATE OR REPLACE FUNCTION get_similar_artists(
  target_artist_id UUID,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  artists_name TEXT,
  normalized_name TEXT,
  spotify_link TEXT,
  genre TEXT[],
  shared_venues BIGINT,
  similarity_score FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH target_venues AS (
    SELECT DISTINCT e.canonical_venue_id
    FROM artists.event_artists ea
    JOIN unique_events e ON ea.event_id = e.id
    WHERE ea.artist_id = target_artist_id
  ),
  artist_venue_overlap AS (
    SELECT 
      a.id,
      a.artists_name,
      a.normalized_name,
      a.spotify_link,
      a.genre,
      COUNT(DISTINCT e.canonical_venue_id) as shared_venues
    FROM artists.artists a
    JOIN artists.event_artists ea ON a.id = ea.artist_id
    JOIN unique_events e ON ea.event_id = e.id
    WHERE 
      a.id != target_artist_id
      AND e.canonical_venue_id IN (SELECT canonical_venue_id FROM target_venues)
    GROUP BY a.id, a.artists_name, a.normalized_name, a.spotify_link, a.genre
  )
  SELECT 
    avo.id,
    avo.artists_name,
    avo.normalized_name,
    avo.spotify_link,
    avo.genre,
    avo.shared_venues,
    (avo.shared_venues::FLOAT / (SELECT COUNT(*) FROM target_venues)::FLOAT) as similarity_score
  FROM artist_venue_overlap avo
  WHERE avo.shared_venues > 0
  ORDER BY similarity_score DESC, avo.shared_venues DESC
  LIMIT result_limit;
END;
$$;