# Social Media Time-Capsule for Events

## Concept Overview

Transform the event entertainment platform into a living, interactive catalog where users create personal archives — "time capsules" — of their event experiences. This system integrates seamlessly with the existing event aggregation platform, adding social layers for community sharing, discovery, and re-engagement.

## Tech Stack Integration

### Current Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL with PostGIS, Auth, Realtime, Storage)
- **Map**: Mapbox GL JS
- **AI**: OpenAI API for embeddings and recommendations
- **Authentication**: Supabase Auth with cookie-based sessions

## Core User Features

### 1. Personal Event Journal (Time Capsule)

Users can create rich media memories:
- **Media Uploads**: Videos, images, short clips stored in Supabase Storage
- **Personal Reflections**: Reviews, ratings, emotional tags
- **Structured Timeline**: Entries linked to `unique_events`, `canonical_venues`, and artists

### 2. Enhanced User Profile Dashboard

Building on the existing `/protected` route:
```typescript
interface UserProfile {
  id: string; // Supabase auth.users.id
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  preferences: {
    genres: string[];
    favorite_venues: string[];
    followed_artists: string[];
  };
  stats: {
    events_attended: number;
    capsules_created: number;
    cities_visited: number;
    genres_explored: number;
  };
  created_at: string;
  updated_at: string;
}
```

### 3. Event Discovery & Notifications

Leveraging existing event data:
- **Saved Events**: Track RSVPs and interested status
- **Smart Notifications**: Price changes, lineup updates via Supabase Realtime
- **AI-Powered Recommendations**: Use existing embeddings infrastructure

### 4. Social Layer

Community features:
- **Friend System**: Follow/connect with other attendees
- **Group Events**: Coordinate attendance
- **Map Integration**: Show friends' planned events on existing Mapbox implementation

## Database Schema (Supabase)

### New Tables

```sql
-- User profiles extending Supabase Auth
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  preferences JSONB DEFAULT '{"genres": [], "favorite_venues": [], "followed_artists": []}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-event relationships
CREATE TABLE user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES unique_events(id),
  status TEXT CHECK (status IN ('attended', 'going', 'interested', 'maybe')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Time capsule entries
CREATE TABLE capsule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES unique_events(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  reflection TEXT,
  media_urls JSONB DEFAULT '[]',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social connections
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Event aggregates for analytics
CREATE TABLE event_aggregates (
  event_id UUID PRIMARY KEY REFERENCES unique_events(id),
  attendee_count INTEGER DEFAULT 0,
  going_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  capsule_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_event_id ON user_events(event_id);
CREATE INDEX idx_capsule_entries_event_id ON capsule_entries(event_id);
CREATE INDEX idx_user_connections_user_id ON user_connections(user_id);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view public profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- User events policies
CREATE POLICY "Users can view own events" ON user_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own events" ON user_events
  FOR ALL USING (auth.uid() = user_id);

-- Capsule entries policies
CREATE POLICY "View public capsules" ON capsule_entries
  FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can manage own capsules" ON capsule_entries
  FOR ALL USING (auth.uid() = user_id);
```

## API Routes (Next.js App Router)

### User Profile Routes
```typescript
// app/api/profile/route.ts
GET /api/profile - Get current user profile
PUT /api/profile - Update profile
GET /api/profile/[username] - Get public profile

// app/api/events/social/route.ts
POST /api/events/[id]/rsvp - Set attendance status
GET /api/events/[id]/attendees - Get event attendees
POST /api/events/[id]/capsule - Create capsule entry

// app/api/social/route.ts
GET /api/social/friends - Get user connections
POST /api/social/connect - Send friend request
PUT /api/social/connect/[id] - Accept/reject request
```

## Component Architecture

### New Components Structure
```
components/
├── social/
│   ├── user-profile-card.tsx      # Profile display widget
│   ├── event-rsvp-button.tsx      # RSVP/Going/Interested toggle
│   ├── capsule-form.tsx           # Media upload & reflection form
│   ├── capsule-gallery.tsx        # Event memories display
│   ├── friend-list.tsx            # Social connections
│   └── event-attendees-list.tsx   # Who's going display
├── dashboard/
│   ├── profile-stats.tsx          # User statistics
│   ├── event-timeline.tsx         # Personal event history
│   └── saved-events.tsx           # Upcoming saved events
```

