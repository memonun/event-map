-- Migration: Create User Connections (Friends System)
-- Description: Adds friend connections and social features to complement user events

-- User connections for friend system (enhanced version)
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id),
  CHECK (user_id != connected_user_id)
);

-- Friend activity feed table
CREATE TABLE IF NOT EXISTS public.friend_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT CHECK (activity_type IN (
    'event_rsvp', 'event_attended', 'event_rated', 
    'friend_connected', 'list_created'
  )) NOT NULL,
  event_id UUID REFERENCES public.unique_events(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached friend suggestions
CREATE TABLE IF NOT EXISTS public.friend_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT CHECK (reason IN (
    'mutual_friends', 'shared_events', 'same_city', 
    'similar_taste', 'manual_suggestion'
  )),
  score DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(user_id, suggested_user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON public.user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON public.user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);
CREATE INDEX IF NOT EXISTS idx_friend_activities_user_id ON public.friend_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_activities_created_at ON public.friend_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_activities_activity_type ON public.friend_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_friend_suggestions_user_id ON public.friend_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_suggestions_score ON public.friend_suggestions(score DESC);

-- Enable Row Level Security
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_connections
CREATE POLICY "Users can view own connections and connections to them" 
  ON public.user_connections FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connection requests" 
  ON public.user_connections FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND auth.uid() = requested_by);

CREATE POLICY "Users can update connection status" 
  ON public.user_connections FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can remove connections" 
  ON public.user_connections FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- RLS Policies for friend_activities
CREATE POLICY "Users can view activities from friends" 
  ON public.friend_activities FOR SELECT 
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_connections uc
      WHERE uc.status = 'accepted'
      AND ((uc.user_id = auth.uid() AND uc.connected_user_id = friend_activities.user_id)
           OR (uc.connected_user_id = auth.uid() AND uc.user_id = friend_activities.user_id))
    )
  );

CREATE POLICY "Users can create own activities" 
  ON public.friend_activities FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for friend_suggestions
CREATE POLICY "Users can view own suggestions" 
  ON public.friend_suggestions FOR SELECT 
  USING (auth.uid() = user_id);

-- Function to get user's friends
CREATE OR REPLACE FUNCTION public.get_user_friends(p_user_id UUID)
RETURNS TABLE (
  friend_id UUID,
  friend_profile JSONB,
  connection_date TIMESTAMPTZ,
  recent_events JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN uc.user_id = p_user_id THEN uc.connected_user_id
      ELSE uc.user_id
    END as friend_id,
    json_build_object(
      'id', up.id,
      'username', up.username,
      'display_name', up.display_name,
      'avatar_url', up.avatar_url
    ) as friend_profile,
    uc.created_at as connection_date,
    COALESCE((
      SELECT json_agg(
        json_build_object(
          'event_id', ue.event_id,
          'status', ue.status,
          'event_name', e.name,
          'event_date', e.date,
          'created_at', ue.created_at
        ) ORDER BY ue.created_at DESC
      )
      FROM public.user_events ue
      JOIN public.unique_events e ON ue.event_id = e.id
      WHERE ue.user_id = CASE 
        WHEN uc.user_id = p_user_id THEN uc.connected_user_id
        ELSE uc.user_id
      END
      AND ue.created_at > NOW() - INTERVAL '30 days'
      LIMIT 4
    ), '[]'::json) as recent_events
  FROM public.user_connections uc
  JOIN public.user_profiles up ON up.id = CASE 
    WHEN uc.user_id = p_user_id THEN uc.connected_user_id
    ELSE uc.user_id
  END
  WHERE (uc.user_id = p_user_id OR uc.connected_user_id = p_user_id)
    AND uc.status = 'accepted'
  ORDER BY uc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's event activity with detailed info
CREATE OR REPLACE FUNCTION public.get_user_event_activity(p_user_id UUID, p_limit INT DEFAULT 20)
RETURNS TABLE (
  event_id UUID,
  event_name TEXT,
  event_date TIMESTAMPTZ,
  venue_name TEXT,
  venue_city TEXT,
  user_status TEXT,
  artists TEXT[],
  genre TEXT,
  image_url TEXT,
  interaction_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as event_id,
    e.name as event_name,
    e.date as event_date,
    v.name as venue_name,
    v.city as venue_city,
    ue.status as user_status,
    e.artist as artists,
    e.genre,
    e.image_url,
    ue.created_at as interaction_date
  FROM public.user_events ue
  JOIN public.unique_events e ON ue.event_id = e.id
  JOIN public.canonical_venues v ON e.canonical_venue_id = v.id
  WHERE ue.user_id = p_user_id
    AND ue.status IN ('attended', 'missed', 'wish_went')
  ORDER BY ue.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's upcoming events
CREATE OR REPLACE FUNCTION public.get_user_upcoming_events(p_user_id UUID, p_limit INT DEFAULT 20)
RETURNS TABLE (
  event_id UUID,
  event_name TEXT,
  event_date TIMESTAMPTZ,
  venue_name TEXT,
  venue_city TEXT,
  user_status TEXT,
  artists TEXT[],
  genre TEXT,
  image_url TEXT,
  interaction_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as event_id,
    e.name as event_name,
    e.date as event_date,
    v.name as venue_name,
    v.city as venue_city,
    ue.status as user_status,
    e.artist as artists,
    e.genre,
    e.image_url,
    ue.created_at as interaction_date
  FROM public.user_events ue
  JOIN public.unique_events e ON ue.event_id = e.id
  JOIN public.canonical_venues v ON e.canonical_venue_id = v.id
  WHERE ue.user_id = p_user_id
    AND ue.status IN ('going', 'interested', 'maybe')
    AND e.date > NOW()
  ORDER BY e.date ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record friend activity
CREATE OR REPLACE FUNCTION public.record_friend_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Record activity when user interacts with events
  IF TG_TABLE_NAME = 'user_events' THEN
    INSERT INTO public.friend_activities (
      user_id,
      activity_type,
      event_id,
      metadata,
      created_at
    )
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status IN ('going', 'interested', 'maybe') THEN 'event_rsvp'
        WHEN NEW.status = 'attended' THEN 'event_attended'
        ELSE 'event_rsvp'
      END,
      NEW.event_id,
      json_build_object('status', NEW.status),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity recording
CREATE TRIGGER record_user_event_activity
  AFTER INSERT OR UPDATE ON public.user_events
  FOR EACH ROW
  EXECUTE FUNCTION public.record_friend_activity();

-- Function to clean up old activities and suggestions
CREATE OR REPLACE FUNCTION public.cleanup_old_social_data()
RETURNS void AS $$
BEGIN
  -- Remove old friend activities (keep 3 months)
  DELETE FROM public.friend_activities
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Remove expired friend suggestions
  DELETE FROM public.friend_suggestions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_user_connections
  BEFORE UPDATE ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.user_connections IS 'Friend connections between users';
COMMENT ON TABLE public.friend_activities IS 'Activity feed for friends to see each others actions';
COMMENT ON TABLE public.friend_suggestions IS 'Cached friend suggestions with scoring';
COMMENT ON FUNCTION public.get_user_friends IS 'Get users friends with their recent event activity';
COMMENT ON FUNCTION public.get_user_event_activity IS 'Get users past event interactions';
COMMENT ON FUNCTION public.get_user_upcoming_events IS 'Get users future events by RSVP status';