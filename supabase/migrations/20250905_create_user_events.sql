-- Migration: Create User Events System (Phase 2)
-- Description: Adds user-event interaction capabilities (RSVP, attendance tracking)

-- User-event relationships table
CREATE TABLE IF NOT EXISTS public.user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.unique_events(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN (
    -- Future event statuses
    'going',        -- User will attend
    'interested',   -- User is interested
    'maybe',        -- User is undecided
    'not_going',    -- User explicitly not attending
    -- Past event statuses
    'attended',     -- User attended the event
    'missed',       -- Had plans but couldn't go
    'wish_went'     -- Regrets missing it
  )) NOT NULL,
  -- Additional interaction data
  reminder_set BOOLEAN DEFAULT false,
  reminder_time TIMESTAMPTZ,
  price_alert BOOLEAN DEFAULT false,
  price_threshold DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Event aggregates table for social proof
CREATE TABLE IF NOT EXISTS public.event_aggregates (
  event_id UUID PRIMARY KEY REFERENCES public.unique_events(id) ON DELETE CASCADE,
  attendee_count INTEGER DEFAULT 0,
  going_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  maybe_count INTEGER DEFAULT 0,
  attended_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User event lists/collections
CREATE TABLE IF NOT EXISTS public.user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false, -- For system lists like "Wishlist"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many relationship for lists and events
CREATE TABLE IF NOT EXISTS public.list_events (
  list_id UUID NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.unique_events(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  PRIMARY KEY (list_id, event_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_id ON public.user_events(event_id);
CREATE INDEX IF NOT EXISTS idx_user_events_status ON public.user_events(status);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_aggregates_event_id ON public.event_aggregates(event_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON public.user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_events_list_id ON public.list_events(list_id);
CREATE INDEX IF NOT EXISTS idx_list_events_event_id ON public.list_events(event_id);

-- Enable Row Level Security
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_events
CREATE POLICY "Users can view own event interactions" 
  ON public.user_events FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own event interactions" 
  ON public.user_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own event interactions" 
  ON public.user_events FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own event interactions" 
  ON public.user_events FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for event_aggregates (read-only for users)
CREATE POLICY "Anyone can view event aggregates" 
  ON public.event_aggregates FOR SELECT 
  USING (true);

-- RLS Policies for user_lists
CREATE POLICY "Users can view own lists" 
  ON public.user_lists FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own lists" 
  ON public.user_lists FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" 
  ON public.user_lists FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" 
  ON public.user_lists FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for list_events
CREATE POLICY "Users can view events in accessible lists" 
  ON public.list_events FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_lists ul 
      WHERE ul.id = list_id 
      AND (ul.user_id = auth.uid() OR ul.is_public = true)
    )
  );

CREATE POLICY "Users can add events to own lists" 
  ON public.list_events FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_lists ul 
      WHERE ul.id = list_id 
      AND ul.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove events from own lists" 
  ON public.list_events FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_lists ul 
      WHERE ul.id = list_id 
      AND ul.user_id = auth.uid()
    )
  );

-- Function to update event aggregates when user_events changes
CREATE OR REPLACE FUNCTION public.update_event_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new aggregates
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.event_aggregates (
      event_id, 
      going_count, 
      interested_count, 
      maybe_count,
      attended_count,
      last_activity_at,
      updated_at
    )
    SELECT 
      COALESCE(NEW.event_id, OLD.event_id),
      COUNT(*) FILTER (WHERE status = 'going'),
      COUNT(*) FILTER (WHERE status = 'interested'),
      COUNT(*) FILTER (WHERE status = 'maybe'),
      COUNT(*) FILTER (WHERE status = 'attended'),
      NOW(),
      NOW()
    FROM public.user_events
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    ON CONFLICT (event_id) DO UPDATE SET
      going_count = EXCLUDED.going_count,
      interested_count = EXCLUDED.interested_count,
      maybe_count = EXCLUDED.maybe_count,
      attended_count = EXCLUDED.attended_count,
      last_activity_at = EXCLUDED.last_activity_at,
      updated_at = EXCLUDED.updated_at;
  ELSIF TG_OP = 'DELETE' THEN
    -- Recalculate after deletion
    UPDATE public.event_aggregates
    SET 
      going_count = (SELECT COUNT(*) FROM public.user_events WHERE event_id = OLD.event_id AND status = 'going'),
      interested_count = (SELECT COUNT(*) FROM public.user_events WHERE event_id = OLD.event_id AND status = 'interested'),
      maybe_count = (SELECT COUNT(*) FROM public.user_events WHERE event_id = OLD.event_id AND status = 'maybe'),
      attended_count = (SELECT COUNT(*) FROM public.user_events WHERE event_id = OLD.event_id AND status = 'attended'),
      updated_at = NOW()
    WHERE event_id = OLD.event_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic aggregate updates
CREATE TRIGGER trigger_update_event_aggregates
  AFTER INSERT OR UPDATE OR DELETE ON public.user_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_aggregates();

-- Function to get user's event status
CREATE OR REPLACE FUNCTION public.get_user_event_status(p_user_id UUID, p_event_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status
  FROM public.user_events
  WHERE user_id = p_user_id AND event_id = p_event_id;
  
  RETURN v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get event social stats
CREATE OR REPLACE FUNCTION public.get_event_social_stats(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'going_count', COALESCE(ea.going_count, 0),
    'interested_count', COALESCE(ea.interested_count, 0),
    'maybe_count', COALESCE(ea.maybe_count, 0),
    'attended_count', COALESCE(ea.attended_count, 0),
    'total_engagement', COALESCE(ea.going_count + ea.interested_count + ea.maybe_count, 0)
  ) INTO result
  FROM public.event_aggregates ea
  WHERE ea.event_id = p_event_id;
  
  IF result IS NULL THEN
    result := json_build_object(
      'going_count', 0,
      'interested_count', 0,
      'maybe_count', 0,
      'attended_count', 0,
      'total_engagement', 0
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default lists for new users
CREATE OR REPLACE FUNCTION public.create_default_user_lists()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default "Wishlist" for new user
  INSERT INTO public.user_lists (user_id, name, description, is_default, is_public)
  VALUES 
    (NEW.id, 'Wishlist', 'Events I want to attend', true, false),
    (NEW.id, 'Attended', 'Events I have been to', true, false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to create default lists when user profile is created
CREATE TRIGGER on_user_profile_created_create_lists
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_user_lists();

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_user_events
  BEFORE UPDATE ON public.user_events
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at_user_lists
  BEFORE UPDATE ON public.user_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.user_events IS 'User interactions with events (RSVP, attendance, etc.)';
COMMENT ON TABLE public.event_aggregates IS 'Aggregated statistics for event engagement';
COMMENT ON TABLE public.user_lists IS 'User-created event collections and lists';
COMMENT ON TABLE public.list_events IS 'Events saved to user lists';
COMMENT ON FUNCTION public.get_user_event_status IS 'Get user RSVP status for an event';
COMMENT ON FUNCTION public.get_event_social_stats IS 'Get social engagement statistics for an event';