## Integration with Existing Features

### Enhanced Map View
```typescript
// Extend existing map to show social data
interface SocialMapFeatures {
  showFriendsEvents: boolean;
  showTrendingVenues: boolean;
  personalHeatmap: boolean; // Show user's event history
}
```

### AI Chatbot Integration
Extend the existing chatbot to include:
- Personal event recommendations based on history
- Friend activity summaries
- Event memory search ("Show me rock concerts I attended in 2024")

### Real-time Features (Supabase Realtime)
```typescript
// Subscribe to event updates
const channel = supabase
  .channel('event-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'event_aggregates',
    filter: `event_id=eq.${eventId}`
  }, (payload) => {
    // Update UI with new attendee counts
  })
  .subscribe();
```

## Authentication Enhancement

### Social Login Providers
Configure additional Supabase Auth providers:
```typescript
// lib/supabase/auth-providers.ts
export const socialProviders = [
  { name: 'google', icon: GoogleIcon },
  { name: 'spotify', icon: SpotifyIcon }, // For music preferences
  { name: 'twitter', icon: TwitterIcon }
];
```

### Protected Routes Structure
```
app/
├── protected/
│   ├── profile/           # User profile management
│   ├── events/            # Personal event dashboard
│   ├── capsules/          # Time capsule gallery
│   └── social/            # Friends & connections
```

## Performance Optimizations

### Caching Strategy
- Use Next.js caching for user profiles
- Implement Redis for aggregated stats (via Upstash)
- CDN for media uploads (Supabase Storage + CDN)

### Database Optimizations
- Materialized views for event statistics
- Partial indexes for active events
- Connection pooling via Supabase

## Privacy & Security

### Data Protection
- GDPR-compliant data handling
- User content moderation pipeline
- Rate limiting on API routes
- Input sanitization for user-generated content

### Content Visibility Levels
```typescript
enum Visibility {
  PUBLIC = 'public',      // Anyone can see
  FRIENDS = 'friends',    // Only connections
  PRIVATE = 'private'     // Only user
}
```

## Deployment Considerations

### Environment Variables
```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=

# New social features
NEXT_PUBLIC_UPLOAD_SIZE_LIMIT=10485760  # 10MB
NEXT_PUBLIC_SOCIAL_FEATURES_ENABLED=true
```

### Migration Strategy
1. Deploy database migrations via Supabase CLI
2. Gradual feature rollout with feature flags
3. A/B testing for social features adoption

## Future Enhancements

### Phase 2 Features
- Event photo walls (community galleries)
- Virtual event badges/achievements
- Spotify integration for music taste matching
- Event recap emails with AI summaries

### Phase 3 Features
- Artist fan clubs within the platform
- Venue loyalty programs
- Group booking discounts
- Event merchandise integration

## Success Metrics

### Key Performance Indicators
- User engagement rate (capsules/event)
- Social graph growth (connections/user)
- Return user rate
- Content creation velocity
- RSVP to attendance conversion

### Analytics Implementation
```typescript
// Track user interactions
interface EventAnalytics {
  event: 'rsvp_created' | 'capsule_uploaded' | 'friend_added';
  properties: {
    event_id?: string;
    user_id: string;
    timestamp: string;
    metadata?: Record<string, any>;
  };
}
```

## Development Workflow

### Git Branch Strategy
```bash
# Feature development
git checkout -b feature/social-login
git checkout -b feature/user-profiles
git checkout -b feature/capsule-system

# Never push to main directly
# Use PR workflow for production deployment
```

### Testing Requirements
- Unit tests for authentication flows
- Integration tests for social features
- E2E tests for critical user journeys
- Performance testing for media uploads

---

This implementation plan aligns with the existing Next.js/Supabase architecture while adding robust social features that enhance user engagement and create a living memory of Turkey's entertainment scene.